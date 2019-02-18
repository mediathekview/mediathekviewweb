import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaQueryService } from 'src/app/services/media-query.service';
import { AggregatedEntry } from '../../common/model';

@Component({
  selector: 'mvw-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryListComponent implements AfterViewInit {
  private readonly mediaQueryService: MediaQueryService;

  @Input() entries: AggregatedEntry[];

  get panelCollapsedHeight(): Observable<number> {
    return this.mediaQueryService.isXs.pipe(map((isXs) => (isXs ? 96 : 48)));
  }

  get panelExpandedHeight(): Observable<number> {
    return this.mediaQueryService.isXs.pipe(map((isXs) => (isXs ? 128 : 64)));
  }

  get isXs(): Observable<boolean> {
    return this.mediaQueryService.isXs;
  }

  constructor(mediaQueryService: MediaQueryService) {
    this.mediaQueryService = mediaQueryService;
  }

  ngAfterViewInit(): void {
  }

  trackEntry(_index: number, entry: AggregatedEntry): string {
    return entry.id;
  }
}
