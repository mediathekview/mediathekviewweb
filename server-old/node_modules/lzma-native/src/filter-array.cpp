#include "liblzma-node.hpp"

namespace lzma {

FilterArray::FilterArray(Local<Array> arr) : ok_(false) {
  Nan::HandleScope();
  
  if (!arr->IsArray() || arr.IsEmpty()) {
    Nan::ThrowTypeError("Filter array expected");
    return;
  }
  
  size_t len = arr->Length();
  
  Local<String> id_ = NewString("id");
  Local<String> options_ = NewString("options");
  
  for (size_t i = 0; i < len; ++i) {
    Local<Object> entry = Local<Object>::Cast(EmptyToUndefined(Nan::Get(arr, i)));
    if (entry.IsEmpty() || entry->IsUndefined() || entry->IsNull() || !entry->Has(id_)) {
      Nan::ThrowTypeError("Filter array needs object entries");
      return;
    }
    
    Local<String> id = Local<String>::Cast(EmptyToUndefined(Nan::Get(entry, id_)));
    Local<Object> opt = Local<Object>::Cast(EmptyToUndefined(Nan::Get(entry, options_)));
    
    lzma_filter f;
    f.id = FilterByName(id);
    f.options = NULL;
    
    if ((opt.IsEmpty() || opt->IsUndefined() || opt->IsNull()) &&
      (f.id != LZMA_FILTER_LZMA1 && f.id != LZMA_FILTER_LZMA2)) {
      filters.push_back(f);
      continue;
    }
    
    optbuf.push_back(options());
    union options& bopt = optbuf.back();
    
    switch (f.id) {
      case LZMA_FILTER_DELTA:
        bopt.delta.type = (lzma_delta_type) GetIntegerProperty(opt, "type", LZMA_DELTA_TYPE_BYTE);
        bopt.delta.dist = GetIntegerProperty(opt, "dist", 1);
        f.options = &bopt.delta;
        break;
      case LZMA_FILTER_LZMA1:
      case LZMA_FILTER_LZMA2:
        bopt.lzma = parseOptionsLZMA(opt);
        f.options = &bopt.lzma;
        break;
      default:
        Nan::ThrowTypeError("LZMA wrapper library understands .options only for DELTA and LZMA1, LZMA2 filters");
        return;
    }
    
    filters.push_back(f);
  }
  
  finish();
}

void FilterArray::finish() {
  lzma_filter end;
  end.id = LZMA_VLI_UNKNOWN;
  filters.push_back(end);
  ok_ = true;
}

}
