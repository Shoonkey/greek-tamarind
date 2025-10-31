import { inject, Injectable, OnDestroy } from '@angular/core';
import { debounce, interval, Observable, Subscription } from 'rxjs';
import { LoggingService } from '../logging-service/logging-service';

@Injectable()
export class ElementResizeListener implements OnDestroy {
  private _loggingService = inject(LoggingService);
  private _subscription?: Subscription | null;

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

  ngOnDestroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    if (!this._subscription) return;
    this._subscription.unsubscribe();
    this._subscription = null;
    this._loggingService.logInfo('[ElementResizeListener] Unsubscribed from element resize event');
  }
}
