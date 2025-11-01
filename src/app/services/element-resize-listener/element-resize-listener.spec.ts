import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ElementResizeListener } from './element-resize-listener';
import { Observable } from 'rxjs';

interface ResizeObserverClass {
  new (callback: ResizeObserverCallback): ResizeObserver;
  prototype: ResizeObserver;
}

interface SpyTeam<T = jasmine.Spy<jasmine.Func>> {
  observe: T;
  disconnect: T;
  callback: T;
}

const spyTeam: SpyTeam = {
  observe: jasmine.createSpy('MockResizerObserveSpy'),
  disconnect: jasmine.createSpy('MockResizerDisconnectSpy'),
  callback: jasmine.createSpy('OnResizeCallback'),
};

const mockEntry = { contentRect: { width: 200, height: 200 } } as ResizeObserverEntry;

class MockResizeObserver {
  private _cb: ResizeObserverCallback;

  constructor(cb: ResizeObserverCallback) {
    this._cb = cb;
  }
  observe(_elt: any) {
    spyTeam.observe(_elt);
    this._cb([mockEntry], this);
  }
  disconnect() {
    spyTeam.disconnect();
  }
  unobserve(_elt: any) {}
}

describe('ElementResizeListener', () => {
  let service: ElementResizeListener;
  let OriginalResizeObserver: ResizeObserverClass;
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
    // restores ResizeObserver class and RxJS's Observable .pipe() method to their original versions
    globalThis.ResizeObserver = OriginalResizeObserver;
    Observable.prototype.pipe = originalPipeFn;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('callback should be called when the element resizes', async () => {
    const divElement = document.createElement('div');

    service.subscribeToResizeEvent(divElement, (entry) => spyTeam.callback(entry));

    expect(spyTeam.observe)
      .withContext('.observe(element) is called')
      .toHaveBeenCalledOnceWith(divElement);
    expect(spyTeam.callback)
      .withContext('.callback(entry) is called')
      .toHaveBeenCalledOnceWith(mockEntry);
  });

  it('should call .disconnect() on unsubscribe', () => {});

  it('should call .unsubscribe() on destroy', () => {
    const unsubscribeSpy = spyOn(service, 'unsubscribe');
    service.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  afterEach(() => {
    service.unsubscribe();
  });
});
