import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutListener {
  private _keyupEvents = fromEvent(document, 'keydown');

  watch(callback: (ev: KeyboardEvent) => void) {
    return this._keyupEvents.subscribe((ev) => {
      const kbdEvent = ev as KeyboardEvent;
      callback(kbdEvent);
    });
  }
}
