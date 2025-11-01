import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Observable } from 'rxjs';

import { ElementResizeListener } from './element-resize-listener';
import { MockResizeObserver } from './mock-resize-observer.spec';

interface OriginalResizeObserverClass {
  new (callback: ResizeObserverCallback): ResizeObserver;
  prototype: ResizeObserver;
}

describe('ElementResizeListener', () => {
  let service: ElementResizeListener;
  let OriginalResizeObserver: OriginalResizeObserverClass;
  let originalPipeFn: <T>() => Observable<T>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ElementResizeListener],
    });

    service = TestBed.inject(ElementResizeListener);

    /**
     * Setup:
     * - mock ResizeObserver so we don't depend on actual DOM resizing to happen to test functionality
     * (there's no need to test if ResizeObserver itself works since it's an official Web API)
     * - neutralize RxJS's .pipe() to bypass the debounce time normally added by this service
     * for the event call for the purpose of testing
     */

    OriginalResizeObserver = ResizeObserver;
    originalPipeFn = Observable.prototype.pipe;

    globalThis.ResizeObserver = MockResizeObserver;
    Observable.prototype.pipe = function () {
      return this;
    };
  });

  afterEach(() => {
    service.unsubscribe();
    MockResizeObserver.spyTeam.reset();

    // restores ResizeObserver class and RxJS's Observable .pipe() method to their original versions
    globalThis.ResizeObserver = OriginalResizeObserver;
    Observable.prototype.pipe = originalPipeFn;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('callback should be called when the element resizes', async () => {
    const callbackSpy = jasmine.createSpy();

    const divElement = document.createElement('div');
    service.subscribeToResizeEvent(divElement, (entry) => callbackSpy(entry));

    expect(MockResizeObserver.spyTeam.observe)
      .withContext('.observe(element) is called')
      .toHaveBeenCalledOnceWith(divElement);
    expect(callbackSpy)
      .withContext('.callback(entry) is called')
      .toHaveBeenCalledOnceWith(MockResizeObserver.mockEntry);
  });

  it('should call .disconnect() on unsubscribe', () => {
    const divElement = document.createElement('div');
    service.subscribeToResizeEvent(divElement, () => {});
    service.unsubscribe();
    expect(MockResizeObserver.spyTeam.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should call .unsubscribe() on destroy', () => {
    const unsubscribeSpy = spyOn(service, 'unsubscribe');
    service.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
