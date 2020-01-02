import { DataSource } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaQueryService } from 'src/app/services/media-query.service';
import { AggregatedEntry } from '../../common/models';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

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
export class EntryListComponent implements OnChanges {
  private readonly mediaQueryService: MediaQueryService;
  @ViewChild('scrollViewport', { static: true }) scrollViewport: CdkVirtualScrollViewport;

  @Input() dataSource: DataSource<AggregatedEntry | undefined>;

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('dataSource' in changes) {
      this.scrollViewport.scrollToIndex(0, 'auto');
    }
  }

  trackEntry(index: number, entry: AggregatedEntry | undefined): string | number {
    if (entry == undefined) {
      return index;
    }

    return entry.id;
  }
}
