import { TestBed } from '@angular/core/testing';

import { SyncDbService } from './sync-db.service';

describe('SyncDbService', () => {
  let service: SyncDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
