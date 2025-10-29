import { Injectable } from '@angular/core';

import { SmartList, SmartListOptions } from './smart-list';

@Injectable({
  providedIn: 'root',
})
export class SmartListManager {
  getSmartList<T>(opts: SmartListOptions<T>) {
    class CustomSmartList extends SmartList<T> {}
    return new CustomSmartList(opts);
  }
}
