import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvw-split-dropdown',
  templateUrl: './split-dropdown.component.html',
  styleUrls: ['./split-dropdown.component.scss']
})
export class SplitDropdownComponent implements OnInit {
  enabled: boolean = false;
  show: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
