#include "liblzma-node.hpp"
#include <node_buffer.h>
#include <cstring>
#include <cstdlib>
#include <cassert>

namespace lzma {
#ifdef LZMA_ASYNC_AVAILABLE
const bool LZMAStream::asyncCodeAvailable = true;
#else
const bool LZMAStream::asyncCodeAvailable = false;
#endif

namespace {
  extern "C" void* LZMA_API_CALL
  alloc_for_lzma(void *opaque, size_t nmemb, size_t size) {
    LZMAStream* strm = static_cast<LZMAStream*>(opaque);
    
    return strm->alloc(nmemb, size);
  }
  
  extern "C" void LZMA_API_CALL 
  free_for_lzma(void *opaque, void *ptr) {
    LZMAStream* strm = static_cast<LZMAStream*>(opaque);
    
    return strm->free(ptr);
  }
}

Nan::Persistent<Function> LZMAStream::constructor;

LZMAStream::LZMAStream() :
  bufsize(65536),
  shouldFinish(false),
  processedChunks(0),
  lastCodeResult(LZMA_OK) 
{
  std::memset(&_, 0, sizeof(lzma_stream));
  
  allocator.alloc = alloc_for_lzma;
  allocator.free = free_for_lzma;
  allocator.opaque = static_cast<void*>(this);
  _.allocator = &allocator;
#ifdef LZMA_ASYNC_AVAILABLE
  uv_mutex_init(&mutex);
  
  nonAdjustedExternalMemory = 0;
#endif
}

void LZMAStream::resetUnderlying() {
  if (_.internal)
    lzma_end(&_);
  
  reportAdjustedExternalMemoryToV8();
  std::memset(&_, 0, sizeof(lzma_stream));
  _.allocator = &allocator;
  lastCodeResult = LZMA_OK;
  processedChunks = 0;
}

LZMAStream::~LZMAStream() {
  resetUnderlying();
  
#ifdef LZMA_ASYNC_AVAILABLE
  uv_mutex_destroy(&mutex);
#endif

  Nan::AdjustExternalMemory(-int64_t(sizeof(LZMAStream)));
}

void* LZMAStream::alloc(size_t nmemb, size_t size) {
  size_t nBytes = nmemb * size + sizeof(size_t);
  
  size_t* result = static_cast<size_t*>(::malloc(nBytes));
  if (!result)
    return result;
  
  *result = nBytes;
  adjustExternalMemory(static_cast<int64_t>(nBytes));
  return static_cast<void*>(result + 1);
}

void LZMAStream::free(void* ptr) {
  if (!ptr)
    return;
  
  size_t* orig = static_cast<size_t*>(ptr) - 1;
  
  adjustExternalMemory(-static_cast<int64_t>(*orig));
  return ::free(static_cast<void*>(orig));
}

void LZMAStream::reportAdjustedExternalMemoryToV8() {
#ifdef LZMA_ASYNC_AVAILABLE
  if (nonAdjustedExternalMemory == 0)
    return;
  
  Nan::AdjustExternalMemory(nonAdjustedExternalMemory);
  nonAdjustedExternalMemory = 0;
#endif
}

void LZMAStream::adjustExternalMemory(int64_t bytesChange) {
#ifdef LZMA_ASYNC_AVAILABLE
  nonAdjustedExternalMemory += bytesChange;
#else
  Nan::AdjustExternalMemory(bytesChange);
#endif
}

#define LZMA_FETCH_SELF() \
  LZMAStream* self = NULL; \
  if (!info.This().IsEmpty() && info.This()->InternalFieldCount() > 0) { \
    self = Nan::ObjectWrap::Unwrap<LZMAStream>(info.This()); \
  } \
  if (!self) { \
    _failMissingSelf(info); \
    return; \
  } \
  struct _MemScopeGuard { \
    _MemScopeGuard(LZMAStream* self_) : self(self_) {} \
    ~_MemScopeGuard() { \
      self->reportAdjustedExternalMemoryToV8(); \
    } \
    \
    LZMAStream* self; \
  }; \
  _MemScopeGuard guard(self);

NAN_METHOD(LZMAStream::ResetUnderlying) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  self->resetUnderlying();
  
  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(LZMAStream::SetBufsize) {
  size_t oldBufsize, newBufsize = NumberToUint64ClampNullMax(info[0]);
  
  {
    LZMA_FETCH_SELF();
    LZMA_ASYNC_LOCK(self);
    
    oldBufsize = self->bufsize;
    
    if (newBufsize && newBufsize != UINT_MAX)
      self->bufsize = newBufsize;
  }
  
  info.GetReturnValue().Set(double(oldBufsize));
}

NAN_METHOD(LZMAStream::Code) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  self->reportAdjustedExternalMemoryToV8();
  std::vector<uint8_t> inputData;
  
