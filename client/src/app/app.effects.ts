import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';


@Injectable()
export class AppEffects {

  constructor(private actions$: Actions) {}
}
