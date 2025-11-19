import { ComponentRef, OutputRefSubscription, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatChipGridHarness, MatChipInputHarness } from '@angular/material/chips/testing';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatBadgeHarness } from '@angular/material/badge/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { AriaDescriber } from '@angular/cdk/a11y';

import {
  provideMockA11YEnvironment,
  CustomAriaDescriptionTester,
  MockAriaDescriber,
} from '../../test-utils/a11y-util.spec';
import { AcmsChipFilter } from './acms-chip-filter';

describe('AcmsChipFilter', () => {
  let component: AcmsChipFilter;
  let componentRef: ComponentRef<AcmsChipFilter>;
  let fixture: ComponentFixture<AcmsChipFilter>;
  let harnessLoader: HarnessLoader;
  let nativeElt: HTMLElement;

  let formField: MatFormFieldHarness;
  let chipGrid: MatChipGridHarness;
  let chipInput: MatChipInputHarness;
  let autocomplete: MatAutocompleteHarness;

  let mockAriaDescriber: MockAriaDescriber;
  let customAriaDescriptionTester: CustomAriaDescriptionTester;

  const defaults = {
    items: [
      { value: '0', label: 'Gray Wolf' },
      { value: '1', label: 'Maned Wolf' },
      { value: '2', label: 'Axolotl' },
    ],
    label: 'Filter',
    value: null,
    selectAriaLabel: 'Option selection',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcmsChipFilter],
      providers: [provideZonelessChangeDetection(), provideMockA11YEnvironment()],
    }).compileComponents();

    fixture = TestBed.createComponent(AcmsChipFilter);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    nativeElt = fixture.nativeElement;
    harnessLoader = await TestbedHarnessEnvironment.loader(fixture);

    mockAriaDescriber = TestBed.inject(AriaDescriber) as MockAriaDescriber;
    customAriaDescriptionTester = new CustomAriaDescriptionTester(mockAriaDescriber);

    componentRef.setInput('items', defaults.items);
    componentRef.setInput('label', defaults.label);
    componentRef.setInput('select-aria-label', defaults.selectAriaLabel);
    componentRef.setInput('value', defaults.value);

    formField = (await harnessLoader.getHarnessOrNull(MatFormFieldHarness))!;
    chipGrid = (await harnessLoader.getHarnessOrNull(MatChipGridHarness))!;
    autocomplete = (await harnessLoader.getHarnessOrNull(MatAutocompleteHarness))!;
    chipInput = (await harnessLoader.getHarnessOrNull(MatChipInputHarness))!;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('subcomponents', () => {
    describe('form field', () => {
      it('should exist', () => {
        expect(formField).not.toBeNull();
      });

      it('should render label with the correct text', async () => {
        const label = await formField.getLabel();
        expect(label).toBe(defaults.label);
      });
    });

    describe('autocomplete', () => {
      async function getAutocompleteOptions() {
        await autocomplete.focus();
        return await autocomplete.getOptions();
      }

      async function expectAutocompleteOptionsToMatch() {
        const autocompleteOptionsHarnesses = await getAutocompleteOptions();
        const filteredItemsLabels = component.filteredItems().map((i) => i.label);

        for (const optionHarness of autocompleteOptionsHarnesses) {
          const optionLabel = await optionHarness.getText();
          expect(filteredItemsLabels)
            .withContext(`should contain item with label ${optionLabel}`)
            .toContain(optionLabel);
        }
      }

      it('should exist', () => {
        expect(autocomplete).not.toBeNull();
      });

      it('should render items according to `filteredItems`', async () => {
        // filtered items will have both the first and second items
        component.query.set('wolf');
        await expectAutocompleteOptionsToMatch();

        // filtered items will have only first item
        const [item1] = defaults.items;
        componentRef.setInput('items', [item1]);
        await expectAutocompleteOptionsToMatch();

        // filtered items will be empty
        component.query.set('anything');
        await expectAutocompleteOptionsToMatch();
      });

      it('should render a check icon for selected options', async () => {
        const [item1, item2] = defaults.items;
        componentRef.setInput('value', [item1.value, item2.value]);
        component.query.set('wolf');

        const autocompleteOptionsHarnesses = await getAutocompleteOptions();
        for (const optionHarness of autocompleteOptionsHarnesses) {
          const iconHarness = (await optionHarness.getHarnessOrNull(MatIconHarness))!;
          expect(iconHarness).withContext('option should contain an icon').not.toBeNull();
          const iconName = await iconHarness.getName();
          expect(iconName).withContext('option icon should be the check icon').toBe('check_circle');
        }
      });

      it('should render a circle icon for unselected options', async () => {
        const [item1, item2] = defaults.items;
        componentRef.setInput('value', [item1.value, item2.value]);
        component.query.set('axo');

        const autocompleteOptionsHarnesses = await getAutocompleteOptions();
        for (const optionHarness of autocompleteOptionsHarnesses) {
          const iconHarness = (await optionHarness.getHarnessOrNull(MatIconHarness))!;
          expect(iconHarness).withContext('option should contain an icon').not.toBeNull();
          const iconName = await iconHarness.getName();
          expect(iconName).withContext('option icon should be the circle icon').toBe('circle');
        }
      });
    });

    describe('chip grid', () => {
      // removes "+ {n}" from the end of a string, where n is an integer
      // plus any trailing whitespace
      function takeAwayBadgeText(text: string) {
        return text.replace(/(\s*\+ \d+)$/, '');
      }

      it('should exist', () => {
        expect(chipGrid).not.toBeNull();
      });

      it('should have correct aria-label', async () => {
        const gridHostElt = await chipGrid.host();
        const ariaLabel = await gridHostElt.getAttribute('aria-label');
        expect(ariaLabel).toBe(defaults.selectAriaLabel);
      });

      it('should have zero chips at the start', async () => {
        const chipRows = await chipGrid.getRows();
        expect(chipRows.length).toBe(0);
      });

      it('when an item is selected, should have one chip showing the item label, with a hidden badge', async () => {
        const [item1] = defaults.items;
        const chosenItemCount = 1;
        componentRef.setInput('value', [item1.value]);

        const chipRows = await chipGrid.getRows();
        expect(chipRows.length).withContext('should have only 1 chip').toBe(1);

        const chip = chipRows[0];

        const badge = (await harnessLoader.getHarnessOrNull(MatBadgeHarness))!;
        expect(badge).withContext('a badge instance should exist').not.toBeNull();
        expect(await badge.getText())
          .withContext('badge should show there are 2 more selected items')
          .toBe(`+ ${chosenItemCount - 1}`);
        expect(await badge.isHidden())
          .withContext('badge should be hidden')
          .toBeTrue();

        customAriaDescriptionTester.expectRecentDescriptionMessageToBe(
          component.getSelectionBadgeDescription(chosenItemCount - 1),
        );

        const chipText = takeAwayBadgeText(await chip.getText());
        expect(chipText).withContext('chip should have the selected item label').toBe(item1.label);
      });

      it('when more than one item is selected, should have one chip with the first item label and a badge showing how many more are selected', async () => {
        const [item1, item2, item3] = defaults.items;
        const chosenItemCount = 3;
        componentRef.setInput('value', [item1.value, item2.value, item3.value]);

        const chipRows = await chipGrid.getRows();
        expect(chipRows.length).withContext('should have only 1 chip').toBe(1);

        const chip = chipRows[0];

        const badge = (await harnessLoader.getHarnessOrNull(MatBadgeHarness))!;
        expect(badge).withContext('a badge instance should exist').not.toBeNull();
        expect(await badge.isHidden())
          .withContext('badge should not be hidden')
          .toBeFalse();
        expect(await badge.getText())
          .withContext('badge should show there are 2 more selected items')
          .toBe(`+ ${chosenItemCount - 1}`);

        customAriaDescriptionTester.expectRecentDescriptionMessageToBe(
          component.getSelectionBadgeDescription(chosenItemCount - 1),
        );

        const chipText = takeAwayBadgeText(await chip.getText());
        expect(chipText).withContext('chip should have the selected item label').toBe(item1.label);
      });
    });

    describe('input', () => {
      it('should exist', () => {
        expect(chipInput).not.toBeNull();
      });

      it("if set, `inputPlaceholder` should set input's placeholder", async () => {
        expect(await chipInput.getPlaceholder())
          .withContext('if variable is empty, placeholder should also be empty')
          .toBe('');

        componentRef.setInput('inputPlaceholder', 'Type something in...');
        expect(await chipInput.getPlaceholder())
          .withContext('If variable is set, placeholder should update accordingly')
          .toBe('Type something in...');
      });

      it('should be bound to `query` signal', async () => {
        expect(await chipInput.getValue())
          .withContext('input value should start empty')
          .toBe('');

        component.query.set('potato');

        expect(await chipInput.getValue())
          .withContext('changing `query` should change the input value')
          .toBe('potato');

        await chipInput.setValue('frog');

        expect(component.query())
          .withContext('changing input value should change `query`')
          .toBe('frog');
      });
    });
  });

  describe('signals/functions', () => {
    describe('getSelectionBadgeDescription()', () => {
      it('should properly show message for no items', () => {
        expect(component.getSelectionBadgeDescription(0)).toBe('No other items are selected');
      });
      it('should properly show message for a single item', () => {
        expect(component.getSelectionBadgeDescription(1))
          .withContext('should properly show message for a single item')
          .toBe('One other item is also selected');
      });

      it('should properly show message for two or more items', () => {
        for (let i = 2; i < 5; i++)
          expect(component.getSelectionBadgeDescription(i))
            .withContext(`should show proper message for ${i} items`)
            .toBe(`${i} items are also selected`);
      });
    });

    describe('selectedItems()', () => {
      it('should be an empty list when value=null', () => {
        componentRef.setInput('value', null);
        expect(component.selectedItems()).toEqual([]);
      });

      it('should update when `value` (list of selected values) changes', () => {
        const [item1, item2] = defaults.items;
        componentRef.setInput('value', [item1.value, item2.value]);

        const selectedItems = component.selectedItems();
        expect(selectedItems).toContain(item1);
        expect(selectedItems).toContain(item2);
      });

      it('should update when `items` (list of all selectable values) change', () => {
        const [item1, item2] = defaults.items;
        componentRef.setInput('items', [item1]);
        componentRef.setInput('value', [item1.value, item2.value]);

        const selectedItems = component.selectedItems();
        expect(selectedItems).toContain(item1);
        expect(selectedItems).not.toContain(item2);
      });
    });

    describe('isActive()', () => {
      it("should be true when there's any item is selected and false otherwise", () => {
        componentRef.setInput('value', null);
        expect(component.isActive())
          .withContext('should be inactive with no selection')
          .toBeFalse();

        const [item1, item2] = defaults.items;

        componentRef.setInput('value', [item1.value]);
        expect(component.isActive()).withContext('should be active with 1 selection').toBeTrue();

        componentRef.setInput('value', [item1.value, item2.value]);
        expect(component.isActive()).withContext('should be active with 2 selections').toBeTrue();
      });
    });

    describe('filteredItems()', () => {
      it('should show all items when `query` is empty', () => {
        component.query.set('');
        expect(component.filteredItems()).toEqual(defaults.items);
      });

      it('should contain filtered items based on `query` (case-insensitive)', () => {
        const [item1, item2, item3] = defaults.items;

        component.query.set('Gray');
        expect(component.filteredItems())
          .withContext(
            '"Gray" should show first item (matches case, and is at the start of the label)',
          )
          .toEqual([item1]);

        component.query.set('wolf');
        expect(component.filteredItems())
          .withContext(
            '"wolf" should show first and second items (does not match case, is at the end of the labels)',
          )
          .toEqual([item1, item2]);

        component.query.set('oLotL');
        expect(component.filteredItems())
          .withContext(
            '"oLotL" should show third item (does not match case and is in the middle of the label)',
          )
          .toEqual([item3]);
      });

      it('should filter for items that are already selected as well', () => {
        const [item1] = defaults.items;

        componentRef.setInput('value', [item1.value]);
        component.query.set('gray');

        expect(component.filteredItems()).toEqual([item1]);
      });
    });

    describe('change.emit($data)', () => {
      let changeSpy: jasmine.Spy<jasmine.Func>;
      let changeSubscription: OutputRefSubscription;

      beforeEach(() => {
        changeSpy = jasmine.createSpy('ChangeEventSpy');
        changeSubscription = component.change.subscribe((value) => changeSpy(value));
      });

      it('should emit when a selection is made', async () => {
        const [item1] = defaults.items;
        await autocomplete.selectOption({ text: item1.label });
        expect(changeSpy).toHaveBeenCalledOnceWith([item1.value]);
      });

      it('when selecting a new item, should emit a list with previous items and the new one', async () => {
        const [item1, item2] = defaults.items;
        componentRef.setInput('value', [item1.value]);

        await autocomplete.selectOption({ text: item2.label });

        expect(changeSpy).toHaveBeenCalledOnceWith([item1.value, item2.value]);
      });

      it('when deselecting an item, should emit with said item removed from the list', async () => {
        const [item1, item2] = defaults.items;
        componentRef.setInput('value', [item1.value, item2.value]);

        await autocomplete.selectOption({ text: item1.label });

        expect(changeSpy).toHaveBeenCalledOnceWith([item2.value]);
      });

      it('when deselecting the last item, should emit null', async () => {
        const [item1] = defaults.items;
        componentRef.setInput('value', [item1.value]);

        await autocomplete.selectOption({ text: item1.label });

        expect(changeSpy).toHaveBeenCalledOnceWith(null);
      });

      afterEach(() => {
        changeSubscription.unsubscribe();
      });
    });
  });
});
