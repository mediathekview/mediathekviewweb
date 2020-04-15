import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { createArray } from '@tstdl/base/utils';
import { EntrySearchResult } from 'src/app/shared/models';
import { Search } from '../components/searchbar/searchbar.component';
import { getEntry } from './mock-data';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  searchResult: EntrySearchResult;
  pageIndex: number;
  pageSize: number;

  constructor() {
    this.pageSize = 5;
    this.pageIndex = 0;
  }

  ngOnInit(): void {
    this.search();
  }

  onSearchChange(_search: Search): void {
    this.search();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.search();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.search();
  }

  private search(): void {
    const entries = createArray(this.pageSize, () => getEntry());

    this.searchResult = {
      total: 732,
      items: entries,
      milliseconds: 7.58
    };
  }
}
