import { Subject } from 'rxjs';

type Signal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | 'SIGBREAK';
type QuitEvent = 'uncaughtException' | 'multipleResolves' | 'unhandledRejection' | 'rejectionHandled';

const QUIT_SIGNALS: Signal[] = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGBREAK'];
const QUIT_EVENTS: QuitEvent[] = ['uncaughtException', 'multipleResolves', 'unhandledRejection', 'rejectionHandled'];

const shutdownSubject = new Subject<void>();

export const shutdown = shutdownSubject.asObservable();
export const shutdownPromise = shutdown.toPromise();

export function requestShutdown() {
  shutdownSubject.next();
  shutdownSubject.complete();

  const timeout = setTimeout(() => {
    console.error('forcefully quitting after 10 seconds...');
    process.exit(1);
  }, 10000);

  timeout.unref();
}

export function initializeSignals() {
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
    });
  }
}
