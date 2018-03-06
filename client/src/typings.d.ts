/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface Promise<T> {
  finally(onfinally?: (() => void) | null | undefined): Promise<T>;
}