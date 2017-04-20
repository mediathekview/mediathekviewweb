/**
 * @file flash-constants.js
 */
/**
 * The maximum size in bytes for append operations to the video.js
 * SWF. Calling through to Flash blocks and can be expensive so
 * we chunk data and pass through 4KB at a time, yielding to the
 * browser between chunks. This gives a theoretical maximum rate of
 * 1MB/s into Flash. Any higher and we begin to drop frames and UI
 * responsiveness suffers.
 *
 * @private
 */
const flashConstants = {
  // times in milliseconds
  TIME_BETWEEN_CHUNKS: 1,
  BYTES_PER_CHUNK: 1024 * 32
};

export default flashConstants;
