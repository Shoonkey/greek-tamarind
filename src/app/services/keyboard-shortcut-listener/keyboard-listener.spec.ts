import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { KeyboardListener } from './keyboard-listener';

describe('KeyboardListener', () => {
  let service: KeyboardListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(KeyboardListener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
