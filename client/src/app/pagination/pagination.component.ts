import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mvw-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() pageSize: number;
  @Input() selectedIndex: number;
  @Input() totalItems: number;

  @Output() onNavigate = new EventEmitter();

  canNavigateBackward: boolean;
  canNavigateForward: boolean;
  currentPage: number;
  pagingStart: number;
  pagingEnd: number;

  pages: number[];

  constructor() { }

  ngOnChanges() {
    let totalPages = Math.ceil(this.totalItems / this.pageSize);
    let currentPage = Math.floor(this.selectedIndex / this.pageSize);
    let pagingStart = Math.max(0, currentPage - 2 - (2 - Math.min(2, totalPages - (currentPage + 1))));
    let pagingEnd = Math.min(totalPages, pagingStart + 5);
    let canNavigateBackward = this.selectedIndex >= this.pageSize;
    let canNavigateForward = ((totalPages * this.pageSize) - this.selectedIndex) > this.pageSize;

    let pages: number[] = [];
    for (let i = pagingStart; i < pagingEnd; i++) {
      pages.push(i);
    }

    this.canNavigateForward = canNavigateForward;
    this.canNavigateBackward = canNavigateBackward;
    this.currentPage = currentPage;
    this.pagingStart = pagingStart;
    this.pagingEnd = pagingEnd;
    this.pages = pages;
  }

  navigateBackward() {
    if (this.canNavigateBackward) {
      this.navigateTo(this.currentPage - 1);
    }
  }

  navigateForward() {
    if (this.canNavigateForward) {
      this.navigateTo(this.currentPage + 1);
    }
  }

  navigateTo(page: number) {
    this.onNavigate.emit(page * this.pageSize);
  }
}
