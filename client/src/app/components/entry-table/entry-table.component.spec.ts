import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryTableComponent } from './entry-table.component';

describe('EntryTableComponent', () => {
  let component: EntryTableComponent;
  let fixture: ComponentFixture<EntryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
