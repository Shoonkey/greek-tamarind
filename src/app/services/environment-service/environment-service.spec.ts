import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { EnvironmentService } from './environment-service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(EnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isProduction() should return the `production` flag from the current environment', () => {
    expect(service.isProduction()).toBe(environment.production);
  });

  it('getApiUrl() should return the `apiURL` property from the current environment', () => {
    expect(service.getApiUrl()).toBe(environment.apiURL);
  });
});
