declare const umami: {
  track: (event_name: string, data?: Record<string, any>) => void;
  identify: (unique_id: string) => void;
};

export function initializeAnalytics(): void {
  if (typeof umami == 'undefined' || typeof umami.identify != 'function') {
    return;
  }
  try {
    const umamiIdKey = 'mvw_uuid';
    let uniqueId = localStorage.getItem(umamiIdKey);
    if (!uniqueId) {
      uniqueId = crypto.randomUUID();
      localStorage.setItem(umamiIdKey, uniqueId);
    }
    umami.identify(uniqueId);
  } catch (e) {
    console.warn('Could not initialize analytics with unique ID.', e);
  }
}

export function trackEvent(eventName: string, data?: Record<string, any>): void {
  if (typeof umami != 'undefined' && typeof umami.track == 'function') {
    umami.track(eventName, data);
  }
}

export async function playVideoInNewWindow(url: string): Promise<void> {
  const playerWindow: Window | null = window.open(url, '_blank');
  const start = Date.now();

  while (playerWindow?.closed === false) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const playDuration = Date.now() - start;

  if (playDuration >= 1000 * 30) {
    location.reload();
  }
}

export function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number): (...args: Parameters<F>) => void {
  let timeout: number | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), waitFor);
  };
}

export function throttle<F extends (...args: any[]) => void>(func: F, limit: number): (this: any, ...args: Parameters<F>) => void {
  let inThrottle = false;
  return function (this: any, ...args: Parameters<F>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export function formatDate(epochSeconds: number): string {
  if (epochSeconds === 0) return '?';
  return new Date(epochSeconds * 1000).toLocaleDateString('de', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatTime(epochSeconds: number): string {
  if (epochSeconds === 0) return '?';
  return new Date(epochSeconds * 1000).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '?';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const minutesSecondsString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  if (hours > 0) {
    return `${hours}:${minutesSecondsString}`;
  }

  if (minutes > 0) {
    return minutesSecondsString;
  }

  return `${remainingSeconds}s`;
}

export function formatBytes(bytes: number, precision: number = 3): string {
  if (bytes < 0) return '?';
  if (bytes === 0) return '0 Bytes';
  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toPrecision(precision)) + ' ' + sizes[i];
}

export function parseURIHash(hash: string): Record<string, string> {
  if (hash.startsWith('#')) {
    hash = hash.slice(1);
  }
  const props = hash.split('&');
  const elements: Record<string, string> = {};
  for (const prop of props) {
    if (!prop) continue;
    const [key, value] = prop.split('=');
    elements[key] = decodeURIComponent(value ?? '');
  }
  return elements;
}

export function createURIHash(elements: Record<string, any>): string {
  const props = [];
  for (const prop in elements) {
    const value = elements[prop];
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      props.push(`${prop}=${encodeURIComponent(value.toString())}`);
    }
  }
  return props.join('&');
}
