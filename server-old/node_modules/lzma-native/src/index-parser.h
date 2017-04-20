// The contents from this file are from a proposed API that is not yet
// implemented in upstream liblzma.

#ifndef INDEX_PARSER_H
#define INDEX_PARSER_H

#include <stdint.h>
#include <stdlib.h>
#include <lzma.h>

namespace lzma {

/**
 * \brief       Internal data structure
 *
 * The contents of this structure is not visible outside the library.
 */
typedef struct lzma_index_parser_internal_s lzma_index_parser_internal;

/**
 * \brief       Reading the indexes of an .xz file
 *
 * The lzma_index_parser_data data structure is passed to
 * lzma_parse_indexes_from_file(), which can be used to retrieve the index
 * information for a given .xz file.
 *
 * It should be initialized with LZMA_INDEX_PARSER_DATA_INIT,
 * and, minimally, the file_size and read_callback() members need to be set.
 *
 * The allocation of internals happens transparently upon usage and does not
 * need to be taken care of.
 * In the case of an error, lzma_parse_indexes_from_file() performs all
 * necessary cleanup.
 * In the case of success, the index member will be set and needs to be
 * freed using lzma_index_end after the caller is done with it. If a custom
 * allocator was set on this struct, it needs to be used for freeing the
 * resulting index, too.
 *
 * Reading the data from the underlying file may happen synchronously or
 * asynchronously, see the description of the read_callback().
 */
typedef struct {
	/**
	 * \brief       Combined Index of all Streams in the file
	 *
	 * This will be set to an lzma_index * when parsing the file was
	 * successful, as indicated by a LZMA_STREAM_END return status.
	 */
	lzma_index *index;

	/**
	 * \brief       Total amount of Stream Padding
	 *
	 * This will be set when the file was successfully read.
	 */
	size_t stream_padding;

	/**
	 * \brief       Callback for reading data from the input file
	 *
	 * This member needs to be set to a function that provides a slice of
	 * the input file.
	 *
	 * The opaque pointer will have the same value as the opaque pointer
	 * set on this struct.
	 *
	 * When being invoked, it should read count bytes from the underlying
	 * file, starting at the specified offset, into buf.
	 * The return value may be -1, in which case
	 * lzma_parse_indexes_from_file() will return with LZMA_DATA_ERROR.
	 * Otherwise, the number of read bytes should be returned. If this is
	 * not the number of requested bytes, it will be assumed that the file
	 * was truncated, and lzma_parse_indexes_from_file() will fail with
	 * LZMA_DATA_ERROR.
	 *
	 * It is possible to perform the underlying I/O operations in an
	 * asynchronous manner. To do so, set the async flag on this struct
	 * to true. After read_callback() is invoked,
	 * lzma_parse_indexes_from_file() will return immediately with
	 * LZMA_OK (unless the read_callback() return value indicates failure),
	 * and you are expected to call lzma_parse_indexes_from_file() with
	 * the same struct as soon as the buffer has been filled.
	 *
	 * If asynchronous reading is used and the underlying read operation
	 * fails, you should set file_size to SIZE_MAX and call
	 * lzma_parse_indexes_from_file() to trigger an error clean up all
	 * remaining internal state.
	 *
	 * You should not perform any operations on this structure until
	 * the data has been read in any case.
	 *
	 * This function is modelled after pread(2), which is a available on
	 * some platforms and can be easily wrapped to be used here.
	 */
	int64_t (LZMA_API_CALL *read_callback)(void *opaque,
	                                       uint8_t *buf,
	                                       size_t count,
	                                       int64_t offset);

	/// Opaque pointer that is passed to read_callback.
	void *opaque;

	/// Whether to return after calling read_callback and wait for
	/// another call. Defaults to synchronous operations.
	lzma_bool async;

	/** \brief       Callback for reading data from the input file
	 *
	 * This needs to be set to the size of the input file before all
	 * other operations. If this is set to SIZE_MAX, the parser will
	 * fail with LZMA_OPTIONS_ERROR. This can be used to clean up
	 * after a failed asynchronous read_callback().
	 *
	 * On error, this will be set to SIZE_MAX.
	 */
	size_t file_size;

	/** \brief       Memory limit for decoding the indexes.
	 *
	 * Set a memory limit for decoding. Default to UINT64_MAX for no limit.
	 * If this is set too low to allocate the internal data structure
	 * that is minimally required for parsing, this will be set to 0.
	 * If this is set too low to parse the underlying .xz file,
	 * this will be set to the amount of memory that would have
	 * been necessary for parsing the file.
	 */
	uint64_t memlimit;

	/// Message that may be set when additional information is available
	/// on error.
	const char *message;

	/**
	 * \brief       Custom memory allocation functions
	 *
	 * In most cases this is NULL which makes liblzma use
	 * the standard malloc() and free().
	 */
	const lzma_allocator *allocator;

	/**
	 * \brief       Data which is internal to the index parser.
	 *
	 * Do not touch. You can check whether this is NULL to see if this
	 * structure currently holds external resources, not counting the
	 * possible index member that is set on success.
	 */
	lzma_index_parser_internal* internal;

	/*
	 * Reserved space to allow possible future extensions without
	 * breaking the ABI. Excluding the initialization of this structure,
	 * you should not touch these, because the names of these variables
	 * may change.
	 */
	void *reserved_ptr1;
	void *reserved_ptr2;
	void *reserved_ptr3;
	void *reserved_ptr4;
	uint64_t reserved_int1;
	uint64_t reserved_int2;
	size_t reserved_int3;
	size_t reserved_int4;
	lzma_reserved_enum reserved_enum1;
	lzma_reserved_enum reserved_enum2;
} lzma_index_parser_data;

/**
 * \brief       Initialization for lzma_index_parser_data
 *
 * When you declare an instance of lzma_index_parser_data, you should
 * immediately initialize it to this value:
 *
 *     lzma_index_parser_data strm = LZMA_INDEX_PARSER_DATA_INIT;
 *
 * Anything which applies for LZMA_STREAM_INIT applies here, too.
 */
#define LZMA_INDEX_PARSER_DATA_INIT \
	{ NULL, 0, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, \
	NULL, NULL, NULL, NULL, 0, 0, 0, 0, \
	LZMA_RESERVED_ENUM, LZMA_RESERVED_ENUM }

/** \brief      Parse the Index(es) from the given .xz file
 *
 * Read metadata from the underlying file.
 * The info pointer should refer to a lzma_index_parser_data struct that
 * has been initialized using LZMA_INDEX_PARSER_DATA_INIT.
 *
 * This will call info->read_callback() multiple times to read parts of the
 * underlying .xz file and, upon success, fill info->index with an
 * lzma_index pointer that contains metadata for the whole file, accumulated
 * across multiple streams.
 *
 * \param      info      Pointer to a lzma_index_parser_data structure.
 *
 * \return     On success, LZMA_STREAM_END is returned.
 *             On error, another value is returned, and info->message may
 *             be set to provide additional information.
 *             If info->async is set, LZMA_OK may be returned to indicate
 *             that another call to lzma_parse_indexes_from_file() should be
 *             performed after the data has been read.
 */
extern lzma_ret
my_lzma_parse_indexes_from_file(lzma_index_parser_data *info) lzma_nothrow;

}

#endif
