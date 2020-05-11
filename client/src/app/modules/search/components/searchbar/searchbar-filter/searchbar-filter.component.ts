import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-searchbar-filter',
  templateUrl: './searchbar-filter.component.html',
  styleUrls: ['./searchbar-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarFilterComponent implements OnInit {



  constructor() { }

  ngOnInit(): void {
  }

}
