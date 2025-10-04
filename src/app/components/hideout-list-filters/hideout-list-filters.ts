import { Component, input, output, signal } from '@angular/core';

import { AcmsChipFilter } from '../acms-chip-filter/acms-chip-filter';

export interface HideoutFiltersBaseData {
  maps: string[];
  tags: string[];
}

export interface HideoutListFiltersOutput {
  maps?: string[];
  tags?: string[];
}

@Component({
  selector: 'app-hideout-list-filters',
  imports: [AcmsChipFilter],
  templateUrl: './hideout-list-filters.html',
  styleUrl: './hideout-list-filters.scss',
})
export class HideoutListFilters {
  filtersBaseData = input.required<HideoutFiltersBaseData>({ alias: 'base-data' });
  filters = signal<HideoutListFiltersOutput>({});
  updated = output<HideoutListFiltersOutput>();

  updateFilter<T extends keyof HideoutListFiltersOutput>(
    filter: T,
    newValue: Exclude<HideoutListFiltersOutput[T], undefined> | null,
  ) {
    if (newValue) {
      this.filters.update((_filters) => ({ ..._filters, [filter]: newValue }));
    } else {
      this.filters.update((_filters) => {
        const newFilters = { ..._filters };
        delete newFilters[filter];
        return newFilters;
      });
    }

    this.updated.emit(this.filters());
  }
}
