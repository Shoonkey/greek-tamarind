import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SmartListManager } from './smart-list-manager';

describe('SmartListManager', () => {
  let service: SmartListManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SmartListManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
