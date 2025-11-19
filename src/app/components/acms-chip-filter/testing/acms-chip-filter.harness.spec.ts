import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { ACMSOption } from '../acms-chip-filter';
import { AcmsChipFilterHarness } from './acms-chip-filter.harness';
import { AcmsHarnessTest } from './acms-harness-test';
import { MatChipInputHarness } from '@angular/material/chips/testing';

describe('AcmsChipFilterHarness', () => {
  let fixture: ComponentFixture<AcmsHarnessTest>;
  let component: AcmsHarnessTest;
  let loader: HarnessLoader;

  function pickRandomElt<T>(array: T[]) {
    const randomIdx = Math.floor(Math.random() * array.length);
    return {
      idx: randomIdx,
      elt: array[randomIdx],
    };
  }

  function getLabelFromValue(value: string, options: ACMSOption[]) {
    const matchingOption = options.find((opt) => opt.value === value)!;
    expect(matchingOption)
      .withContext(`"${value}" should be a value among the options`)
      .toBeDefined();
    return matchingOption.label;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    fixture = TestBed.createComponent(AcmsHarnessTest);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should be able to load all AcmsChipFilter harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(AcmsChipFilterHarness);
    expect(harnesses.length).toBe(component.acmsFilters.length);
  });

  it('should be able to get component label', async () => {
    const { idx: filterIdx, elt: testFilter } = pickRandomElt(component.acmsFilters);

    const harness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: `app-acms-chip-filter:nth-child(${filterIdx + 1})` }),
    );

    expect(await harness.getLabel()).toBe(testFilter.label);
  });

  it('should be able to get component select aria label', async () => {
    const { idx: filterIdx, elt: testFilter } = pickRandomElt(component.acmsFilters);

    const harness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: `app-acms-chip-filter:nth-child(${filterIdx + 1})` }),
    );

    expect(await harness.getSelectAriaLabel()).toBe(testFilter.selectAriaLabel);
  });

  it('should be able to get a MatOptionHarness for each option', async () => {
    const { idx: filterIdx, elt: testFilter } = pickRandomElt(component.acmsFilters);

    const harness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: `app-acms-chip-filter:nth-child(${filterIdx + 1})` }),
    );

    const optionsHarnesses = await harness.getOptions();

    const optionLabels = [];
    for (const optionHarness of optionsHarnesses) optionLabels.push(await optionHarness.getText());

    expect(optionLabels).toEqual(testFilter.items.map((i) => i.label));
  });

  it('should be able to get a MatOptionHarness for only the selected options', async () => {
    const { idx: filterIdx, elt: testFilter } = pickRandomElt(component.acmsFilters);

    const harness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: `app-acms-chip-filter:nth-child(${filterIdx + 1})` }),
    );

    const selectedOptionsHarnesses = await harness.getSelectedOptions();

    const optionLabels = [];
    for (const optionHarness of selectedOptionsHarnesses)
      optionLabels.push(await optionHarness.getText());

    expect(optionLabels).toEqual(
      testFilter.value.map((v) => getLabelFromValue(v, testFilter.items)),
    );
  });

  it('should be able to load specific harness by label', async () => {
    const { elt: testFilter } = pickRandomElt(component.acmsFilters);

    const harness = (await loader.getHarnessOrNull(
      AcmsChipFilterHarness.with({ label: testFilter.label }),
    ))!;

    expect(harness).withContext('should find component with the given label').not.toBeNull();
    expect(await harness.getSelectAriaLabel()).toBe(testFilter.selectAriaLabel);
  });

  it('should be able to get the autocomplete query', async () => {
    const acmsHarness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: `app-acms-chip-filter:first-child` }),
    );

    const queryInputHarness = await acmsHarness.getHarness(MatChipInputHarness);
    expect(await acmsHarness.getAutocompleteQuery()).toBe(await queryInputHarness.getValue());
  });

  it('should be able to set the autocomplete query', async () => {
    const acmsHarness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: `app-acms-chip-filter:first-child` }),
    );

    const queryInputHarness = await acmsHarness.getHarness(MatChipInputHarness);
    await acmsHarness.setAutocompleteQuery('woah');
    expect(await queryInputHarness.getValue()).toBe('woah');
  });

  it('should be able to select and deselect options', async () => {
    async function getSelectedOptionsNames() {
      const harnessSelectedOptions = await harness.getSelectedOptions();

      const selectedOptionsNames = [];
      for (const optionHarness of harnessSelectedOptions)
        selectedOptionsNames.push(await optionHarness.getText());

      return selectedOptionsNames;
    }

    const harness = await loader.getHarness(
      AcmsChipFilterHarness.with({ selector: 'app-acms-chip-filter:first-child' }),
    );

    const testFilter = component.acmsFilters[0];
    const selectedAtFirstOptionId = testFilter.value[0];
    const selectedAtFirstOptionLabel = getLabelFromValue(selectedAtFirstOptionId, testFilter.items);

    await harness.selectOption(selectedAtFirstOptionLabel); // deselect

    expect(await getSelectedOptionsNames())
      .withContext(
        'should properly deselect when calling .selectOption() on an already selected option',
      )
      .not.toContain(selectedAtFirstOptionLabel);

    await harness.selectOption(selectedAtFirstOptionLabel); // re-select

    expect(await getSelectedOptionsNames())
      .withContext('should properly select when calling .selectOption() on an unselected option')
      .toContain(selectedAtFirstOptionLabel);
  });
});