  Local<Object> bufarg = Local<Object>::Cast(info[0]);
  if (bufarg.IsEmpty() || bufarg->IsUndefined() || bufarg->IsNull()) {
    self->shouldFinish = true;
  } else {
    if (!readBufferFromObj(bufarg, inputData)) {
      info.GetReturnValue().SetUndefined();
      return;
    }
    
    if (inputData.empty())
      self->shouldFinish = true;
  }
  
  self->inbufs.push(LZMA_NATIVE_MOVE(inputData));
  
  bool async = info[1]->BooleanValue();
  
  if (async) {
#ifdef LZMA_ASYNC_AVAILABLE
    Nan::AsyncQueueWorker(new LZMAStreamCodingWorker(self));
#else
    std::abort();
#endif
  } else {
    self->doLZMACode();
    self->invokeBufferHandlers(true);
  }
  
  info.GetReturnValue().SetUndefined();
}

void LZMAStream::invokeBufferHandlers(bool hasLock) {
#ifdef LZMA_ASYNC_AVAILABLE
  uv_mutex_guard lock(mutex, !hasLock);
#define POSSIBLY_LOCK_MX    do { if (!hasLock) lock.lock(); } while(0)
#define POSSIBLY_UNLOCK_MX  do { if (!hasLock) lock.unlock(); } while(0)
#else
#define POSSIBLY_LOCK_MX
#define POSSIBLY_UNLOCK_MX
#endif
  
  Nan::HandleScope scope;
  
  reportAdjustedExternalMemoryToV8();
  Local<Function> bufferHandler = Local<Function>::Cast(EmptyToUndefined(Nan::Get(handle(), NewString("bufferHandler"))));
  std::vector<uint8_t> outbuf;
  
#define CALL_BUFFER_HANDLER_WITH_ARGV \
  POSSIBLY_UNLOCK_MX; \
  bufferHandler->Call(handle(), 5, argv); \
  POSSIBLY_LOCK_MX;
  
  uint64_t in = UINT64_MAX, out = UINT64_MAX;
  if (_.internal)
    lzma_get_progress(&_, &in, &out);
  Local<Value> in_   = Uint64ToNumberMaxNull(in);
  Local<Value> out_  = Uint64ToNumberMaxNull(out);
  
  while (outbufs.size() > 0) {
    outbuf = LZMA_NATIVE_MOVE(outbufs.front());
    outbufs.pop();
    
    Local<Value> argv[5] = {
      Nan::CopyBuffer(reinterpret_cast<const char*>(outbuf.data()), outbuf.size()).ToLocalChecked(),
      Nan::Undefined(), Nan::Undefined(), in_, out_
    };
    CALL_BUFFER_HANDLER_WITH_ARGV
  }
  
  bool reset = false;
  if (lastCodeResult != LZMA_OK) {
    Local<Value> errorArg = Local<Value>(Nan::Null());
    
    if (lastCodeResult != LZMA_STREAM_END)
      errorArg = lzmaRetError(lastCodeResult);
    
    reset = true;
    
    Local<Value> argv[5] = { Nan::Null(), Nan::Undefined(), errorArg, in_, out_ };
    CALL_BUFFER_HANDLER_WITH_ARGV
  }
  
  if (processedChunks) {
    size_t pc = processedChunks;
    processedChunks = 0;
    
    Local<Value> argv[5] = { Nan::Undefined(), Nan::New<Integer>(uint32_t(pc)), Nan::Undefined(), in_, out_ };
    CALL_BUFFER_HANDLER_WITH_ARGV
  }
  
  if (reset)
    resetUnderlying(); // resets lastCodeResult!
}

void LZMAStream::doLZMACodeFromAsync() {
  LZMA_ASYNC_LOCK(this);
  
  doLZMACode();
}

