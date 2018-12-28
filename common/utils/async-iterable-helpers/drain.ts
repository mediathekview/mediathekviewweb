import { AnyIterable } from '../any-iterable-iterator';

export async function drain(iterable: AnyIterable<any>): Promise<void> {
  for await (const _item of iterable) { }
}
