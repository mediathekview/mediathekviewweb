import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitDropdownComponent } from './split-dropdown.component';

describe('SplitDropdownComponent', () => {
  let component: SplitDropdownComponent;
  let fixture: ComponentFixture<SplitDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
