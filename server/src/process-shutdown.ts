import { CancellationToken } from './common/utils/cancellation-token';
import { InstanceProvider } from './instance-provider';

type Signal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | 'SIGBREAK';
type QuitEvent = 'uncaughtException' | 'multipleResolves' | 'unhandledRejection' | 'rejectionHandled';

const QUIT_SIGNALS: Signal[] = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGBREAK'];
const QUIT_EVENTS: QuitEvent[] = ['uncaughtException' /* , 'multipleResolves' */, 'unhandledRejection', 'rejectionHandled'];

const logger = InstanceProvider.coreLogger();

export const shutdownToken = new CancellationToken();

let requested = false;

let quitReason: any[];

process.on('beforeExit', () => {
  if (quitReason != undefined) {
    console.info('quit reason:', ...(Array.isArray(quitReason) ? quitReason : [quitReason]));
  }
});

export function requestShutdown(): void {
  if (requested) {
    return;
  }

  requested = true;
  shutdownToken.set();

  const timeout = setTimeout(() => {
    logger.warn('forcefully quitting after 20 seconds...');
    setTimeout(() => process.exit(1), 1);
  }, 20000);

  timeout.unref();
}

export function forceShutdown(): void {
  logger.warn('forcefully quitting');
  setTimeout(() => process.exit(2), 1);
}

export function initializeSignals(): void {
  let signalCounter = 0;

  for (const event of QUIT_EVENTS) {
    process.on(event as any, (...args: any[]) => {
      console.error(event, ...args);
      quitReason = args;
      requestShutdown();
    });
  }

  for (const signal of QUIT_SIGNALS) {
    process.on(signal, (signal) => {
      logger.info(`${signal} received, quitting.`);
      requestShutdown();

      if (++signalCounter > 1) {
        forceShutdown();
      }
    });
  }
}
