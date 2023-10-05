import { createClient } from 'redis';
import { IPC } from './IPC';
import { config } from './config';

export type RedisClient = ReturnType<typeof createClient>;

const ipc = new IPC(process);
let _client: RedisClient;

export async function initializeRedis(): Promise<void> {
  try {
    const client = createClient(config.redis);

    client.on('error', (error) => {
      console.log(error);
      ipc.send('error', error.message);
      void client.quit();

      setTimeout(() => process.exit(1), 250);
    });

    await client.connect();
    console.log(`${process.pid} - connected to redis`);
    _client = client;
  }
  catch (error) {
    console.error(error);
    ipc.send('error', error.message);
    process.exit(0);
  }
}

export function getRedisClient(): RedisClient {
  if (_client == undefined) {
    throw new Error('Redis is not ready.');
  }

  return _client;
}
