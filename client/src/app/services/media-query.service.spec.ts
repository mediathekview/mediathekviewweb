import { TestBed } from '@angular/core/testing';

import { MediaQueryService } from './media-query.service';

describe('MediaQueryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MediaQueryService = TestBed.get(MediaQueryService);
    expect(service).toBeTruthy();
  });
});
