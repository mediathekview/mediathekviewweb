import { ITransaction } from './';

export interface ITransactable {
  transact(transaction: ITransaction);
  endTransact();
}
