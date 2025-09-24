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
  items = input.required<string[]>();
  label = input.required<string>();
  selectAriaLabel = input.required<string>({ alias: 'select-aria-label' });
  inputPlaceholder = input<string>('');

  query = signal<string>('');
  selectedItems = signal<string[]>([]);

  updated = output<string[]>();

  isActive = computed<boolean>(() => this.selectedItems().length > 0);
  filteredItems = computed<string[]>(() => {
    const items = this.items();
    const query = this.query();

    return this.getFilteredItems(items, query);
  });

  getFilteredItems(items: string[], query: string) {
    const lowerCaseQuery = query.toLowerCase();

    if (!lowerCaseQuery) return items;

    const queryMatchingItems = items.filter((item) => {
      return item.toLowerCase().includes(lowerCaseQuery);
    });

    return queryMatchingItems;
  }

  isItemSelected(item: string) {
    const list = this.selectedItems();
    return list.includes(item);
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

    this.selectedItems.update((_selected) => {
      if (this.isItemSelected(option.viewValue)) {
        const idx = _selected.findIndex((item) => item === option.viewValue);
        return _selected.toSpliced(idx, 1);
      }

      return [..._selected, option.viewValue];
    });

    this.updated.emit(this.selectedItems());
  }
}