void LZMAStream::doLZMACode() {
  std::vector<uint8_t> outbuf(bufsize), inbuf;
  _.next_out = outbuf.data();
  _.avail_out = outbuf.size();
  _.avail_in = 0;

  lzma_action action = LZMA_RUN;
  
  size_t readChunks = 0;
  
  // _.internal is set to NULL when lzma_end() is called via resetUnderlying()
  while (_.internal) {
    if (_.avail_in == 0) { // more input neccessary?
      while (_.avail_in == 0 && !inbufs.empty()) {
        inbuf = LZMA_NATIVE_MOVE(inbufs.front());
        inbufs.pop();
        readChunks++;
      
        _.next_in = inbuf.data();
        _.avail_in = inbuf.size();
      }
    }
    
    if (shouldFinish && inbufs.empty())
      action = LZMA_FINISH;
    
    _.next_out = outbuf.data();
    _.avail_out = outbuf.size();
    
    lastCodeResult = lzma_code(&_, action);
    
    if (lastCodeResult != LZMA_OK && lastCodeResult != LZMA_STREAM_END) {
      processedChunks += readChunks;
      readChunks = 0;
      
      break;
    }
    
    if (_.avail_out == 0 || _.avail_in == 0 || lastCodeResult == LZMA_STREAM_END) {
      size_t outsz = outbuf.size() - _.avail_out;
      
      if (outsz > 0) {
#ifndef LZMA_NO_CXX11_RVALUE_REFERENCES // C++11
        outbufs.emplace(outbuf.data(), outbuf.data() + outsz);
#else
        outbufs.push(std::vector<uint8_t>(outbuf.data(), outbuf.data() + outsz));
#endif
      }

      if (lastCodeResult == LZMA_STREAM_END) {
        processedChunks += readChunks;
        readChunks = 0;
        
        break;
      }
    }
    
    if (_.avail_out == outbuf.size()) { // no progress was made
      if (!shouldFinish) {
        processedChunks += readChunks;
        readChunks = 0;
      }

      
      if (!shouldFinish)
        break;
    }
  }
}

void LZMAStream::Init(Local<Object> exports) {
  Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
  tpl->SetClassName(NewString("LZMAStream"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  
  Nan::SetPrototypeMethod(tpl, "setBufsize", SetBufsize);
  Nan::SetPrototypeMethod(tpl, "resetUnderlying", ResetUnderlying);
  Nan::SetPrototypeMethod(tpl, "code", Code);
  Nan::SetPrototypeMethod(tpl, "memusage", Memusage);
  Nan::SetPrototypeMethod(tpl, "memlimitGet", MemlimitGet);
  Nan::SetPrototypeMethod(tpl, "memlimitSet", MemlimitSet);
  Nan::SetPrototypeMethod(tpl, "rawEncoder_", RawEncoder);
  Nan::SetPrototypeMethod(tpl, "rawDecoder_", RawDecoder);
  Nan::SetPrototypeMethod(tpl, "filtersUpdate", FiltersUpdate);
  Nan::SetPrototypeMethod(tpl, "easyEncoder_", EasyEncoder);
  Nan::SetPrototypeMethod(tpl, "streamEncoder_", StreamEncoder);
  Nan::SetPrototypeMethod(tpl, "aloneEncoder", AloneEncoder);
  Nan::SetPrototypeMethod(tpl, "mtEncoder_", MTEncoder);
  Nan::SetPrototypeMethod(tpl, "streamDecoder_", StreamDecoder);
  Nan::SetPrototypeMethod(tpl, "autoDecoder_", AutoDecoder);
  Nan::SetPrototypeMethod(tpl, "aloneDecoder_", AloneDecoder);
  
  constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
  exports->Set(NewString("Stream"), Nan::New<Function>(constructor));
}

NAN_METHOD(LZMAStream::New) {
  if (info.IsConstructCall()) {
    LZMAStream* self = new LZMAStream();
    if (!self) {
      Nan::ThrowRangeError("Out of memory, cannot create LZMAStream");
      info.GetReturnValue().SetUndefined();
      return;
    }
    
    self->Wrap(info.This());
    Nan::AdjustExternalMemory(sizeof(LZMAStream));
    
    info.GetReturnValue().Set(info.This());
  } else {
    info.GetReturnValue().Set(Nan::New<Function>(constructor)->NewInstance(0, NULL));
  }
}

void LZMAStream::_failMissingSelf(const Nan::FunctionCallbackInfo<Value>& info) {
  Nan::ThrowTypeError("LZMAStream methods need to be called on an LZMAStream object");
  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(LZMAStream::Memusage) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  info.GetReturnValue().Set(Uint64ToNumber0Null(lzma_memusage(&self->_)));
}

NAN_METHOD(LZMAStream::MemlimitGet) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  info.GetReturnValue().Set(Uint64ToNumber0Null(lzma_memlimit_get(&self->_)));
}

NAN_METHOD(LZMAStream::MemlimitSet) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  Local<Number> arg = Local<Number>::Cast(info[0]);
  if (info[0]->IsUndefined() || arg.IsEmpty()) {
    Nan::ThrowTypeError("memlimitSet() needs a numerical argument");
    info.GetReturnValue().SetUndefined();
    return;
  }
  
  info.GetReturnValue().Set(lzmaRet(lzma_memlimit_set(&self->_, NumberToUint64ClampNullMax(arg))));
}

