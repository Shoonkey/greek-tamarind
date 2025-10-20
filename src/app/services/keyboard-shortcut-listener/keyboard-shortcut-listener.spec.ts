import { TestBed } from '@angular/core/testing';

import { KeyboardShortcutListener } from './keyboard-shortcut-listener';
import { provideZonelessChangeDetection } from '@angular/core';

describe('KeyboardShortcutListener', () => {
  let service: KeyboardShortcutListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(KeyboardShortcutListener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
