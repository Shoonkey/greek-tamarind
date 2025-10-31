import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ElementResizeListener } from './element-resize-listener';

describe('ElementResizeListener', () => {
  let service: ElementResizeListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ElementResizeListener],
    });
    service = TestBed.inject(ElementResizeListener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
