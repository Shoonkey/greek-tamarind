import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { KeyboardListener } from './keyboard-listener';

describe('KeyboardListener', () => {
  let service: KeyboardListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), KeyboardListener],
    });

    service = TestBed.inject(KeyboardListener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('.watch(callback) should call `callback` with the keyboard event when a keyup event is fired', () => {
    const mock = { callback: (_ev: Event) => {} };
    const callbackSpy = spyOn(mock, 'callback');

    service.watch(callbackSpy);

    const keyDownEvent = new KeyboardEvent('keydown', { key: 'A', ctrlKey: true, shiftKey: true });
    document.dispatchEvent(keyDownEvent);

    expect(callbackSpy).toHaveBeenCalledTimes(1);

    const returnedEvent = callbackSpy.calls.mostRecent().args[0];
    expect(returnedEvent).toBeDefined();
    expect(returnedEvent instanceof KeyboardEvent).toBeTrue();

    const kbdEvent = returnedEvent as KeyboardEvent;
    expect(kbdEvent.key).toBe(keyDownEvent.key);
    expect(kbdEvent.ctrlKey).toBe(keyDownEvent.ctrlKey);
    expect(kbdEvent.shiftKey).toBe(keyDownEvent.shiftKey);
  });

  it('calling .watch(cb) without unsubscribing to the previous one should throw', () => {
    const cb = () => {};
    service.watch(cb);
    expect(() => service.watch(cb)).toThrow();
  });

  it('should call .unsubscribe() on destroy', () => {
    const unsubscribeSpy = spyOn(service, 'unsubscribe');
    service.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  afterEach(() => {
    service.unsubscribe();
  });
});
