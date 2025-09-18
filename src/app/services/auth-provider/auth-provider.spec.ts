import { TestBed } from '@angular/core/testing';

import { AuthProvider } from './auth-provider';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AuthProvider', () => {
  let service: AuthProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(AuthProvider);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
