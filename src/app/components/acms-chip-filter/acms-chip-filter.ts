import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';

// TODO(issue): Fix menu closing automatically on option selection

interface ACMSOption {
  label: string;
  value: string;
}

// autocomplete multiselect chip filter
@Component({
  selector: 'app-acms-chip-filter',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatIcon,
  ],
  templateUrl: './acms-chip-filter.html',
  styleUrl: './acms-chip-filter.scss',
})
export class AcmsChipFilter {
  items = input.required<ACMSOption[]>();
  label = input.required<string>();
  selectAriaLabel = input.required<string>({ alias: 'select-aria-label' });
  inputPlaceholder = input<string>('');

  query = signal<string>('');

  value = input.required<string[] | null>();
  change = output<string[] | null>();

  filteredItems = computed<ACMSOption[]>(() => {
    const items = this.items();
    const query = this.query();
    return this.getFilteredItems(items, query);
  });

  selectedItems = computed<ACMSOption[]>(() => {
    const value = this.value();
    const items = this.items();

    if (!value) return [];

    const selected: ACMSOption[] = [];

    for (const id of value) {
      const equivalentItem = items.find((i) => i.value === id);

      if (equivalentItem) selected.push(equivalentItem);
    }

    return selected;
  });

  isActive = computed<boolean>(() => this.selectedItems().length > 0);

  getFilteredItems(items: ACMSOption[], query: string) {
    const lowerCaseQuery = query.toLowerCase();

    if (!lowerCaseQuery) return items;

    const queryMatchingItems = items.filter((item) => {
      return item.label.toLowerCase().includes(lowerCaseQuery);
    });

    return queryMatchingItems;
  }

  isItemSelected(value: string) {
    const list = this.selectedItems();
    return list.find((item) => item.value === value);
  }

  getSelectionBadgeDescription(count: number) {
    switch (count) {
      case 0:
        return 'No other items are selected';
      case 1:
        return 'One other item is also selected';
      default:
        return `${count} items are also selected`;
    }
  }

  handleSelection({ option }: MatAutocompleteSelectedEvent) {
    this.query.set('');

    const selected = this.value() || [];

    if (this.isItemSelected(option.value)) {
      const idx = selected.findIndex((item) => item === option.value);
      this.change.emit(selected.toSpliced(idx, 1));
      return;
    }

    this.change.emit([...selected, option.value]);
  }
}
