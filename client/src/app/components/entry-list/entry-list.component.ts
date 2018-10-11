import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTable, MatTableDataSource, SortDirection } from '@angular/material';
import { AggregatedEntry, Field } from '../../common/model';
import { Order } from '../../common/search-engine';

const DEFAULT_SORT_FIELD = Field.Timestamp;
const DEFAULT_SORT_ORDER = Order.Descending;

@Component({
  selector: 'mvw-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<AggregatedEntry>;
  @ViewChild(MatSort) sort: MatSort;

  columnsToDisplay = ['channel', 'topic', 'title', 'date', 'time', 'duration', 'play'];

  get sortField(): Field {
    const sortField = (this.sort.direction == '') ? DEFAULT_SORT_FIELD : this.sort.active;
    return sortField as Field;
  }

  get sortOrder(): Order {
    switch (this.sort.direction) {
      case 'asc':
        return Order.Ascending;

      case 'desc':
        return Order.Descending;

      case '':
        return DEFAULT_SORT_ORDER;

      default:
        throw new Error(`unknown direction '${this.sort.direction}'`);
    }
  }

  initialize(dataSource: MatTableDataSource<AggregatedEntry>) {
    this.table.dataSource = dataSource;
  }

  ngOnInit() {
    this.table.trackBy = (_index, entry) => entry.id;
  }
}
