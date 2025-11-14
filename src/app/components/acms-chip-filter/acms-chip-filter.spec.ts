import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatChipGridHarness, MatChipInputHarness } from '@angular/material/chips/testing';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatBadgeHarness } from '@angular/material/badge/testing';
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
      it('should exist', () => {
        expect(autocomplete).not.toBeNull();
      });
    });

    describe('chip grid', () => {
      // removes "+ {n}" from the end of a string, where n is an integer
      // plus any trailing whitespace
      function takeAwayBadgeText(text: string) {
        return text.replace(/(\s*\+ \d+)$/, '');
      }

      function getCDKDescribedByMessageContainer() {
        return document.querySelector('.cdk-describedby-message-container')!;
      }

      function expectCDKMessage(forId: string) {}

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

  // describe('signals/functions', () => {
  //   describe("getSelectionBadgeDescription()", () => {});

  //   describe('selectedItems()', () => {
  //     it('should update properly when `value` (list of selected values) or `items` (list of all selectable values) change', () => {});
  //   });

  //   describe('filteredItems()', () => {
  //     it('should update properly when `query` changes, with any items that contain it as a substring (case-insensitive)', () => {});
  //   });

  //   describe('isActive()', () => {
  //     it("should be true when there's any item is selected and false otherwise", () => {});
  //   });

  //   describe('change.emit($data)', () => {
  //     it('should emit when a selection is made', () => {});
  //     it('when selecting a new item, should emit with new item in the list', () => {});
  //     it('when deselecting an item, should emit with said item removed from the list', () => {});
  //     it('when deselecting the last item, should emit null', () => {});
  //   });
  // });
});
