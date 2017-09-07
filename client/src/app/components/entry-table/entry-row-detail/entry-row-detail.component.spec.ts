import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryRowDetailComponent } from './entry-row-detail.component';

describe('EntryRowDetailComponent', () => {
  let component: EntryRowDetailComponent;
  let fixture: ComponentFixture<EntryRowDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntryRowDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryRowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
