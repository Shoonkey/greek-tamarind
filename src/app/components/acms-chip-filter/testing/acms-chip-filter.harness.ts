import {
  BaseHarnessFilters,
  ComponentHarness,
  ContentContainerComponentHarness,
  HarnessPredicate,
  HarnessQuery,
} from '@angular/cdk/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatOptionHarness } from '@angular/material/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { MatChipGridHarness, MatChipInputHarness } from '@angular/material/chips/testing';

interface AcmsChipFilterHarnessFilters extends BaseHarnessFilters {
  label?: string;
}

export class AcmsChipFilterHarness extends ContentContainerComponentHarness {
  static hostSelector = 'app-acms-chip-filter';
  static selectedIconName = 'check_circle';

  static with(options: AcmsChipFilterHarnessFilters): HarnessPredicate<AcmsChipFilterHarness> {
    const predicate = new HarnessPredicate(AcmsChipFilterHarness, options);

    predicate.addOption('label', options.label, (harness, label) =>
      HarnessPredicate.stringMatches(harness.getLabel(), label),
    );

    return predicate;
  }

  protected getFormField = this.locatorFor(MatFormFieldHarness);
  protected getQueryInput = this.locatorFor(MatChipInputHarness);
  protected getAutocomplete = this.locatorFor(MatAutocompleteHarness);
  protected getChipGrid = this.locatorFor(MatChipGridHarness);

  async getLabel(): Promise<string> {
    const matFormField = await this.getFormField();
    const fieldLabel = await matFormField.getLabel();
    return fieldLabel || '';
  }

  async getSelectAriaLabel() {
    const chipGrid = await this.getChipGrid();
    const chipGridHost = await chipGrid.host();
    return await chipGridHost.getAttribute('aria-label');
  }

  async getAutocompleteQuery() {
    const queryInput = await this.getQueryInput();
    return await queryInput.getValue();
  }

  async setAutocompleteQuery(newValue: string) {
    const queryInput = await this.getQueryInput();
    await queryInput.setValue(newValue);
  }

  async selectOption(optionText: string) {
    const autocomplete = await this.getAutocomplete();
    await autocomplete.selectOption({ text: optionText });
    await autocomplete.blur();
  }

  async getOptions(): Promise<MatOptionHarness[]> {
    const queryInput = await this.getQueryInput();
    const autocomplete = await this.getAutocomplete();

    const originalQueryValue = await queryInput.getValue();
    await queryInput.setValue('');
    const optionsHarnesses = await autocomplete.getOptions();
    await queryInput.setValue(originalQueryValue);

    return optionsHarnesses;
  }

  async getSelectedOptions(): Promise<MatOptionHarness[]> {
    const optionsHarnesses = await this.getOptions();
    const filteredOptionsHarnesses = [];

    for (const optionHarness of optionsHarnesses) {
      const optionIcon = await this._getOptionIcon(optionHarness);
      if (optionIcon === AcmsChipFilterHarness.selectedIconName)
        filteredOptionsHarnesses.push(optionHarness);
    }

    return filteredOptionsHarnesses;
  }

  private async _getOptionIcon(optionHarness: MatOptionHarness) {
    const iconHarness = await optionHarness.getHarness(MatIconHarness);
    const iconName = await iconHarness.getName();
    return iconName;
  }
}
