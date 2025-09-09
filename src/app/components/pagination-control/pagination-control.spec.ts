import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';

import { PaginationControl } from './pagination-control';

describe('PaginationControl', () => {
  let component: PaginationControl;
  let componentRef: ComponentRef<PaginationControl>;
  let fixture: ComponentFixture<PaginationControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationControl],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationControl);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('currentPage', 1);
    componentRef.setInput('totalPages', 2);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
