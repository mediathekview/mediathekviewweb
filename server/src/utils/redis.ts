import { Redis } from "ioredis";

export async function groupExists(redis: Redis, stream: string, group: string): Promise<boolean> {
  const info = (await redis.xinfo('GROUPS', stream))[0];

  for (let i = 0; i < info.length; i++) {
    if (info[i] == 'name') {
      if (info[i + 1] == group) {
        return true;
      }
    }
  }

  return false;
}
