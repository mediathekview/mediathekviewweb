import { TestBed, inject } from '@angular/core/testing';

import { MediathekViewWebAPIService } from './mediathek-view-web-api.service';

describe('MediathekViewWebAPIService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediathekViewWebAPIService]
    });
  });

  it('should ...', inject([MediathekViewWebAPIService], (service: MediathekViewWebAPIService) => {
    expect(service).toBeTruthy();
  }));
});
