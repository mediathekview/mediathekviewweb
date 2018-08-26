import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'mvw-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnInit {

  @ViewChild('searchInputElement') searchInputRef: ElementRef<HTMLInputElement>;
  searchInput: FormControl;

  constructor() {
    this.searchInput = new FormControl();
  }

  ngOnInit() {
    console.log(this.searchInputRef);
  }

  eraseClicked() {
    this.searchInput.setValue('');
    this.searchInputRef.nativeElement.focus();
  }
}
