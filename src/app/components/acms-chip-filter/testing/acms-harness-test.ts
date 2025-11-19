import { Component } from '@angular/core';

import { AcmsChipFilter, ACMSOption } from '../acms-chip-filter';

interface AcmsFilter {
  label: string;
  selectAriaLabel: string;
  items: ACMSOption[];
  value: string[];
}

@Component({
  selector: 'app-acms-chip-filter-test-component',
  template: `
    @for (filter of acmsFilters; track filter.label; let i = $index) {
      <app-acms-chip-filter
        [label]="filter.label"
        [select-aria-label]="filter.selectAriaLabel"
        [items]="filter.items"
        [value]="filter.value"
        (change)="handleChange(i, $event)"
      />
    }
  `,
  imports: [AcmsChipFilter],
})
export class AcmsHarnessTest {
  acmsFilters: AcmsFilter[] = [
    {
      label: 'Potatoes',
      selectAriaLabel: 'Potato type selection',
      items: [
        { label: 'Russet', value: 'russet' },
        { label: 'Red', value: 'red' },
        { label: 'White', value: 'white' },
      ],
      value: ['russet', 'white'],
    },
    {
      label: 'Tomatoes',
      selectAriaLabel: 'Tomato type selection',
      items: [
        { label: 'Alicante', value: 'alicante' },
        { label: 'Roma', value: 'roma' },
        { label: 'Scorpio', value: 'scorpio' },
      ],
      value: ['alicante', 'roma'],
    },
    {
      label: 'Pasta',
      selectAriaLabel: 'Pasta type selection',
      items: [
        { label: 'Spaghetti', value: 'spaghetti' },
        { label: 'Ravioli', value: 'ravioli' },
        { label: 'Tagliatelle', value: 'tagliatelle' },
      ],
      value: ['spaghetti', 'ravioli'],
    },
  ];

  handleChange(idx: number, newValue: string[] | null) {
    this.acmsFilters[idx].value = newValue ?? [];
  }
}
