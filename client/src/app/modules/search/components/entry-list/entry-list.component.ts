import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, ReplaySubject } from 'rxjs';
import { PublicEntry } from 'src/app/shared/models';

const panelCollapsedHeightLarge = 48;
const panelCollapsedHeightSmall = 72;
const panelExpandedHeightLarge = 64;
const panelExpandedHeightSmall = 96;

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryListComponent implements OnInit {
  private readonly breakpointObserver: BreakpointObserver;
  private readonly panelCollapsedHeightSubject: ReplaySubject<number>;
  private readonly panelExpandedHeightSubject: ReplaySubject<number>;

  @Input() entries: PublicEntry[];
  @Input() resultsCount: number;

  @Input() pageSize: number;
  @Output() pageSizeChange: EventEmitter<number>;

  @Input() pageIndex: number;
  @Output() pageIndexChange: EventEmitter<number>;


  get panelCollapsedHeight$(): Observable<number> {
    return this.panelCollapsedHeightSubject.asObservable();
  }

  get panelExpandedHeight$(): Observable<number> {
    return this.panelExpandedHeightSubject.asObservable();
  }

  constructor(breakpointObserver: BreakpointObserver) {
    this.breakpointObserver = breakpointObserver;

    this.panelCollapsedHeightSubject = new ReplaySubject(1);
    this.panelExpandedHeightSubject = new ReplaySubject(1);

    this.pageSizeChange = new EventEmitter();
    this.pageIndexChange = new EventEmitter();

    this.resultsCount = 100;
    this.pageSize = 5;
    this.pageIndex = 0;
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(min-width: 768px)').subscribe((result) => {
      this.panelCollapsedHeightSubject.next(result.matches ? panelCollapsedHeightLarge : panelCollapsedHeightSmall);
      this.panelExpandedHeightSubject.next(result.matches ? panelExpandedHeightLarge : panelExpandedHeightSmall);
    });
  }

  onPage(event: PageEvent) {
    if (event.pageSize != this.pageSize) {
      this.pageSize = event.pageSize;
      this.pageSizeChange.emit(this.pageSize);
    }

    if (event.pageIndex != this.pageIndex) {
      this.pageIndex = event.pageIndex;
      this.pageIndexChange.emit(this.pageIndex);
    }
  }
}
