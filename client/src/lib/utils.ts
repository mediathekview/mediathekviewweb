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
  if (isNaN(seconds)) return '?';
  return Math.floor(seconds / 60).toString().padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}

export function formatBytes(bytes: number, decimals: number = 0): string {
  if (bytes < 0) return '?';
  if (bytes === 0) return '0 Bytes';
  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

const channelColorRules = [
  {
    keywords: ['ZDF', 'KIKA', 'PHOENIX'],
    classes: 'bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:hover:bg-orange-800/50 dark:text-orange-300'
  },
  {
    keywords: ['SRF', 'SWR', '3SAT', 'ORF', 'RBB', 'RBTV', 'RADIO BREMEN TV'],
    classes: 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/50 dark:hover:bg-red-800/50 dark:text-red-200'
  },
  {
    keywords: ['ARD', 'ERSTE', 'NDR', 'BR', 'SR', 'WDR', 'DW', 'HR', 'TAGESSCHAU24', 'ONE'],
    classes: 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 dark:text-blue-200'
  },
  {
    keywords: ['MDR'],
    classes: 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:hover:bg-green-800/50 dark:text-green-300'
  },
  {
    keywords: ['ARTE', 'FUNK.NET'],
    classes: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
  }
];

const defaultChannelClasses = 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300';

export function getChannelColorClasses(channel: string): string {
  const channelUpper = channel.toUpperCase();
  const rule = channelColorRules.find(r => r.keywords.some(k => channelUpper.includes(k)));
  return rule ? rule.classes : defaultChannelClasses;
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
