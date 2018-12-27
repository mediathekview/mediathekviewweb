import { Subject } from 'rxjs';
import { DeferredPromise } from './common/utils';

type Signal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | 'SIGBREAK';
type QuitEvent = 'uncaughtException' | 'multipleResolves' | 'unhandledRejection' | 'rejectionHandled';

const QUIT_SIGNALS: Signal[] = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGBREAK'];
const QUIT_EVENTS: QuitEvent[] = ['uncaughtException', 'multipleResolves', 'unhandledRejection', 'rejectionHandled'];

const shutdownSubject = new Subject<void>();

export const shutdown = shutdownSubject.asObservable();
export const shutdownPromise = new DeferredPromise();

let requested = false;

export function requestShutdown() {
  if (requested) {
    return;
  }

  requested = true;
  shutdownSubject.next();
  shutdownSubject.complete();
  shutdownPromise.resolve();

  const timeout = setTimeout(() => {
    console.warn('forcefully quitting after 10 seconds...');
    process.exit(1);
  }, 10000);

  timeout.unref();
}

export function forceShutdown() {
  console.error('forcefully quitting');
  process.exit(2);
}

export function initializeSignals() {
  let signalCounter = 0;

  for (const event of QUIT_EVENTS) {
    process.on(event as any, (...args: any[]) => {
      console.error(event, ...args);
      requestShutdown();
    });
  }

  for (const signal of QUIT_SIGNALS) {
    process.on(signal as Signal, (signal) => {
      console.info(`${signal} received, quitting.`);
      requestShutdown();

      if (++signalCounter > 1) {
        forceShutdown();
      }
    });
  }
}
