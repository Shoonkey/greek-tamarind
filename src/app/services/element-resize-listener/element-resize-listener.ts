import { Injectable } from '@angular/core';
import { debounce, interval, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElementResizeListener {
  _subscription?: Subscription | null;

  // `callback` runs `intervalMs` milliseconds after the layout stops being resized
  subscribeToResizeEvent(element: HTMLElement, callback: (entry: ResizeObserverEntry) => void) {
    if (this._subscription)
      throw new Error("[ElementResizeListener] Can't subscribe more than once");

    const intervalMs = 300;

    const observable = new Observable<ResizeObserverEntry>((subscriber) => {
      const observer = new ResizeObserver((entries) =>
        subscriber.next(entries[entries.length - 1]),
      );

      observer.observe(element);
      return () => observer.disconnect();
    });

    this._subscription = observable.pipe(debounce(() => interval(intervalMs))).subscribe(callback);
  }

  unsubscribe() {
    if (!this._subscription) return;
    this._subscription.unsubscribe();
    this._subscription = null;
  }
}
