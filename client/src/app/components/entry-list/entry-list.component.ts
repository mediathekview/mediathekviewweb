import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
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
  private readonly observedElements: Set<HTMLElement>;
  private readonly nativeElementExpansionPanelMap: WeakMap<Element, MatExpansionPanel>;
  @ViewChild('viewport') private readonly viewPort: CdkVirtualScrollViewport;
  @ViewChildren('entryPanel') private readonly entryPanels: QueryList<MatExpansionPanel>;

  private observer: IntersectionObserver;

  @Input() entries: AggregatedEntry[];

  get panelCollapsedHeight(): Observable<number> {
    return this.mediaQueryService.isXs.pipe(map((isXs) => (isXs ? 64 : 48)));
  }

  get panelExpandedHeight(): Observable<number> {
    return this.mediaQueryService.isXs.pipe(map((isXs) => (isXs ? 96 : 64)));
  }

  get isXs(): Observable<boolean> {
    return this.mediaQueryService.isXs;
  }

  constructor(mediaQueryService: MediaQueryService) {
    this.mediaQueryService = mediaQueryService;

    this.observedElements = new Set();
    this.nativeElementExpansionPanelMap = new WeakMap();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver((entries, observer) => this.onIntersect(entries, observer), {
      root: this.viewPort.elementRef.nativeElement,
      threshold: 0.1
    });

    this.entryPanels.changes.subscribe(() => {
      for (const panel of this.entryPanels.toArray()) {
        const bodyElement = panel._body.nativeElement;
        const panelElement = bodyElement.parentElement as HTMLElement;

        if (!this.observedElements.has(panelElement)) {
          this.observer.observe(panelElement);
          this.observedElements.add(panelElement);
          this.nativeElementExpansionPanelMap.set(panelElement, panel);
        }
      }
    });
  }

  trackEntry(_index: number, entry: AggregatedEntry): string {
    return entry.id;
  }

  onIntersect(entries: IntersectionObserverEntry[], _observer: IntersectionObserver): void {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        const panel = this.nativeElementExpansionPanelMap.get(entry.target);

        if (panel == undefined) {
          throw new Error('panel is undefined');
        }

        panel.close();
      }
    }
  }
}
