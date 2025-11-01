interface SpyTeam<T = jasmine.Spy<jasmine.Func>> {
  observe: T;
  disconnect: T;
  reset: () => void;
}

export class MockResizeObserver {
  private _cb: ResizeObserverCallback;

  static mockEntry = { contentRect: { width: 200, height: 200 } } as ResizeObserverEntry;
  static spyTeam: SpyTeam = {
    observe: jasmine.createSpy('MockResizerObserveSpy'),
    disconnect: jasmine.createSpy('MockResizerDisconnectSpy'),
    reset() {
      this.observe.calls.reset();
      this.disconnect.calls.reset();
    },
  };

  constructor(cb: ResizeObserverCallback) {
    this._cb = cb;
  }
  observe(_elt: any) {
    MockResizeObserver.spyTeam.observe(_elt);
    this._cb([MockResizeObserver.mockEntry], this);
  }
  disconnect() {
    MockResizeObserver.spyTeam.disconnect();
  }
  unobserve(_elt: any) {}
}
