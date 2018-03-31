import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';

import { AggregatedEntry } from '../../common/model';
import { SearchResult } from '../../common/search-engine';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'mvw-search-result-table',
  templateUrl: './search-result-table.component.html',
  styleUrls: ['./search-result-table.component.scss']
})
export class SearchResultTableComponent implements OnInit {
  @Input() searchResult: SearchResult<AggregatedEntry>;

  private readonly settingsService: SettingsService;

  columnsToDisplay: string[];

  constructor(settingsService: SettingsService) {
    this.columnsToDisplay = ['channel', 'topic', 'title', 'timestamp', 'duration'];
    this.settingsService = settingsService;
  }

  async ngOnInit() {
  }

  onPageEvent(pageEvent: PageEvent) {
    this.settingsService.setPageSize(pageEvent.pageSize);
  }
}
