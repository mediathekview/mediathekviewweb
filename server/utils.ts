const percentFormat = Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const durationFormat = Intl.NumberFormat(undefined, {
  style: 'unit',
  unit: 'second',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatBytes(bytes: number, decimals: number) {
  if (bytes == 0) return '0 Byte';
  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function timeout(): Promise<void>;
export function timeout(milliseconds: number): Promise<void>;
export function timeout(milliseconds: number = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export function arraysHasSameElements(array1: any[], array2: any[]) {
  if (array1.length != array2.length) {
    return false;
  }

  array1 = array1.sort();
  array2 = array2.sort();

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

export function formatPercent(value: number): string {
  return percentFormat.format(value);
}

export function formatDuration(value: number): string {
  return durationFormat.format(value);
}
