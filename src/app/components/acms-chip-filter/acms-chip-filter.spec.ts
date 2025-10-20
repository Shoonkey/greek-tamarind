import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcmsChipFilter } from './acms-chip-filter';

describe('AcmsChipFilter', () => {
  let component: AcmsChipFilter;
  let componentRef: ComponentRef<AcmsChipFilter>;
  let fixture: ComponentFixture<AcmsChipFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcmsChipFilter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AcmsChipFilter);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('items', []);
    componentRef.setInput('label', 'Filter');
    componentRef.setInput('select-aria-label', 'Option selection');
    componentRef.setInput('value', null);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
