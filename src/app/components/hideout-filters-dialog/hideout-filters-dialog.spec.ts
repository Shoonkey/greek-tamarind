import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogData, HideoutFiltersDialog } from './hideout-filters-dialog';

describe('HideoutFiltersDialog', () => {
  let component: HideoutFiltersDialog;
  let componentRef: ComponentRef<HideoutFiltersDialog>;
  let fixture: ComponentFixture<HideoutFiltersDialog>;

  beforeEach(async () => {
    const mockDialogData: DialogData = {
      baseData: {
        maps: [],
        tags: [],
      },
      filters: {},
    };

    await TestBed.configureTestingModule({
      imports: [HideoutFiltersDialog],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HideoutFiltersDialog);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
