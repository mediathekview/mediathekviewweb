// The contents from this file are from a proposed API that is not yet
// implemented in upstream liblzma.

#include "index-parser.h"

#include <assert.h>
#include <string.h>

#undef my_min
#define my_min(x, y) ((x) < (y) ? (x) : (y))

namespace lzma {

void *
lzma_alloc(size_t size, const lzma_allocator *allocator)
{
	// Some malloc() variants return NULL if called with size == 0.
	if (size == 0)
		size = 1;

	void *ptr;

	if (allocator != NULL && allocator->alloc != NULL)
		ptr = allocator->alloc(allocator->opaque, 1, size);
	else
		ptr = malloc(size);

	return ptr;
}

void
lzma_free(void *ptr, const lzma_allocator *allocator)
{
	if (allocator != NULL && allocator->free != NULL)
		allocator->free(allocator->opaque, ptr);
	else
		free(ptr);

	return;
}

enum lip_state {
	PARSE_INDEX_INITED,
	PARSE_INDEX_READ_FOOTER,
	PARSE_INDEX_READ_INDEX,
	PARSE_INDEX_READ_STREAM_HEADER
};

struct lzma_index_parser_internal_s {
	/// Current state.
	lip_state state;

	/// Current position in the file. We parse the file backwards so
	/// initialize it to point to the end of the file.
	int64_t pos;

	/// The footer flags of the current XZ stream.
	lzma_stream_flags footer_flags;

	/// All Indexes decoded so far.
	lzma_index *combined_index;

	/// The Index currently being decoded.
	lzma_index *this_index;

	/// Padding of the stream currently being decoded.
	lzma_vli stream_padding;

	/// Size of the Index currently being decoded.
	lzma_vli index_size;

	/// Keep track of how much memory is being used for Index decoding.
	uint64_t memused;

	/// lzma_stream for the Index decoder.
	lzma_stream strm;

