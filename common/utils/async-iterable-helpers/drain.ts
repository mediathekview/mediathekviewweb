import { AnyIterable } from '../any-iterable';

export async function drain(iterable: AnyIterable<any>): Promise<void> {
  for await (const _item of iterable) { }
}
