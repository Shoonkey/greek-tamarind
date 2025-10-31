import { inject, Injectable } from '@angular/core';

import { EnvironmentService } from '../environment-service/environment-service';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private _environment = inject(EnvironmentService);

  private _log(consoleMethod: 'log' | 'error', ...args: any[]) {
    if (this._environment.isProduction()) return;
    console[consoleMethod]('[dev-only log]', ...args);
  }

  logInfo(...args: any[]) {
    this._log('log', ...args);
  }

  logError(...args: any[]) {
    this._log('error', ...args);
  }
}
