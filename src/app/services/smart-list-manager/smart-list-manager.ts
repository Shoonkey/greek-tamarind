import { inject, Injectable } from '@angular/core';

import { LoggingService } from '../logging-service/logging-service';
import { SmartList, SmartListOptions } from './smart-list';

@Injectable({
  providedIn: 'root',
})
export class SmartListManager {
  private _loggingService = inject(LoggingService);

  getSmartList<T>(opts: SmartListOptions<T>) {
    class CustomSmartList extends SmartList<T> {}
    return new CustomSmartList(this._loggingService, opts);
  }
}
