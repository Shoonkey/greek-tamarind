import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { AcmsChipFilter } from '../acms-chip-filter/acms-chip-filter';
import { PoeVersion } from '../../models/PoeVersion';
import { HideoutListFiltersInput } from '../../services/api-client/api-client';

export interface HideoutFiltersBaseData {
  maps: string[];
  tags: string[];
}

@Component({
  selector: 'app-hideout-list-filters',
  imports: [AcmsChipFilter, MatFormFieldModule, MatInput, MatButtonToggleModule],
  templateUrl: './hideout-list-filters.html',
  styleUrl: './hideout-list-filters.scss',
})
export class HideoutListFilters {
  PoeVersion = PoeVersion;

  filtersBaseData = input.required<HideoutFiltersBaseData>({ alias: 'base-data' });
  filters = input.required<HideoutListFiltersInput>();
  updated = output<HideoutListFiltersInput>();

  updateFilter<T extends keyof HideoutListFiltersInput>(
    filter: T,
    newValue: Exclude<HideoutListFiltersInput[T], undefined> | null,
  ) {
    const newFilters = { ...this.filters() };

    if (newValue != null) newFilters[filter] = newValue;
    else delete newFilters[filter];

    this.updated.emit(newFilters);
  }

  encodePoeVersion(toggleGroupValue: PoeVersion[]) {
    // keep it the same as before if the user attemps to have no options selected
    if (toggleGroupValue.length === 0) return this.filters().poeVersion!;
    if (toggleGroupValue.length === 2) return null;

    return toggleGroupValue[0];
  }

  decodePoeVersion(filterValue?: PoeVersion) {
    if (filterValue == undefined) return [PoeVersion.One, PoeVersion.Two];
    return [filterValue];
  }

  encodeMTX(toggleGroupValue: number[]) {
    if (toggleGroupValue.length === 0) return this.filters().hasMTX!;
    if (toggleGroupValue.length === 2) return null;

    return Boolean(toggleGroupValue[0]);
  }

  decodeMTX(filterValue?: boolean) {
    if (filterValue == undefined) return [0, 1];
    return [filterValue ? 1 : 0];
  }
}
