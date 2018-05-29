const hasAsyncIteratorSymbol = 'asyncIterator' in Symbol;

if (!hasAsyncIteratorSymbol) {
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator');
}