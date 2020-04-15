import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-searchbar-filter-item',
  templateUrl: './searchbar-filter-item.component.html',
  styleUrls: ['./searchbar-filter-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarFilterItemComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  valueChange(value: string): void {
    console.log(value);
  }

}
