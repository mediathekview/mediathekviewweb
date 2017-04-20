#include "liblzma-node.hpp"

namespace lzma {

MTOptions::MTOptions() : filters_(NULL), ok_(false) { }

MTOptions::~MTOptions() {
  delete filters_;
}

MTOptions::MTOptions(Local<Object> opt) : filters_(NULL), ok_(true) {
  opts_.flags = 0;
  opts_.filters = NULL;
  
  opts_.block_size = Nan::Get(opt, NewString("blockSize")).ToLocalChecked()->IntegerValue();
  opts_.timeout = Nan::To<uint32_t>(Nan::Get(opt, NewString("timeout")).ToLocalChecked())
      .FromMaybe(0);
  opts_.preset = Nan::To<uint32_t>(Nan::Get(opt, NewString("preset")).ToLocalChecked())
      .FromMaybe(LZMA_PRESET_DEFAULT);
  opts_.check = (lzma_check)Nan::To<int32_t>(Nan::Get(opt, NewString("check")).ToLocalChecked())
      .FromMaybe((int)LZMA_CHECK_CRC64);
  opts_.threads = Nan::To<uint32_t>(Nan::Get(opt, NewString("threads")).ToLocalChecked())
      .FromMaybe(0);

  if (opts_.threads == 0) {
    opts_.threads = lzma_cputhreads();
  }

  Local<Value> filters = Nan::Get(opt, NewString("filters")).ToLocalChecked();
  if (filters->IsArray()) {
    filters_ = new FilterArray(Local<Array>::Cast(filters));
    if (filters_->ok()) {
      opts_.filters = filters_->array();
    } else {
      ok_ = false;
    }
  }
}

}