NAN_METHOD(LZMAStream::RawEncoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  const FilterArray filters(Local<Array>::Cast(info[0]));
  
  info.GetReturnValue().Set(lzmaRet(lzma_raw_encoder(&self->_, filters.array())));
}

NAN_METHOD(LZMAStream::RawDecoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  const FilterArray filters(Local<Array>::Cast(info[0]));
  
  info.GetReturnValue().Set(lzmaRet(lzma_raw_decoder(&self->_, filters.array())));
}

NAN_METHOD(LZMAStream::FiltersUpdate) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  const FilterArray filters(Local<Array>::Cast(info[0]));
  
  info.GetReturnValue().Set(lzmaRet(lzma_filters_update(&self->_, filters.array())));
}

NAN_METHOD(LZMAStream::EasyEncoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  Local<Integer> preset = Local<Integer>::Cast(info[0]);
  Local<Integer> check = Local<Integer>::Cast(info[1]);
  
  info.GetReturnValue().Set(lzmaRet(lzma_easy_encoder(&self->_, preset->Value(), (lzma_check) check->Value())));
}

NAN_METHOD(LZMAStream::StreamEncoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  const FilterArray filters(Local<Array>::Cast(info[0]));
  Local<Integer> check = Local<Integer>::Cast(info[1]);

  if (!filters.ok())
    return;
  
  info.GetReturnValue().Set(lzmaRet(lzma_stream_encoder(&self->_, filters.array(), (lzma_check) check->Value())));
}

NAN_METHOD(LZMAStream::MTEncoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  const MTOptions mt(Local<Object>::Cast(info[0]));

  if (!mt.ok())
    return;
  
  info.GetReturnValue().Set(lzmaRet(lzma_stream_encoder_mt(&self->_, mt.opts())));
}

NAN_METHOD(LZMAStream::AloneEncoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  Local<Object> opt = Local<Object>::Cast(info[0]);
  lzma_options_lzma o = parseOptionsLZMA(opt);
  
  info.GetReturnValue().Set(lzmaRet(lzma_alone_encoder(&self->_, &o)));
}

NAN_METHOD(LZMAStream::StreamDecoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  uint64_t memlimit = NumberToUint64ClampNullMax(info[0]);
  Local<Integer> flags = Local<Integer>::Cast(info[1]);
  
  info.GetReturnValue().Set(lzmaRet(lzma_stream_decoder(&self->_, memlimit, flags->Value())));
}

NAN_METHOD(LZMAStream::AutoDecoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  uint64_t memlimit = NumberToUint64ClampNullMax(info[0]);
  Local<Integer> flags = Local<Integer>::Cast(info[1]);
  
  info.GetReturnValue().Set(lzmaRet(lzma_auto_decoder(&self->_, memlimit, flags->Value())));
}

NAN_METHOD(LZMAStream::AloneDecoder) {
  LZMA_FETCH_SELF();
  LZMA_ASYNC_LOCK(self);
  
  uint64_t memlimit = NumberToUint64ClampNullMax(info[0]);
  
  info.GetReturnValue().Set(lzmaRet(lzma_alone_decoder(&self->_, memlimit)));
}

}