	/// Keep the buffer coming as the last member to so all data that is
	/// ever actually used fits in a few cache lines.
	uint8_t buf[8192];
};

static lzma_ret
parse_indexes_read(lzma_index_parser_data *info,
                   uint8_t *buf,
                   size_t size,
                   int64_t pos)
{
	int64_t read = info->read_callback(info->opaque, buf, size, pos);

	if (read < 0) {
		return LZMA_DATA_ERROR;
	}

	if ((size_t)read != size) {
		info->message = "Unexpected end of file";
		return LZMA_DATA_ERROR;
	}

	return LZMA_OK;
}

extern lzma_ret
my_lzma_parse_indexes_from_file(lzma_index_parser_data *info) lzma_nothrow
{
	lzma_ret ret;
	lzma_index_parser_internal *internal = info->internal;
	info->message = NULL;

	// Apparently, we are already done.
	if (info->index != NULL) {
		ret = LZMA_PROG_ERROR;
		goto error;
	}

	// Passing file_size == SIZE_MAX can be used to safely clean up
	// everything when I/O failed asynchronously.
	if (info->file_size == SIZE_MAX) {
		ret = LZMA_OPTIONS_ERROR;
		goto error;
	}

	if (info->memlimit == 0) {
		info->memlimit = UINT64_MAX;
	}

	if (internal == NULL) {
		if (info->memlimit <= sizeof(lzma_index_parser_internal)) {
			// We don't really have a good figure for how much
			// memory may be necessary. Set memlimit to 0 to
			// indicate that something is obviously inacceptable.
			info->memlimit = 0;
			return LZMA_MEMLIMIT_ERROR;
		}

		internal = (lzma_index_parser_internal*)lzma_alloc(sizeof(lzma_index_parser_internal),
			info->allocator);

		if (internal == NULL)
			return LZMA_MEM_ERROR;

		internal->state = PARSE_INDEX_INITED;
		internal->pos = info->file_size;
		internal->combined_index = NULL;
		internal->this_index = NULL;
		info->internal = internal;

		lzma_stream strm_ = LZMA_STREAM_INIT;
		memcpy(&internal->strm, &strm_, sizeof(lzma_stream));
		internal->strm.allocator = info->allocator;
	}

	// The header flags of the current stream are only ever used within a
	// call and don't need to go into the internals struct.
	lzma_stream_flags header_flags;

	int i;
	uint64_t memlimit;

	switch (internal->state) {
case PARSE_INDEX_INITED:
	if (info->file_size <= 0) {
		// These strings are fixed so they can be translated by the xz
		// command line utility.
		info->message = "File is empty";
		return LZMA_DATA_ERROR;
	}

	if (info->file_size < 2 * LZMA_STREAM_HEADER_SIZE) {
		info->message = "Too small to be a valid .xz file";
		return LZMA_DATA_ERROR;
	}

	// Each loop iteration decodes one Index.
	do {
		// Check that there is enough data left to contain at least
		// the Stream Header and Stream Footer. This check cannot
		// fail in the first pass of this loop.
		if (internal->pos < 2 * LZMA_STREAM_HEADER_SIZE) {
			ret = LZMA_DATA_ERROR;
			goto error;
		}

		internal->pos -= LZMA_STREAM_HEADER_SIZE;
		internal->stream_padding = 0;

		// Locate the Stream Footer. There may be Stream Padding which
		// we must skip when reading backwards.
		while (true) {
			if (internal->pos < LZMA_STREAM_HEADER_SIZE) {
				ret = LZMA_DATA_ERROR;
				goto error;
			}

			ret = parse_indexes_read(info,
					internal->buf,
					LZMA_STREAM_HEADER_SIZE,
					internal->pos);

			if (ret != LZMA_OK)
				goto error;
			internal->state = PARSE_INDEX_READ_FOOTER;
			if (info->async) return LZMA_OK;
case PARSE_INDEX_READ_FOOTER:

			// Stream Padding is always a multiple of four bytes.
			i = 2;
			if (((uint32_t *)internal->buf)[i] != 0)
				break;

			// To avoid calling the read callback for every four
			// bytes of Stream Padding, take advantage that we
			// read 12 bytes (LZMA_STREAM_HEADER_SIZE) already
			// and check them too before calling the read
			// callback again.
			do {
				internal->stream_padding += 4;
				internal->pos -= 4;
				--i;
			} while (i >= 0 && ((uint32_t *)internal->buf)[i] == 0);
		}

		// Decode the Stream Footer.
		ret = lzma_stream_footer_decode(&internal->footer_flags,
				internal->buf);
		if (ret != LZMA_OK) {
			goto error;
		}

		// Check that the Stream Footer doesn't specify something
		// that we don't support. This can only happen if the xz
		// version is older than liblzma and liblzma supports
		// something new.
		//
		// It is enough to check Stream Footer. Stream Header must
		// match when it is compared against Stream Footer with
		// lzma_stream_flags_compare().
		if (internal->footer_flags.version != 0) {
			ret = LZMA_OPTIONS_ERROR;
			goto error;
		}

		// Check that the size of the Index field looks sane.
		internal->index_size = internal->footer_flags.backward_size;
		if ((lzma_vli)(internal->pos) <
				internal->index_size +
				LZMA_STREAM_HEADER_SIZE) {
			ret = LZMA_DATA_ERROR;
			goto error;
		}

		// Set pos to the beginning of the Index.
		internal->pos -= internal->index_size;

		// See how much memory we can use for decoding this Index.
		memlimit = info->memlimit;
		internal->memused = sizeof(lzma_index_parser_internal);
		if (internal->combined_index != NULL) {
			internal->memused = lzma_index_memused(
				internal->combined_index);
			assert(internal->memused <= memlimit);

			memlimit -= internal->memused;
		}

		// Decode the Index.
		ret = lzma_index_decoder(&internal->strm,
				&internal->this_index,
				memlimit);
		if (ret != LZMA_OK) {
			goto error;
		}

		do {
			// Don't give the decoder more input than the
			// Index size.
			internal->strm.avail_in = my_min(sizeof(internal->buf),
					internal->index_size);

			ret = parse_indexes_read(info,
					internal->buf,
					internal->strm.avail_in,
					internal->pos);

			if (ret != LZMA_OK)
				goto error;
			internal->state = PARSE_INDEX_READ_INDEX;
			if (info->async) return LZMA_OK;
case PARSE_INDEX_READ_INDEX:

			internal->pos += internal->strm.avail_in;
			internal->index_size -= internal->strm.avail_in;

			internal->strm.next_in = internal->buf;
			ret = lzma_code(&internal->strm, LZMA_RUN);

		} while (ret == LZMA_OK);

		// If the decoding seems to be successful, check also that
		// the Index decoder consumed as much input as indicated
		// by the Backward Size field.
		if (ret == LZMA_STREAM_END && (
			internal->index_size != 0 ||
			internal->strm.avail_in != 0)) {
			ret = LZMA_DATA_ERROR;
		}

		if (ret != LZMA_STREAM_END) {
			// LZMA_BUFFER_ERROR means that the Index decoder
			// would have liked more input than what the Index
			// size should be according to Stream Footer.
			// The message for LZMA_DATA_ERROR makes more
			// sense in that case.
			if (ret == LZMA_BUF_ERROR)
				ret = LZMA_DATA_ERROR;

			// If the error was too low memory usage limit,
			// indicate also how much memory would have been needed.
			if (ret == LZMA_MEMLIMIT_ERROR) {
				uint64_t needed = lzma_memusage(
					&internal->strm);
				if (UINT64_MAX - needed < internal->memused)
					needed = UINT64_MAX;
				else
					needed += internal->memused;

				info->memlimit = needed;
			}

			goto error;
		}

		// Decode the Stream Header and check that its Stream Flags
		// match the Stream Footer.
		internal->pos -= internal->footer_flags.backward_size;
		internal->pos -= LZMA_STREAM_HEADER_SIZE;
		if ((lzma_vli)(internal->pos) <
				lzma_index_total_size(internal->this_index)) {
			ret = LZMA_DATA_ERROR;
			goto error;
		}

		internal->pos -= lzma_index_total_size(internal->this_index);

		ret = parse_indexes_read(info,
				internal->buf,
				LZMA_STREAM_HEADER_SIZE,
				internal->pos);

		if (ret != LZMA_OK)
			goto error;

		internal->state = PARSE_INDEX_READ_STREAM_HEADER;
		if (info->async) return LZMA_OK;
case PARSE_INDEX_READ_STREAM_HEADER:

		ret = lzma_stream_header_decode(&header_flags, internal->buf);
		if (ret != LZMA_OK) {
			goto error;
		}

		ret = lzma_stream_flags_compare(&header_flags,
				&internal->footer_flags);
		if (ret != LZMA_OK) {
			goto error;
		}

		// Store the decoded Stream Flags into this_index. This is
		// needed so that we can print which Check is used in each
		// Stream.
		ret = lzma_index_stream_flags(internal->this_index,
				&internal->footer_flags);
		assert(ret == LZMA_OK);

		// Store also the size of the Stream Padding field. It is
		// needed to show the offsets of the Streams correctly.
		ret = lzma_index_stream_padding(internal->this_index,
				internal->stream_padding);
		assert(ret == LZMA_OK);

		if (internal->combined_index != NULL) {
			// Append the earlier decoded Indexes
			// after this_index.
			ret = lzma_index_cat(
					internal->this_index,
					internal->combined_index,
					info->allocator);
			if (ret != LZMA_OK) {
				goto error;
			}
		}

		internal->combined_index = internal->this_index;
		internal->this_index = NULL;

		info->stream_padding += internal->stream_padding;

	} while (internal->pos > 0);

	lzma_end(&internal->strm);

	// All OK. Make combined_index available to the caller.
	info->index = internal->combined_index;

	lzma_free(internal, info->allocator);
	info->internal = NULL;
	return LZMA_STREAM_END;
} // end switch(internal->state)

error:
	// Something went wrong, free the allocated memory.
	if (internal) {
		lzma_end(&internal->strm);
		lzma_index_end(internal->combined_index, info->allocator);
		lzma_index_end(internal->this_index, info->allocator);
		lzma_free(internal, info->allocator);
	}

	info->internal = NULL;

	// Doing this will prevent people from calling lzma_parse_indexes_from_file()
	// again without re-initializing.
	info->file_size = SIZE_MAX;
	return ret;
}

}

