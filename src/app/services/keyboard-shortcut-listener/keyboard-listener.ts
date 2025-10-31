import { inject, Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

import { LoggingService } from '../logging-service/logging-service';

@Injectable()
export class KeyboardListener implements OnDestroy {
  private _loggingService = inject(LoggingService);

  private _subscription?: Subscription | null;
  private _keydownEvents = fromEvent(document, 'keydown');

  watch(callback: (ev: KeyboardEvent) => void) {
    if (this._subscription) throw new Error("[KeyboardListener] Can't subscribe more than once");

    this._subscription = this._keydownEvents.subscribe((ev) => {
      const kbdEvent = ev as KeyboardEvent;
      callback(kbdEvent);
    });
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    if (!this._subscription) return;
    this._subscription.unsubscribe();
    this._subscription = null;
    this._loggingService.logInfo('[KeyboardListener] Unsubscribed from keyup event');
  }
}
