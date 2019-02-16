import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { AggregatedEntry } from '../../common/model';

@Component({
  selector: 'mvw-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent {
  @ViewChild('viewport') private readonly viewPort: CdkVirtualScrollViewport;
  @ViewChildren('entryPanel') private readonly entryPanels: QueryList<MatExpansionPanel>;

  @Input() entries: AggregatedEntry[];

  trackEntry(_index: number, entry: AggregatedEntry): string {
    return entry.id;
  }
}
