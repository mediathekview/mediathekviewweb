import { AnyIterable } from '../any-iterable-iterator';

export async function drain(iterable: AnyIterable<any>): Promise<void> {
  // tslint:disable-next-line: no-empty
  for await (const _item of iterable) { }
}
