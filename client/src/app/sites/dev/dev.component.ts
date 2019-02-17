import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mvw-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevComponent { }
