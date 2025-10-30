import { Injectable } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KeyboardListener {
  private _subscription?: Subscription | null;
  private _keyupEvents = fromEvent(document, 'keydown');

  watch(callback: (ev: KeyboardEvent) => void) {
    if (this._subscription) throw new Error("[KeyboardListener] Can't subscribe more than once");

    this._subscription = this._keyupEvents.subscribe((ev) => {
      const kbdEvent = ev as KeyboardEvent;
      callback(kbdEvent);
    });
  }

  unsubscribe() {
    if (!this._subscription) return;
    this._subscription.unsubscribe();
    this._subscription = null;
  }
}
