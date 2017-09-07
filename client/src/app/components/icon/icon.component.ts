import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mvw-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() scale: number = 1;

  constructor() {
  }
}
