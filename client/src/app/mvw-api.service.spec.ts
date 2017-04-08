import { TestBed, inject } from '@angular/core/testing';

import { MVWAPIService } from './mvw-api.service';

describe('MVWAPIService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MVWAPIService]
    });
  });

  it('should ...', inject([MVWAPIService], (service: MVWAPIService) => {
    expect(service).toBeTruthy();
  }));
});
