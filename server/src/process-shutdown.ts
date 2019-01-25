import { Subject } from 'rxjs';
import { DeferredPromise } from './common/utils';

type Signal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | 'SIGBREAK';
type QuitEvent = 'uncaughtException' | 'multipleResolves' | 'unhandledRejection' | 'rejectionHandled';

const QUIT_SIGNALS: Signal[] = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGBREAK'];
const QUIT_EVENTS: QuitEvent[] = ['uncaughtException' /* , 'multipleResolves' */, 'unhandledRejection', 'rejectionHandled'];

const shutdownSubject = new Subject<void>();

export const shutdown = shutdownSubject.asObservable();
export const shutdownPromise = new DeferredPromise();
export const forceShutdownPromise = new DeferredPromise();

let requested = false;

export function requestShutdown(): void {
  if (requested) {
    return;
  }

  requested = true;
  shutdownSubject.next();
  shutdownSubject.complete();
  shutdownPromise.resolve();

  const timeout = setTimeout(() => {
    console.warn('forcefully quitting after 20 seconds...');
    forceShutdownPromise.resolve();
    setTimeout(() => process.exit(1), 1);
  }, 20000);

  timeout.unref();
}

export function forceShutdown(): void {
  console.error('forcefully quitting');
  forceShutdownPromise.resolve();
  setTimeout(() => process.exit(2), 1);
}

export function initializeSignals(): void {
  let signalCounter = 0;

  for (const event of QUIT_EVENTS) {
    process.on(event as any, (...args: any[]) => {
      console.error(event, ...args);
      requestShutdown();
    });
  }

  for (const signal of QUIT_SIGNALS) {
    process.on(signal, (signal) => {
      console.info(`${signal} received, quitting.`);
      requestShutdown();

      if (++signalCounter > 1) {
        forceShutdown();
      }
    });
  }
}
