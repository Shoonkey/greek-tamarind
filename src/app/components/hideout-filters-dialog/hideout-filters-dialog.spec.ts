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

  // it("should have the title 'Filters'", () => {});

  // it('should receive and save `baseData`', () => {});
  // it('should receive and save `filters` in a signal', () => {});

  // it('should close on save, emitting the currently selected filters', () => {});
  // it('should close on cancel, emitting nothing (undefined)', () => {});

  // describe('name input', () => {
  //   it('should exist', () => {});
  //   it('should have proper label', () => {});
  //   it('should be bound to `filters.name`', () => {});
  //   it('filters.name should be null when the filters.name = null', () => {});
  // });

  // describe('uses MTX button group', () => {
  //   it('should exist', () => {});
  //   it('should have proper label', () => {});
  //   it("shouldn't allow for the deselection of both options", () => {});

  //   describe('should have both true and false selected', () => {
  //     it('at first', () => {});
  //     it('when filters.hasMTX is falsy', () => {});
  //   });
  // });

  // describe('PoE version button group', () => {
  //   it('should exist', () => {});
  //   it('should have proper label', () => {});

  //   it("shouldn't allow for the deselection of both options", () => {});

  //   describe('should have both versions selected', () => {
  //     it('at first', () => {});
  //     it('when filters.poeVersion is falsy', () => {});
  //   });
  // });

  // describe('maps ACMS chip filter', () => {
  //   it('should exist', () => {});
  //   it('should have proper label', () => {});
  //   it('should pass `items` (list of all items) correctly', () => {});
  //   it('should be bound to filters.mapIds', () => {});
  //   it('filters.mapIds should be null in case no map is selected');
  // });

  // describe('Tags ACMS chip filter', () => {
  //   it('should exist', () => {});
  //   it('should have proper label', () => {});
  //   it('should pass `items` (list of all items) correctly', () => {});
  //   it('should be bound to filters.tagIds', () => {});
  //   it('filters.tagIds should be null in case no tag is selected', () => {});
  // });
});
