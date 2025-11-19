import {
  Component,
  inject,
  isSignal,
  OnDestroy,
  provideZonelessChangeDetection,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonToggleGroupHarness } from '@angular/material/button-toggle/testing';
import { Subscription } from 'rxjs';

import { mockHideoutMaps } from '../../mocks/hideout-maps';
import { mockHideoutTags } from '../../mocks/hideout-tags';
import { PoeVersion } from '../../models/PoeVersion';
import { HideoutListFiltersInput } from '../../services/api-client/api-client';
import { CustomBooleanToggleTester } from '../../test-utils/custom-boolean-toggle-tester.spec';
import { AcmsChipFilterHarness } from '../acms-chip-filter/testing/acms-chip-filter.harness';
import { DialogData, HideoutFiltersDialog } from './hideout-filters-dialog';

@Component({
  selector: 'mock-dialog-opener',
  template: '',
})
class MockDialogOpener implements OnDestroy {
  private _dialogManager = inject(MatDialog);
  private _dialogData = inject(DIALOG_DATA);
  private _dialogRef: MatDialogRef<HideoutFiltersDialog, HideoutListFiltersInput>;
  private _subscription: Subscription;

  onCloseSpy: jasmine.Spy = jasmine.createSpy('DialogOnCloseSpy');

  constructor() {
    this._dialogRef = this._dialogManager.open(HideoutFiltersDialog, { data: this._dialogData });
    this._subscription = this._dialogRef.afterClosed().subscribe((data) => this.onCloseSpy(data));
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  get dialog() {
    return this._dialogRef.componentInstance;
  }
}

describe('HideoutFiltersDialog', () => {
  let dialogOpener: MockDialogOpener;
  let fixture: ComponentFixture<MockDialogOpener>;
  let dialog: HideoutFiltersDialog;

  let harnessLoader: HarnessLoader;
  let dialogHarness: MatDialogHarness;

  const dialogData: DialogData = {
    baseData: {
      maps: mockHideoutMaps,
      tags: mockHideoutTags,
    },
    filters: {},
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MockDialogOpener],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: DIALOG_DATA,
          useValue: dialogData,
        },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });

    fixture = TestBed.createComponent(MockDialogOpener);
    dialogOpener = fixture.componentInstance;
    dialog = dialogOpener.dialog;

    harnessLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    dialogHarness = (await harnessLoader.getHarnessOrNull(MatDialogHarness))!;

    await fixture.whenStable();
  });

  it('should be able to open', () => {
    expect(dialog).toBeTruthy();
    expect(dialogHarness).not.toBeNull();
  });

  it("should have the title 'Filters'", async () => {
    const title = await dialogHarness.getTitleText();
    expect(title).toBe('Filters');
  });

  it('should receive data properly', () => {
    expect(dialog.data).toEqual(dialogData);
  });

  it('should receive and save `filters` in a signal', () => {
    expect(isSignal(dialog.selectedFilters))
      .withContext('`selectedFilters` should be a signal')
      .toBeTrue();

    expect(dialog.selectedFilters()).toEqual(dialogData.filters);
  });

  it('should have proper actions available', async () => {
    const actionBtnsHarnesses = await dialogHarness.getAllHarnesses(
      MatButtonHarness.with({ ancestor: 'mat-dialog-actions' }),
    );

    expect(actionBtnsHarnesses.length).withContext('there should be exactly two actions').toBe(2);
    const [saveBtnHarness, cancelBtnHarness] = actionBtnsHarnesses;

    expect(await saveBtnHarness.getText())
      .withContext('first action button should be the save button')
      .toBe('Save');
    expect(await cancelBtnHarness.getText())
      .withContext('second action button should be the cancel button')
      .toBe('Cancel');
  });

  it('should close on save, emitting the currently selected filters', async () => {
    const saveBtnHarness = await dialogHarness.getHarness(
      MatButtonHarness.with({ ancestor: 'mat-dialog-actions', selector: 'button:first-child' }),
    );

    dialog.updateFilter('hasMTX', true);
    dialog.updateFilter('poeVersion', PoeVersion.One);
    await fixture.whenStable();
    await saveBtnHarness.click();

    expect(dialogOpener.onCloseSpy).toHaveBeenCalledOnceWith({
      hasMTX: true,
      poeVersion: PoeVersion.One,
    });
  });

  it('should close on cancel, emitting nothing (undefined)', async () => {
    const cancelBtnHarness = await dialogHarness.getHarness(
      MatButtonHarness.with({ ancestor: 'mat-dialog-actions', selector: 'button:last-child' }),
    );

    dialog.updateFilter('hasMTX', true);
    dialog.updateFilter('poeVersion', PoeVersion.One);
    await fixture.whenStable();
    await cancelBtnHarness.click();

    expect(dialogOpener.onCloseSpy).toHaveBeenCalledOnceWith(undefined);
  });

  describe('name field', () => {
    let nameFormField: MatFormFieldHarness;
    let nameInput: MatInputHarness;

    beforeEach(async () => {
      nameFormField = (await dialogHarness.getHarnessOrNull(
        MatFormFieldHarness.with({ selector: '.name-field' }),
      ))!;

      nameInput = (await dialogHarness.getHarnessOrNull(
        MatInputHarness.with({ ancestor: '.name-field' }),
      ))!;
    });

    it('should exist', () => {
      expect(nameFormField).not.toBeNull();
    });

    it('should be associated with an input', async () => {
      expect(nameInput).not.toBeNull();
    });

    it('should have proper label', async () => {
      expect(await nameFormField.getLabel()).toBe('Name');
    });

    it('should be bound to `filters.name`', async () => {
      expect(await nameInput.getValue())
        .withContext('should be an empty string if `name` is unset')
        .toBe('');

      dialog.updateFilter('name', 'potato');
      expect(await nameInput.getValue())
        .withContext('should update its own value when `name` changes')
        .toBe('potato');

      await nameInput.setValue('fried');
      expect(dialog.selectedFilters().name)
        .withContext('should update `name` when value changes')
        .toBe('fried');
    });

    it('filters.name should be undefined when its value is an empty string', async () => {
      await nameInput.setValue('');
      expect(dialog.selectedFilters().name).toBeUndefined();
    });
  });

  describe('toggle button groups', () => {
    let booleanToggleTester: CustomBooleanToggleTester;

    beforeEach(() => {
      booleanToggleTester = new CustomBooleanToggleTester(harnessLoader);
    });

    describe('MTX field', () => {
      beforeEach(async () => {
        booleanToggleTester.setHarnessPredicate(
          MatButtonToggleGroupHarness.with({ ancestor: '.mtx-field' }),
        );
      });

      it('should exist', async () => {
        await booleanToggleTester.expectElementToExist();
      });

      it('should have proper label', async () => {
        await booleanToggleTester.expectToggleFieldToHaveLabels(
          'Uses MTX',
          'MTX (microtransactions)',
        );
      });

      it('should have two options: Yes and No', async () => {
        await booleanToggleTester.expectTogglesToHaveNames(['Yes', 'No']);
      });

      it('should be bound to filters.hasMTX for values true, false and undefined', async () => {
        await booleanToggleTester.expectOperationToCauseStates({
          causeBothChecked: () => dialog.updateFilter('hasMTX', null), // filters.hasMTX = undefined
          causeUncheckedLeft: () => dialog.updateFilter('hasMTX', false),
          causeUncheckedRight: () => dialog.updateFilter('hasMTX', true),
        });

        await booleanToggleTester.expectStatesToResolveExpressionTo({
          expression: () => dialog.selectedFilters().hasMTX,
          expectedValues: {
            bothChecked: undefined,
            uncheckedRight: true,
            uncheckedLeft: false,
          },
        });
      });

      it("shouldn't allow for the deselection of both options", async () => {
        await booleanToggleTester.expectMultipleDeselectionToBeImpossible();
      });

      it('should have both yes and no selected at first', async () => {
        await booleanToggleTester.expectToggleGroupState('at first', [true, true]);
      });
    });

    describe('PoE version field', () => {
      beforeEach(async () => {
        booleanToggleTester.setHarnessPredicate(
          MatButtonToggleGroupHarness.with({ ancestor: '.poe-version-field' }),
        );
      });

      it('should exist', async () => {
        await booleanToggleTester.expectElementToExist();
      });

      it('should have proper label', async () => {
        await booleanToggleTester.expectToggleFieldToHaveLabels('Version', 'PoE version');
      });

      it('should have two options: 1 and 2', async () => {
        await booleanToggleTester.expectTogglesToHaveNames(['1', '2']);
      });

      it('should be bound to filters.poeVersion for values 1, 2 and undefined', async () => {
        await booleanToggleTester.expectOperationToCauseStates({
          causeBothChecked: () => dialog.updateFilter('poeVersion', null), // filters.poeVersion = undefined
          causeUncheckedLeft: () => dialog.updateFilter('poeVersion', PoeVersion.Two),
          causeUncheckedRight: () => dialog.updateFilter('poeVersion', PoeVersion.One),
        });

        await booleanToggleTester.expectStatesToResolveExpressionTo({
          expression: () => dialog.selectedFilters().poeVersion,
          expectedValues: {
            bothChecked: undefined,
            uncheckedRight: PoeVersion.One,
            uncheckedLeft: PoeVersion.Two,
          },
        });
      });

      it("shouldn't allow for the deselection of both options", async () => {
        await booleanToggleTester.expectMultipleDeselectionToBeImpossible();
      });

      it('should have both 1 and 2 selected at first', async () => {
        await booleanToggleTester.expectToggleGroupState('at first', [true, true]);
      });
    });
  });

  describe('ACMS chip filters', () => {
    describe('maps field', () => {
      let acmsHarness: AcmsChipFilterHarness;

      beforeEach(async () => {
        acmsHarness = (await harnessLoader.getHarnessOrNull(
          AcmsChipFilterHarness.with({ selector: 'app-acms-chip-filter:nth-child(1)' }),
        ))!;
      });

      it('should exist', () => {
        expect(acmsHarness).not.toBeNull();
      });

      it('should have proper label', async () => {
        expect(await acmsHarness.getLabel()).toBe('Maps');
      });

      it('should pass `items` (list of all items) correctly', async () => {
        const optionsHarnesses = await acmsHarness.getOptions();

        const optionNames = [];
        for (const optionHarness of optionsHarnesses)
          optionNames.push(await optionHarness.getText());

        expect(optionNames).toEqual(dialogData.baseData.maps.map((m) => m.name));
      });

      it('should be bound to filters.mapIds', async () => {
        async function getSelectedOptionsNames() {
          const optionsHarnesses = await acmsHarness.getSelectedOptions();

          const selectedOptionNames = [];
          for (const optionHarness of optionsHarnesses)
            selectedOptionNames.push(await optionHarness.getText());

          return selectedOptionNames;
        }

        const mapChoice = dialogData.baseData.maps[0];
        dialog.selectedFilters.set({ mapIds: [mapChoice.id] });
        expect(await getSelectedOptionsNames())
          .withContext('should have one map option when `mapIds` contains one map ID')
          .toEqual([mapChoice.name]);

        dialog.selectedFilters.set({});
        expect(await getSelectedOptionsNames())
          .withContext('should have no options selected when `mapIds` is undefined')
          .toEqual([]);

        await acmsHarness.selectOption(mapChoice.name);
        expect(Array.isArray(dialog.selectedFilters().mapIds))
          .withContext('mapIds should be an array after a map is selected')
          .toBeTruthy();
        expect(dialog.selectedFilters().mapIds)
          .withContext('mapIds should contain the map ID after a map is selected')
          .toContain(mapChoice.id);

        await acmsHarness.selectOption(mapChoice.name); // deselect
        expect(dialog.selectedFilters().mapIds)
          .withContext('mapIds should be undefined when no map is selected')
          .not.toBeDefined();
      });

      it('filters.mapIds should be undefined if no map is selected', async () => {
        expect(dialog.selectedFilters().mapIds).not.toBeDefined();

        // select and deselect
        await acmsHarness.selectOption(dialogData.baseData.maps[0].name);
        await acmsHarness.selectOption(dialogData.baseData.maps[0].name);

        expect(dialog.selectedFilters().mapIds).not.toBeDefined();
      });
    });

    describe('tags field', () => {
      let acmsHarness: AcmsChipFilterHarness;

      beforeEach(async () => {
        acmsHarness = (await harnessLoader.getHarnessOrNull(
          AcmsChipFilterHarness.with({ selector: 'app-acms-chip-filter:nth-child(2)' }),
        ))!;
      });

      it('should exist', () => {
        expect(acmsHarness).not.toBeNull();
      });

      it('should have proper label', async () => {
        expect(await acmsHarness.getLabel()).toBe('Tags');
      });

      it('should pass `items` (list of all items) correctly', async () => {
        const optionsHarnesses = await acmsHarness.getOptions();

        const optionNames = [];
        for (const optionHarness of optionsHarnesses)
          optionNames.push(await optionHarness.getText());

        expect(optionNames).toEqual(dialogData.baseData.tags.map((m) => m.name));
      });

      it('should be bound to filters.tagIds', async () => {
        async function getSelectedOptionsNames() {
          const optionsHarnesses = await acmsHarness.getSelectedOptions();

          const selectedOptionNames = [];
          for (const optionHarness of optionsHarnesses)
            selectedOptionNames.push(await optionHarness.getText());

          return selectedOptionNames;
        }

        const tagChoice = dialogData.baseData.tags[0];
        dialog.selectedFilters.set({ tagIds: [tagChoice.id] });
        expect(await getSelectedOptionsNames())
          .withContext('should have one tag option when `tagIds` contains one tag ID')
          .toEqual([tagChoice.name]);

        dialog.selectedFilters.set({});
        expect(await getSelectedOptionsNames())
          .withContext('should have no options selected when `tagIds` is undefined')
          .toEqual([]);

        await acmsHarness.selectOption(tagChoice.name);
        expect(Array.isArray(dialog.selectedFilters().tagIds))
          .withContext('tagIds should be an array after a tag is selected')
          .toBeTruthy();
        expect(dialog.selectedFilters().tagIds)
          .withContext('tagIds should contain the tag ID after a tag is selected')
          .toContain(tagChoice.id);

        await acmsHarness.selectOption(tagChoice.name); // deselect
        expect(dialog.selectedFilters().tagIds)
          .withContext('tagIds should be undefined when no tag is selected')
          .not.toBeDefined();
      });

      it('filters.tagIds should be undefined if no tag is selected', async () => {
        expect(dialog.selectedFilters().tagIds).not.toBeDefined();

        // select and deselect
        await acmsHarness.selectOption(dialogData.baseData.tags[0].name);
        await acmsHarness.selectOption(dialogData.baseData.tags[0].name);

        expect(dialog.selectedFilters().tagIds).not.toBeDefined();
      });
    });
  });
});
