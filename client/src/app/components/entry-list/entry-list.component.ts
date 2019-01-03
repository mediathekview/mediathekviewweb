import { Component, Input } from '@angular/core';
import { AggregatedEntry } from 'src/app/common/model';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent {
  @Input() entries: AggregatedEntry[];

  trackEntry(_index: number, entry: AggregatedEntry): string {
    return entry.id;
  }
}
