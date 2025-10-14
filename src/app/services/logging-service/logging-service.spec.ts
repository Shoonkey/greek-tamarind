import { TestBed } from '@angular/core/testing';

import { LoggingService } from './logging-service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO: implement tests
  // describe('logInfo', () => {
  //   it('should not call console.error', () => {});
  //   it('should call console.log with passed arguments in development mode', () => {});
  //   it('should not call console.log in production', () => {});
  // });

  // describe('logError', () => {
  //   it('should not call console.log');
  //   it('should call console.error with passed arguments in development mode', () => {});
  //   it('should not call console.error in production', () => {});
  // });
});
