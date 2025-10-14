import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private _log(consoleMethod: 'log' | 'error', ...args: any[]) {
    if (environment.production) return;
    console[consoleMethod]('[dev-only log]', ...args);
  }

  logInfo(...args: any[]) {
    this._log('log', ...args);
  }

  logError(...args: any[]) {
    this._log('error', ...args);
  }
}
