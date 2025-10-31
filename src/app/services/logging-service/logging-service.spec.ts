import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LoggingService } from './logging-service';
import { EnvironmentService } from '../environment-service/environment-service';

function provideMockEnvironment({ prod }: { prod: boolean }) {
  return { isProduction: () => prod };
}

describe('LoggingService', () => {
  let service: LoggingService;
  let consoleSpy: jasmine.SpyObj<Console>;

  describe('in development mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: EnvironmentService, useValue: provideMockEnvironment({ prod: false }) },
        ],
      });

      service = TestBed.inject(LoggingService);
      consoleSpy = spyOnAllFunctions(console);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('logInfo', () => {
      it('should call console.log with passed arguments and a dev-only log notice in development mode', () => {
        const args = ['testing', 'it'];
        service.logInfo(...args);
        expect(consoleSpy.log).toHaveBeenCalledOnceWith('[dev-only log]', ...args);
      });

      it('should not call console.error', () => {
        service.logInfo('test');
        expect(consoleSpy.error).not.toHaveBeenCalled();
      });
    });

    describe('logError', () => {
      it('should call console.error with passed arguments and a dev-only log notice in development mode', () => {
        const args = ['testing', 'it'];

        service.logError(...args);
        expect(consoleSpy.error).toHaveBeenCalledOnceWith('[dev-only log]', ...args);
      });

      it('should not call console.log', () => {
        service.logError('test');
        expect(consoleSpy.log).not.toHaveBeenCalled();
      });
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: EnvironmentService, useValue: provideMockEnvironment({ prod: true }) },
        ],
      });

      service = TestBed.inject(LoggingService);
      consoleSpy = spyOnAllFunctions(console);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('logInfo', () => {
      it('should not call console.error in production', () => {
        service.logError('test');
        expect(consoleSpy.error).not.toHaveBeenCalled();
      });
    });

    describe('logError', () => {
      it('should not call console.error in production', () => {
        service.logError('test');
        expect(consoleSpy.error).not.toHaveBeenCalled();
      });
    });
  });
});
