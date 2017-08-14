(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

const sleep = async (ms: number) => new Promise((resolve, reject) => setTimeout(() => resolve(), ms));

async function* g(count: number) {
  for (let i = 0; i < count; i++) {
    yield* (async function* () {
      await sleep(100);
      yield i;
    })();
  }
}

async function f() {
  for await (const x of g(100)) {
    console.log(x);
  }
}

f();
