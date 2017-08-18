export interface ITransaction {
  exec(): Promise<void>;
}
