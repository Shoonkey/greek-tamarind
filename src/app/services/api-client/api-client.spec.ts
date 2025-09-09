import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ApiClient } from './api-client';

describe('ApiClient', () => {
  let service: ApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO: Implement ApiClient tests
  // it('should be able to make requests', () => {});
  // it('should return with ok = true and data for successful requests', () => {})
  // it('should return with ok = false and proper error code for failed requests', () => {});
  // it('should return with ok = false and unexpected error code if user is offline', () => {});
  // it(
  //   'should return with ok = false and unexpected error in a failed request ' +
  //     "where the API doesn't provide a proper error code",
  //   () => {},
  // );

  // it('should not yield error if a request is cancelled', () => {});
  // it('should allow for request cancellation', () => {});
});
