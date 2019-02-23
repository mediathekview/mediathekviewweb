import { CdkScrollable } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaQueryService } from 'src/app/services/media-query.service';
import { AggregatedEntry } from '../../common/model';

const panelCollapsedHeightLarge = 48;
const panelCollapsedHeightSmall = 96;
const panelExpandedHeightLarge = 64;
const panelExpandedHeightSmall = 128;

@Component({
  selector: 'mvw-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryListComponent implements AfterViewInit {
  private readonly mediaQueryService: MediaQueryService;
  @ViewChild('scrollContainer', { read: CdkScrollable }) private readonly scrollable: CdkScrollable;

  @Input() entries: AggregatedEntry[];

  @Output() endReached: EventEmitter<void>;

  get panelCollapsedHeight(): Observable<number> {
    return this.mediaQueryService.isXs.pipe(map((isXs) => (isXs ? panelCollapsedHeightSmall : panelCollapsedHeightLarge)));
  }

  get panelExpandedHeight(): Observable<number> {
    return this.mediaQueryService.isXs.pipe(map((isXs) => (isXs ? panelExpandedHeightSmall : panelExpandedHeightLarge)));
  }

  get isXs(): Observable<boolean> {
    return this.mediaQueryService.isXs;
  }

  constructor(mediaQueryService: MediaQueryService) {
    this.mediaQueryService = mediaQueryService;

    this.endReached = new EventEmitter();
  }

  ngAfterViewInit(): void {
    this.scrollable.elementScrolled().subscribe(() => {
      const offset = this.scrollable.measureScrollOffset('bottom');

      if (offset < panelCollapsedHeightLarge * 5) {
        this.endReached.next();
      }
    });
  }

  trackEntry(_index: number, entry: AggregatedEntry): string {
    return entry.id;
  }
}
