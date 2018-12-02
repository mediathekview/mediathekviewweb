import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEraser } from '@fortawesome/free-solid-svg-icons';

const icons = [
  faEraser
];

@NgModule({
  imports: [FontAwesomeModule],
  exports: [FontAwesomeModule]
})
export class FontAwesomeIconsModule {
  constructor() {
    for (const icon of icons) {
      library.add(icon);
    }
  }
}
