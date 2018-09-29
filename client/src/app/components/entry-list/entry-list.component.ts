import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable, MatTableDataSource } from '@angular/material';
import { AggregatedEntry } from '../../common/model';

@Component({
  selector: 'mvw-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent {
  @ViewChild(MatTable) private table: MatTable<AggregatedEntry>;
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  dataSource: MatTableDataSource<AggregatedEntry>;
  columnsToDisplay = ['channel', 'topic', 'title', 'date', 'time', 'duration', 'play'];

  constructor() {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.initDataSource();
    this.initTable();
  }

  private initDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initTable() {
    this.table.trackBy = (_index, entry) => entry.id;
    this.table.dataSource = this.dataSource;
  }
}
