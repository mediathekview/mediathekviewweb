#ifndef BUILDING_NODE_EXTENSION
#define BUILDING_NODE_EXTENSION
#endif

#ifndef LIBLZMA_NODE_HPP
#define LIBLZMA_NODE_HPP

#include <node.h>
#include <node_object_wrap.h>
#include <v8.h>
#include <nan.h>

#include <lzma.h>
#include "index-parser.h"

#include <vector>
#include <list>
#include <set>
#include <queue>
#include <string>
#include <utility>

// C++11 features in libstdc++ shipped with Apple Clang
// See e.g. http://svn.boost.org/trac/boost/ticket/8092
#if __cplusplus <= 199711L || (__APPLE__ && (__GNUC_LIBSTD__ <= 4) && (__GNUC_LIBSTD_MINOR__ <= 2))
# define LZMA_NO_CXX11_RVALUE_REFERENCES
#endif

#ifndef LZMA_NO_CXX11_RVALUE_REFERENCES
# define LZMA_NATIVE_MOVE std::move
#else
# define LZMA_NATIVE_MOVE
#endif

#if NODE_MODULE_VERSION >= 11
#define LZMA_ASYNC_AVAILABLE
#endif

namespace lzma {
  using namespace v8;
  
  /* internal util */
#ifdef LZMA_ASYNC_AVAILABLE
  struct uv_mutex_guard {
    explicit uv_mutex_guard(uv_mutex_t& m_, bool autolock = true)
      : locked(false), m(m_)
    {
      if (autolock)
        lock(); 
    }
    
    ~uv_mutex_guard() {
      if (locked)
        unlock();
    }
  
    inline void lock () {
      uv_mutex_lock(&m);
      locked = true;
    }
    
    inline void unlock () {
      uv_mutex_unlock(&m);
      locked = false;
    }
    
    bool locked;
    uv_mutex_t& m;
  };
#endif
  
  /* util */
  /**
   * Return the filter constant associated with a v8 String handle
   */
  lzma_vli FilterByName(Local<Value> v);
  
  /**
   * If rv represents an error, throw a javascript exception representing it.
   * Always returns rv as a v8 Integer.
   */
  Local<Value> lzmaRet(lzma_ret rv);
  
  /**
   * Return a javascript exception representing rv.
   */
  Local<Object> lzmaRetError(lzma_ret rv);
  
  /**
   * Takes a Node.js SlowBuffer or Buffer as input and populates data accordingly.
   * Returns true on success, false on failure.
   */
  bool readBufferFromObj(Local<Value> value, std::vector<uint8_t>& data);
  
  /**
   * Return a lzma_options_lzma struct as described by the v8 Object obj.
   */
  lzma_options_lzma parseOptionsLZMA (Local<Object> obj);
  
  /**
   * Return a v8 Number representation of an uint64_t where UINT64_MAX will be mapped to null
   */
  Local<Value> Uint64ToNumberMaxNull(uint64_t in);
  
  /**
   * Return a v8 Number representation of an uint64_t where 0 will be mapped to null
   */
  Local<Value> Uint64ToNumber0Null(uint64_t in);
  
  /**
   * Return a uint64_t representation of a v8 Number,
   * where values above UINT64_MAX map to UINT64_MAX and null to UINT64_MAX.
   * Throws an TypeError if the input is not a number.
   */
  uint64_t NumberToUint64ClampNullMax(Local<Value> in);
  
  /**
   * Convert Nan MaybeLocal values to Local, replacing
   * empty values with undefined
   */
  inline Local<Value> EmptyToUndefined(Nan::MaybeLocal<Value> v) {
    if (v.IsEmpty())
      return Nan::Undefined();
    
    return v.ToLocalChecked();
  }
  
  /**
   * Create a new v8 String
   */
  template<typename T>
  inline Local<String> NewString(T value) {
    return Nan::New<String>(value).ToLocalChecked();
  }
  
  /**
   * Return an integer property of an object (which can be passed to Nan::Get),
   * providing a default value if no such property is present
   */
  template<typename T>
  inline uint64_t GetIntegerProperty(T& obj, const char* name, uint64_t def) {
    Local<Value> v = EmptyToUndefined(Nan::Get(obj, NewString(name)));
    
    if (v->IsUndefined())
      return def;
    
    Nan::MaybeLocal<Integer> i = Nan::To<Integer>(v);
    return i.IsEmpty() ? def : i.ToLocalChecked()->Value();
  }
  
  /* bindings in one-to-one correspondence to the lzma functions */
  NAN_METHOD(lzmaVersionNumber);
  NAN_METHOD(lzmaVersionString);
  NAN_METHOD(lzmaCheckIsSupported);
  NAN_METHOD(lzmaCheckSize);
  NAN_METHOD(lzmaFilterEncoderIsSupported);
  NAN_METHOD(lzmaFilterDecoderIsSupported);
  NAN_METHOD(lzmaMfIsSupported);
  NAN_METHOD(lzmaModeIsSupported);
  NAN_METHOD(lzmaEasyEncoderMemusage);
  NAN_METHOD(lzmaEasyDecoderMemusage);
  NAN_METHOD(lzmaCRC32);
  NAN_METHOD(lzmaRawEncoderMemusage);
  NAN_METHOD(lzmaRawDecoderMemusage);
  
