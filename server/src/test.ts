import { EventLoopWatcher } from "./utils";

const watcher = new EventLoopWatcher(100);

watcher
  .watch(0, 10, 'max')
  .map((measure) => Math.round(measure * 10000) / 10000)
  .subscribe((delay) => console.log(`eventloop: ${delay} ms`));

console.log('hello');