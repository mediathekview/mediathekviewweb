import { AsyncDisposable, Disposable } from './disposable';

export function using<T extends Disposable>(disposable: T, user: (disposable: T) => void): void {
  try {
    user(disposable);
  }
  finally {
    disposable.dispose();
  }
}

export async function usingAsync<T extends AsyncDisposable>(disposable: T, user: (disposable: T) => void | Promise<void>): Promise<void> {
  try {
    await user(disposable);
  }
  finally {
    await disposable.dispose();
  }
}