  /* wrappers */
  /**
   * List of liblzma filters with corresponding options
   */
  class FilterArray {
    public:
      FilterArray() : ok_(false) { finish(); }
      explicit FilterArray(Local<Array> arr);
      
      lzma_filter* array() { return filters.data(); }
      const lzma_filter* array() const { return filters.data(); }
      bool ok() const { return ok_; }
    private:
      FilterArray(const FilterArray&);
      FilterArray& operator=(const FilterArray&);
      
      void finish();
    
      union options {
        lzma_options_delta delta;
        lzma_options_lzma lzma;
      };
      
      bool ok_;
      std::vector<lzma_filter> filters;
      std::list<options> optbuf;
  };

  /**
   * Wrapper for lzma_mt (multi-threading options).
   */
  class MTOptions {
    public:
      MTOptions();
      explicit MTOptions(Local<Object> opt);
      ~MTOptions();

      lzma_mt* opts() { return &opts_; }
      const lzma_mt* opts() const { return &opts_; }
      bool ok() const { return ok_; }
    private:
      MTOptions(const MTOptions&);
      MTOptions& operator=(const MTOptions&);
      
      FilterArray* filters_;
      lzma_mt opts_;
      bool ok_;
  };

  /**
   * Node.js object wrap for lzma_stream wrapper. Corresponds to exports.Stream
   */
  class LZMAStream : public Nan::ObjectWrap {
    public:
      static void Init(Local<Object> exports);
      static const bool asyncCodeAvailable;
      
    /* regard as private: */
      void doLZMACodeFromAsync();
      void invokeBufferHandlers(bool hasLock);
      void* alloc(size_t nmemb, size_t size);
      void free(void* ptr);
    private:
      void resetUnderlying();
      void doLZMACode();
      
      explicit LZMAStream();
      ~LZMAStream();
      
      static Nan::Persistent<Function> constructor;
      static NAN_METHOD(New);
      
      static void _failMissingSelf(const Nan::FunctionCallbackInfo<Value>& info);
      
      void adjustExternalMemory(int64_t bytesChange);
      void reportAdjustedExternalMemoryToV8();
      
#ifdef LZMA_ASYNC_AVAILABLE
      int64_t nonAdjustedExternalMemory;
      
      uv_mutex_t mutex;
      
#define LZMA_ASYNC_LOCK(strm)    uv_mutex_guard lock(strm->mutex)
#else
#define LZMA_ASYNC_LOCK(strm)
#endif

      static NAN_METHOD(ResetUnderlying);
      static NAN_METHOD(SetBufsize);
      static NAN_METHOD(Code);
      static NAN_METHOD(Memusage);
      static NAN_METHOD(MemlimitGet);
      static NAN_METHOD(MemlimitSet);
      static NAN_METHOD(RawEncoder);
      static NAN_METHOD(RawDecoder);
      static NAN_METHOD(FiltersUpdate);
      static NAN_METHOD(EasyEncoder);
      static NAN_METHOD(StreamEncoder);
      static NAN_METHOD(AloneEncoder);
      static NAN_METHOD(MTEncoder);
      static NAN_METHOD(StreamDecoder);
      static NAN_METHOD(AutoDecoder);
      static NAN_METHOD(AloneDecoder);
      
      lzma_allocator allocator;
      lzma_stream _;
      size_t bufsize;
      std::string error;
      
      bool shouldFinish;
      size_t processedChunks;
      lzma_ret lastCodeResult;
      std::queue<std::vector<uint8_t> > inbufs;
      std::queue<std::vector<uint8_t> > outbufs;
  };

  /**
   * Async worker for a single coding step.
   */
  class LZMAStreamCodingWorker : public Nan::AsyncWorker {
    public:
      LZMAStreamCodingWorker(/*Nan::Callback* callback_, */LZMAStream* stream_)
        : Nan::AsyncWorker(NULL/*callback_*/), stream(stream_) {
        SaveToPersistent(static_cast<uint32_t>(0), stream->handle());
      }

      ~LZMAStreamCodingWorker() {}

      void Execute() {
        stream->doLZMACodeFromAsync();
      }
    private:
      void HandleOKCallback() {
        stream->invokeBufferHandlers(false);
      }

      void HandleErrorCallback() {
        stream->invokeBufferHandlers(false);
      }

      LZMAStream* stream;
  };
  
  class IndexParser : public Nan::ObjectWrap {
    public:
      static void Init(Local<Object> exports);
    
    /* regard as private: */
      int64_t readCallback(void* opaque, uint8_t* buf, size_t count, int64_t offset);
    private:
      explicit IndexParser();
      ~IndexParser();
      
      lzma_index_parser_data info;
      lzma_allocator allocator;
      
      uint8_t* currentReadBuffer;
      size_t currentReadSize;
      bool isCurrentlyInParseCall;
      
      Local<Object> getObject() const;
      
      static Nan::Persistent<Function> constructor;
      static NAN_METHOD(New);
      static NAN_METHOD(Init);
      static NAN_METHOD(Feed);
      static NAN_METHOD(Parse);
  };
  
  /**
   * Node.js addon init function
   */
  void moduleInit(Local<Object> exports);
}

#endif
