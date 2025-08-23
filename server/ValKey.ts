import { GlideClient } from '@valkey/valkey-glide';
import { IPC } from './IPC';
import { config } from './config';

export type ValkeyClient = GlideClient;

const ipc = new IPC(process);
let _client: GlideClient | undefined;

export async function initializeValkey(): Promise<void> {
  if (_client) {
    return;
  }

  try {
    _client = await GlideClient.createClient(config.valkey);
    console.log(`${process.pid} - connected to ValKey`);
  }
  catch (error) {
    console.error('Valkey Client Error:', error);
    ipc.send('error', error.message);

    throw error;
  }
}

export function getValkeyClient(): GlideClient {
  if (_client == undefined) {
    throw new Error('Valkey Client has not been initialized. Call initializeValkey() first.');
  }

  return _client;
}
