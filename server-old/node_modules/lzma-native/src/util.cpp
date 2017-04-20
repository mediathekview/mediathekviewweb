#include "liblzma-node.hpp"
#include <node_buffer.h>
#include <cstring>

namespace lzma {

lzma_vli FilterByName(Local<Value> v) {
  Nan::Utf8String cmpto(v);
  if (cmpto.length() == 0)
    return LZMA_VLI_UNKNOWN;
  
  struct searchEntry {
    const char* str;
    lzma_vli value;
  };
  
  static const struct searchEntry search[] = {
    { "LZMA_FILTER_X86", LZMA_FILTER_X86 },
    { "LZMA_FILTER_POWERPC", LZMA_FILTER_POWERPC },
    { "LZMA_FILTER_IA64", LZMA_FILTER_IA64 },
    { "LZMA_FILTER_ARM", LZMA_FILTER_ARM },
    { "LZMA_FILTER_ARMTHUMB", LZMA_FILTER_ARMTHUMB },
    { "LZMA_FILTER_SPARC", LZMA_FILTER_SPARC },
    { "LZMA_FILTER_DELTA", LZMA_FILTER_DELTA },
    { "LZMA_FILTER_LZMA1", LZMA_FILTER_LZMA1 },
    { "LZMA_FILTER_LZMA2", LZMA_FILTER_LZMA2 },
    { "LZMA_FILTERS_MAX", LZMA_FILTERS_MAX },
    { "LZMA_VLI_UNKNOWN", LZMA_VLI_UNKNOWN }
  };
  
  for (const struct searchEntry* p = search; ; ++p) 
    if (p->value == LZMA_VLI_UNKNOWN || std::strcmp(*cmpto, p->str) == 0)
      return p->value;
}

Local<Object> lzmaRetError(lzma_ret rv) {
  struct errorInfo {
    lzma_ret code;
    const char* name;
    const char* desc;
  };
  
  /* description strings taken from liblzma/…/api/base.h */
  static const struct errorInfo searchErrorInfo[] = {
    { LZMA_OK,                "LZMA_OK", "Operation completed successfully" },
    { LZMA_STREAM_END,        "LZMA_STREAM_END", "End of stream was reached" },
    { LZMA_NO_CHECK,          "LZMA_NO_CHECK", "Input stream has no integrity check" },
    { LZMA_UNSUPPORTED_CHECK, "LZMA_UNSUPPORTED_CHECK", "Cannot calculate the integrity check" },
    { LZMA_GET_CHECK,         "LZMA_GET_CHECK", "Integrity check type is now available" },
    { LZMA_MEM_ERROR,         "LZMA_MEM_ERROR", "Cannot allocate memory" },
    { LZMA_MEMLIMIT_ERROR,    "LZMA_MEMLIMIT_ERROR", "Memory usage limit was reached" },
    { LZMA_FORMAT_ERROR,      "LZMA_FORMAT_ERROR", "File format not recognized" },
    { LZMA_OPTIONS_ERROR,     "LZMA_OPTIONS_ERROR", "Invalid or unsupported options" },
    { LZMA_DATA_ERROR,        "LZMA_DATA_ERROR", "Data is corrupt" },
    { LZMA_PROG_ERROR,        "LZMA_PROG_ERROR", "Programming error" },
    { LZMA_BUF_ERROR,         "LZMA_BUF_ERROR", "No progress is possible" },
    { (lzma_ret)-1,           "LZMA_UNKNOWN_ERROR", "Unknown error code" }
  };
  
  const struct errorInfo* p = searchErrorInfo;
  while (p->code != rv && p->code != (lzma_ret)-1)
    ++p;
  
  Local<Object> e = Local<Object>::Cast(Nan::Error(p->desc));
  e->Set(NewString("code"), Nan::New<Integer>(rv));
  e->Set(NewString("name"), NewString(p->name));
  e->Set(NewString("desc"), NewString(p->desc));
  
  return e;
}

Local<Value> lzmaRet(lzma_ret rv) {
  if (rv != LZMA_OK && rv != LZMA_STREAM_END)
    Nan::ThrowError(Local<Value>(lzmaRetError(rv)));
  
  return Nan::New<Integer>(rv);
}

bool readBufferFromObj(Local<Value> buf_, std::vector<uint8_t>& data) {
  if (buf_.IsEmpty() || !node::Buffer::HasInstance(buf_)) {
    Nan::ThrowTypeError("Expected Buffer as input");
    return false;
  }
  
  Local<Object> buf = Local<Object>::Cast(buf_);
  size_t len = node::Buffer::Length(buf);
  const uint8_t* ptr = reinterpret_cast<const uint8_t*>(len > 0 ? node::Buffer::Data(buf) : "");
  
  data = std::vector<uint8_t>(ptr, ptr + len);
  
  return true;
}

lzma_options_lzma parseOptionsLZMA (Local<Object> obj) {
  Nan::HandleScope();
  lzma_options_lzma r;
  
  if (obj.IsEmpty() || obj->IsUndefined())
    obj = Nan::New<Object>();
  
  r.dict_size = GetIntegerProperty(obj, "dictSize", LZMA_DICT_SIZE_DEFAULT);
  r.lp = GetIntegerProperty(obj, "lp", LZMA_LP_DEFAULT);
  r.lc = GetIntegerProperty(obj, "lc", LZMA_LC_DEFAULT);
  r.pb = GetIntegerProperty(obj, "pb", LZMA_PB_DEFAULT);
  r.mode = (lzma_mode)GetIntegerProperty(obj, "mode", (uint64_t)LZMA_MODE_FAST);
  r.nice_len = GetIntegerProperty(obj, "niceLen", 64);
  r.mf = (lzma_match_finder)GetIntegerProperty(obj, "mf", (uint64_t)LZMA_MF_HC4);
  r.depth = GetIntegerProperty(obj, "depth", 0);
  uint64_t preset_ = GetIntegerProperty(obj, "preset", UINT64_MAX);
  
  r.preset_dict = NULL;
  
  if (preset_ != UINT64_MAX) 
    lzma_lzma_preset(&r, preset_);
  
  return r;
}

Local<Value> Uint64ToNumberMaxNull(uint64_t in) {
  if (in == UINT64_MAX)
    return Nan::Null();
  else
    return Nan::New<Number>(in);
}

Local<Value> Uint64ToNumber0Null(uint64_t in) {
  if (in == 0)
    return Nan::Null();
  else
    return Nan::New<Number>(in);
}

uint64_t NumberToUint64ClampNullMax(Local<Value> in) {
  if (in->IsNull() || in->IsUndefined())
    return UINT64_MAX;
  
  Local<Number> n = Local<Number>::Cast(in);
  if (n.IsEmpty() && !in.IsEmpty()) {
    Nan::ThrowTypeError("Number required");
    return UINT64_MAX;
  }
  
  Local<Integer> integer = Local<Integer>::Cast(n);
  if (!integer.IsEmpty())
    return integer->Value();
  
  return n->Value();
}

}
