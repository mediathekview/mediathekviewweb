#include "liblzma-node.hpp"

namespace lzma {

void moduleInit(Local<Object> exports) {
  LZMAStream::Init(exports);
  IndexParser::Init(exports);
  
  exports->Set(NewString("versionNumber"),            Nan::New<FunctionTemplate>(lzmaVersionNumber)->GetFunction());
  exports->Set(NewString("versionString"),            Nan::New<FunctionTemplate>(lzmaVersionString)->GetFunction());
  exports->Set(NewString("checkIsSupported"),         Nan::New<FunctionTemplate>(lzmaCheckIsSupported)->GetFunction());
  exports->Set(NewString("checkSize"),                Nan::New<FunctionTemplate>(lzmaCheckSize)->GetFunction());
  exports->Set(NewString("crc32_"),                   Nan::New<FunctionTemplate>(lzmaCRC32)->GetFunction());
  exports->Set(NewString("filterEncoderIsSupported"), Nan::New<FunctionTemplate>(lzmaFilterEncoderIsSupported)->GetFunction());
  exports->Set(NewString("filterDecoderIsSupported"), Nan::New<FunctionTemplate>(lzmaFilterDecoderIsSupported)->GetFunction());
  exports->Set(NewString("rawEncoderMemusage"),       Nan::New<FunctionTemplate>(lzmaRawEncoderMemusage)->GetFunction());
  exports->Set(NewString("rawDecoderMemusage"),       Nan::New<FunctionTemplate>(lzmaRawDecoderMemusage)->GetFunction());
  exports->Set(NewString("mfIsSupported"),            Nan::New<FunctionTemplate>(lzmaMfIsSupported)->GetFunction());
  exports->Set(NewString("modeIsSupported"),          Nan::New<FunctionTemplate>(lzmaModeIsSupported)->GetFunction());
  exports->Set(NewString("easyEncoderMemusage"),      Nan::New<FunctionTemplate>(lzmaEasyEncoderMemusage)->GetFunction());
  exports->Set(NewString("easyDecoderMemusage"),      Nan::New<FunctionTemplate>(lzmaEasyDecoderMemusage)->GetFunction());
  
  // enum lzma_ret
  exports->Set(NewString("OK"),                Nan::New<Number>(LZMA_OK));
  exports->Set(NewString("STREAM_END"),        Nan::New<Number>(LZMA_STREAM_END));
  exports->Set(NewString("NO_CHECK"),          Nan::New<Number>(LZMA_NO_CHECK));
  exports->Set(NewString("UNSUPPORTED_CHECK"), Nan::New<Number>(LZMA_UNSUPPORTED_CHECK));
  exports->Set(NewString("GET_CHECK"),         Nan::New<Number>(LZMA_GET_CHECK));
  exports->Set(NewString("MEM_ERROR"),         Nan::New<Number>(LZMA_MEM_ERROR));
  exports->Set(NewString("MEMLIMIT_ERROR"),    Nan::New<Number>(LZMA_MEMLIMIT_ERROR));
  exports->Set(NewString("FORMAT_ERROR"),      Nan::New<Number>(LZMA_FORMAT_ERROR));
  exports->Set(NewString("OPTIONS_ERROR"),     Nan::New<Number>(LZMA_OPTIONS_ERROR));
  exports->Set(NewString("DATA_ERROR"),        Nan::New<Number>(LZMA_DATA_ERROR));
  exports->Set(NewString("BUF_ERROR"),         Nan::New<Number>(LZMA_BUF_ERROR));
  exports->Set(NewString("PROG_ERROR"),        Nan::New<Number>(LZMA_PROG_ERROR));
  
  // enum lzma_action
  exports->Set(NewString("RUN"),        Nan::New<Number>(LZMA_RUN));
  exports->Set(NewString("SYNC_FLUSH"), Nan::New<Number>(LZMA_SYNC_FLUSH));
  exports->Set(NewString("FULL_FLUSH"), Nan::New<Number>(LZMA_FULL_FLUSH));
  exports->Set(NewString("FINISH"),     Nan::New<Number>(LZMA_FINISH));
  
  // enum lzma_check
  exports->Set(NewString("CHECK_NONE"),   Nan::New<Number>(LZMA_CHECK_NONE));
  exports->Set(NewString("CHECK_CRC32"),  Nan::New<Number>(LZMA_CHECK_CRC32));
  exports->Set(NewString("CHECK_CRC64"),  Nan::New<Number>(LZMA_CHECK_CRC64));
  exports->Set(NewString("CHECK_SHA256"), Nan::New<Number>(LZMA_CHECK_SHA256));
  
  // lzma_match_finder
  exports->Set(NewString("MF_HC3"), Nan::New<Number>(LZMA_MF_HC3));
  exports->Set(NewString("MF_HC4"), Nan::New<Number>(LZMA_MF_HC4));
  exports->Set(NewString("MF_BT2"), Nan::New<Number>(LZMA_MF_BT2));
  exports->Set(NewString("MF_BT3"), Nan::New<Number>(LZMA_MF_BT3));
  exports->Set(NewString("MF_BT4"), Nan::New<Number>(LZMA_MF_BT4));
  
  // lzma_mode
  exports->Set(NewString("MODE_FAST"),   Nan::New<Number>(LZMA_MODE_FAST));
  exports->Set(NewString("MODE_NORMAL"), Nan::New<Number>(LZMA_MODE_NORMAL));
  
  // defines
  exports->Set(NewString("FILTER_X86"),               NewString("LZMA_FILTER_X86"));
  exports->Set(NewString("FILTER_POWERPC"),           NewString("LZMA_FILTER_POWERPC"));
  exports->Set(NewString("FILTER_IA64"),              NewString("LZMA_FILTER_IA64"));
  exports->Set(NewString("FILTER_ARM"),               NewString("LZMA_FILTER_ARM"));
  exports->Set(NewString("FILTER_ARMTHUMB"),          NewString("LZMA_FILTER_ARMTHUMB"));
  exports->Set(NewString("FILTER_SPARC"),             NewString("LZMA_FILTER_SPARC"));
  exports->Set(NewString("FILTER_DELTA"),             NewString("LZMA_FILTER_DELTA"));
  exports->Set(NewString("FILTERS_MAX"),              NewString("LZMA_FILTERS_MAX"));
  exports->Set(NewString("FILTER_LZMA1"),             NewString("LZMA_FILTER_LZMA1"));
  exports->Set(NewString("FILTER_LZMA2"),             NewString("LZMA_FILTER_LZMA2"));
  exports->Set(NewString("VLI_UNKNOWN"),              NewString("LZMA_VLI_UNKNOWN"));
  
  exports->Set(NewString("VLI_BYTES_MAX"),            Nan::New<Number>(LZMA_VLI_BYTES_MAX));
  exports->Set(NewString("CHECK_ID_MAX"),             Nan::New<Number>(LZMA_CHECK_ID_MAX));
  exports->Set(NewString("CHECK_SIZE_MAX"),           Nan::New<Number>(LZMA_CHECK_SIZE_MAX));
  exports->Set(NewString("PRESET_DEFAULT"),           Nan::New<Number>(LZMA_PRESET_DEFAULT));
  exports->Set(NewString("PRESET_LEVEL_MASK"),        Nan::New<Number>(LZMA_PRESET_LEVEL_MASK));
  exports->Set(NewString("PRESET_EXTREME"),           Nan::New<Number>(LZMA_PRESET_EXTREME));
  exports->Set(NewString("TELL_NO_CHECK"),            Nan::New<Number>(LZMA_TELL_NO_CHECK));
  exports->Set(NewString("TELL_UNSUPPORTED_CHECK"),   Nan::New<Number>(LZMA_TELL_UNSUPPORTED_CHECK));
  exports->Set(NewString("TELL_ANY_CHECK"),           Nan::New<Number>(LZMA_TELL_ANY_CHECK));
  exports->Set(NewString("CONCATENATED"),             Nan::New<Number>(LZMA_CONCATENATED));
  exports->Set(NewString("STREAM_HEADER_SIZE"),       Nan::New<Number>(LZMA_STREAM_HEADER_SIZE));
  exports->Set(NewString("VERSION_MAJOR"),            Nan::New<Number>(LZMA_VERSION_MAJOR));
  exports->Set(NewString("VERSION_MINOR"),            Nan::New<Number>(LZMA_VERSION_MINOR));
  exports->Set(NewString("VERSION_PATCH"),            Nan::New<Number>(LZMA_VERSION_PATCH));
  exports->Set(NewString("VERSION_STABILITY"),        Nan::New<Number>(LZMA_VERSION_STABILITY));
  exports->Set(NewString("VERSION_STABILITY_ALPHA"),  Nan::New<Number>(LZMA_VERSION_STABILITY_ALPHA));
  exports->Set(NewString("VERSION_STABILITY_BETA"),   Nan::New<Number>(LZMA_VERSION_STABILITY_BETA));
  exports->Set(NewString("VERSION_STABILITY_STABLE"), Nan::New<Number>(LZMA_VERSION_STABILITY_STABLE));
  exports->Set(NewString("VERSION"),                  Nan::New<Number>(LZMA_VERSION));
  exports->Set(NewString("VERSION_STRING"),           NewString(LZMA_VERSION_STRING));
  
  exports->Set(NewString("asyncCodeAvailable"),       Nan::New<Boolean>(LZMAStream::asyncCodeAvailable));
}

}

NODE_MODULE(lzma_native, lzma::moduleInit)

