import { Action } from '@ngrx/store';

export enum SettingsActionTypes {
  LoadSettingss = '[Settings] Load Settingss'
}

export class LoadSettingss implements Action {
  readonly type = SettingsActionTypes.LoadSettingss;
}

export type SettingsActions = LoadSettingss;
