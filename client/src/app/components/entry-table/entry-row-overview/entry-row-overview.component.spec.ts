import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryRowOverviewComponent } from './entry-row-overview.component';

describe('EntryRowOverviewComponent', () => {
  let component: EntryRowOverviewComponent;
  let fixture: ComponentFixture<EntryRowOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntryRowOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryRowOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
