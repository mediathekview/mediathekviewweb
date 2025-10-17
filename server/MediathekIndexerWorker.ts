import { Client } from '@opensearch-project/opensearch';
import crypto from 'node:crypto';

import { IPC } from './IPC';
import { getValkeyClient, initializeValkey } from './ValKey';
import { config } from './config';
import { OPENSEARCH_INDEX, VALKEY_KEYS } from './keys';
import { timeout } from './utils';

const ipc = new IPC(process);

const searchClient = new Client(config.opensearch);

// Buffer size configuration
const BUFFER_CAPACITY = 150; // Max size for outBuffer
const FILL_THRESHOLD = 50;   // When to trigger a refill of in-buffers
const FLUSH_THRESHOLD = 75;  // When to trigger a flush of outBuffer

// Input buffers from Valkey
let addedBuffer: string[] = [];
let removedBuffer: string[] = [];

// Output buffer for OpenSearch
let outBuffer: any[] = [];

// State flags
let noMoreAddedEntries = false;
let noMoreRemovedEntries = false;
let isFlushing = false;

// Statistics
let addedEntries = 0;
let removedEntries = 0;

function handleError(err: Error, context: string): void {
  console.error(`Error during ${context}:`, err);
  ipc.send('error', err.message);
  setTimeout(() => process.exit(1), 500);
}

function createContentHash(stringOrBuffer: string | Buffer): string {
  return crypto.createHash('sha256').update(stringOrBuffer).digest('base64');
}

/**
 * Asynchronously fills the input buffers from Valkey if they are below the threshold.
 */
async function fillInputBuffers(): Promise<void> {
  // No need to query if we already know both sources are empty
  if (noMoreAddedEntries && noMoreRemovedEntries) {
    return;
  }

  const valkey = getValkeyClient();
  const promises: Promise<any>[] = [];

  if (!noMoreAddedEntries && addedBuffer.length < FILL_THRESHOLD) {
    const space = BUFFER_CAPACITY - addedBuffer.length;

    promises.push(
      valkey.spopCount(VALKEY_KEYS.ADDED_ENTRIES, space).then((result) => {
        if (result && result.size > 0) {
          addedBuffer.push(...(result as Set<string>));
        } else {
          noMoreAddedEntries = true;
        }
      })
    );
  }

  if (!noMoreRemovedEntries && removedBuffer.length < FILL_THRESHOLD) {
    const space = BUFFER_CAPACITY - removedBuffer.length;

    promises.push(
      valkey.spopCount(VALKEY_KEYS.REMOVED_ENTRIES, space).then((result) => {
        if (result && result.size > 0) {
          removedBuffer.push(...(result as Set<string>));
        } else {
          noMoreRemovedEntries = true;
        }
      })
    );
  }

  // Concurrently execute the requests and wait for both to finish
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}

/**
 * Flushes the outBuffer to OpenSearch.
 * Manages the isFlushing state to prevent concurrent bulk requests.
 */
async function flushOutBuffer(): Promise<void> {
  if (isFlushing || outBuffer.length === 0) {
    return;
  }

  isFlushing = true;
  const batch = outBuffer;
  outBuffer = []; // Clear the buffer immediately

  try {
    const { body } = await searchClient.bulk({ body: batch });

    if (body.errors) {
      // Basic error logging. For production, you might want to inspect items for retry logic.
      console.error('Bulk indexing encountered errors.');
      const firstError = body.items.find((item: any) => item.index?.error)?.index.error;
      if (firstError) {
        console.error('First error reason:', firstError.reason);
      }
    }
  } catch (err) {
    // A fatal error in the bulk request will be caught here.
    handleError(err, 'flushing buffer');
  } finally {
    isFlushing = false;
    notifyState();
  }
}

function notifyState(): void {
  ipc.send('state', {
    addedEntries: addedEntries,
    removedEntries: removedEntries,
  });
}

/**
 * Main processing loop.
 */
async function run(): Promise<void> {
  // 1. Initialization
  await initializeValkey();
  const valkey = getValkeyClient();

  const filmlisteTimestampStr = await valkey.get(VALKEY_KEYS.NEW_FILMLIST_TIMESTAMP);
  const filmlisteTimestamp = Number(filmlisteTimestampStr) || 0;

  // 2. Main Processing Loop
  while (true) {
    // Ensure we have data to process
    await fillInputBuffers();

    const hasWorkToDo = addedBuffer.length > 0 || removedBuffer.length > 0;

    // If all sources are drained and buffers are empty, we're done.
    if (!hasWorkToDo && noMoreAddedEntries && noMoreRemovedEntries) {
      break; // Exit the loop
    }

    // If buffers are temporarily empty, wait a bit for new data to arrive.
    if (!hasWorkToDo) {
      await timeout(50);
      continue; // Go to the next loop iteration to refill
    }

    // Process one entry
    if (addedBuffer.length > 0) {
      const rawEntry = addedBuffer.pop()!;
      const parsedEntry = JSON.parse(rawEntry);
      parsedEntry.filmlisteTimestamp = filmlisteTimestamp;

      outBuffer.push({
        index: { _index: OPENSEARCH_INDEX, _id: createContentHash(rawEntry) },
      });
      outBuffer.push(parsedEntry);
      addedEntries++;
    } else if (removedBuffer.length > 0) {
      const rawEntry = removedBuffer.pop()!;
      outBuffer.push({
        delete: { _index: OPENSEARCH_INDEX, _id: createContentHash(rawEntry) },
      });
      removedEntries++;
    }

    // Flush the output buffer if it reaches the threshold
    if (outBuffer.length >= FLUSH_THRESHOLD) {
      await flushOutBuffer();
    }
  }

  // 3. Finalization
  await flushOutBuffer(); // Flush any remaining items
  await valkey.close();

  ipc.send('done');
  setTimeout(() => process.exit(0), 500);
}

// Start the process
run().catch(err => handleError(err, 'main process'));
