import { Action } from '@ngrx/store';


export type State = {
  pageSize: number;
};

export const initialState: State = {
  pageSize: 15
};

export function reducer(state = initialState, action: Action): State {
  switch (action.type) {

    default:
      return state;
  }
}
