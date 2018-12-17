export interface Disposable {
  dispose(): void;
}

export interface AsyncDisposable {
  dispose(): Promise<void>;
}
