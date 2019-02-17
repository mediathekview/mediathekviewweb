import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mvw-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  burgerOpened: boolean;

  constructor() {
    this.burgerOpened = false;
  }
}
