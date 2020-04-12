import { AfterViewInit, Component } from '@angular/core';
import { animationFrame } from '@tstdl/base/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    animationFrame().then(() => document.querySelector('body > .loading-screen')?.classList.add('hide'));
  }
}