#include "liblzma-node.hpp"

namespace lzma {

void IndexParser::Init(Local<Object> exports) {
  Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
  tpl->SetClassName(NewString("IndexParser"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  
  Nan::SetPrototypeMethod(tpl, "init", Init);
  Nan::SetPrototypeMethod(tpl, "feed", Feed);
  Nan::SetPrototypeMethod(tpl, "parse", Parse);
  
  constructor.Reset(tpl->GetFunction());
  exports->Set(NewString("IndexParser"), Nan::New<Function>(constructor));
}

NAN_METHOD(IndexParser::New) {
  if (info.IsConstructCall()) {
    IndexParser* self = new IndexParser();
    if (!self) {
      Nan::ThrowRangeError("Out of memory, cannot create IndexParser");
      info.GetReturnValue().SetUndefined();
      return;
    }
    
    self->Wrap(info.This());
    
    info.GetReturnValue().Set(info.This());
  } else {
    info.GetReturnValue().Set(Nan::New<Function>(constructor)->NewInstance(0, NULL));
  }
}

namespace {
  extern "C" int64_t LZMA_API_CALL
  read_cb(void* opaque, uint8_t* buf, size_t count, int64_t offset) {
    IndexParser* p = static_cast<IndexParser*>(opaque);
    return p->readCallback(opaque, buf, count, offset);
  }
  
  extern "C" void* LZMA_API_CALL
  alloc_for_lzma_index(void *opaque, size_t nmemb, size_t size) {
    size_t nBytes = nmemb * size + sizeof(size_t);
    
    size_t* result = static_cast<size_t*>(::malloc(nBytes));
    if (!result)
      return result;
    
    *result = nBytes;
    Nan::AdjustExternalMemory(static_cast<int64_t>(nBytes));
    return static_cast<void*>(result + 1);
  }
  
  extern "C" void LZMA_API_CALL
  free_for_lzma_index(void *opaque, void *ptr) {
    if (!ptr)
      return;
    
    size_t* orig = static_cast<size_t*>(ptr) - 1;
    
    Nan::AdjustExternalMemory(-static_cast<int64_t>(*orig));
    return ::free(static_cast<void*>(orig));
  }
}

int64_t IndexParser::readCallback(void* opaque, uint8_t* buf, size_t count, int64_t offset) {
  currentReadBuffer = buf;
  currentReadSize = count;
  
  Local<Value> argv[2] = {
    Uint64ToNumberMaxNull(count),
    Uint64ToNumberMaxNull(offset)
  };
  
  Local<Function> read_cb = Local<Function>::Cast(EmptyToUndefined(Nan::Get(handle(), NewString("read_cb"))));
  Local<Value> ret = read_cb->Call(handle(), 2, argv);
  
  if (currentReadBuffer) {
    info.async = true;
    return count;
  } else {
    // .feed() has been alreay been called synchronously
    info.async = false;
    return NumberToUint64ClampNullMax(ret);
  }
}

IndexParser::IndexParser() : isCurrentlyInParseCall(false) {
  lzma_index_parser_data info_ = LZMA_INDEX_PARSER_DATA_INIT;
  info = info_;
  
  allocator.alloc = alloc_for_lzma_index;
  allocator.free = free_for_lzma_index;
  allocator.opaque = static_cast<void*>(this);
  
  info.read_callback = read_cb;
  info.opaque = static_cast<void*>(this);
  info.allocator = &allocator;
}

NAN_METHOD(IndexParser::Init) {
  IndexParser* p = Nan::ObjectWrap::Unwrap<IndexParser>(info.This());
  
  p->info.file_size = NumberToUint64ClampNullMax(info[0]);
  p->info.memlimit = NumberToUint64ClampNullMax(info[1]);
}

Local<Object> IndexParser::getObject() const {
  Local<Object> obj = Nan::New<Object>();
  
  Nan::Set(obj, NewString("streamPadding"), Uint64ToNumberMaxNull(info.stream_padding));
  Nan::Set(obj, NewString("memlimit"), Uint64ToNumberMaxNull(info.memlimit));
  Nan::Set(obj, NewString("streams"), Uint64ToNumberMaxNull(lzma_index_stream_count(info.index)));
  Nan::Set(obj, NewString("blocks"), Uint64ToNumberMaxNull(lzma_index_block_count(info.index)));
  Nan::Set(obj, NewString("fileSize"), Uint64ToNumberMaxNull(lzma_index_file_size(info.index)));
  Nan::Set(obj, NewString("uncompressedSize"), Uint64ToNumberMaxNull(lzma_index_uncompressed_size(info.index)));
  Nan::Set(obj, NewString("checks"), Uint64ToNumberMaxNull(lzma_index_checks(info.index)));
  
  return obj;
}

NAN_METHOD(IndexParser::Parse) {
  IndexParser* p = Nan::ObjectWrap::Unwrap<IndexParser>(info.This());
  if (p->isCurrentlyInParseCall) {
    Nan::ThrowError("Cannot call IndexParser::Parse recursively");
    return;
  }
  
  lzma_ret ret;
  p->isCurrentlyInParseCall = true;
  ret = my_lzma_parse_indexes_from_file(&p->info);
  p->isCurrentlyInParseCall = false;
  
  if (ret == LZMA_OK) {
    info.GetReturnValue().Set(true);
    return;
  } else if (ret == LZMA_STREAM_END) {
    info.GetReturnValue().Set(p->getObject());
    return;
  }
  
  Local<Object> error = lzmaRetError(ret);
  if (p->info.message) {
    Nan::Set(error, NewString("message"), NewString(p->info.message));
  }
  Nan::ThrowError(Local<Value>(error));
}

NAN_METHOD(IndexParser::Feed) {
  Local<Value> value = info[0];
  if (value.IsEmpty() || !node::Buffer::HasInstance(value)) {
    Nan::ThrowTypeError("Expected Buffer as input");
    return;
  }
  
  IndexParser* p = Nan::ObjectWrap::Unwrap<IndexParser>(info.This());
  
  if (p->currentReadBuffer == NULL) {
    Nan::ThrowError("No input data was expected");
    return;
  }
  size_t length = node::Buffer::Length(value);
  
  if (length > p->currentReadSize)
    length = p->currentReadSize;
  
  memcpy(p->currentReadBuffer, node::Buffer::Data(value), length);
  p->currentReadBuffer = NULL;
  
  info.GetReturnValue().Set(Uint64ToNumberMaxNull(length));
}

IndexParser::~IndexParser() {
  assert(!isCurrentlyInParseCall);
  info.file_size = SIZE_MAX;
  lzma_index_end(info.index, &allocator);
  info.index = NULL;
  info.read_callback = NULL;
  lzma_ret ret = my_lzma_parse_indexes_from_file(&info);
  assert(ret == LZMA_OPTIONS_ERROR);
}

Nan::Persistent<Function> IndexParser::constructor;

}
