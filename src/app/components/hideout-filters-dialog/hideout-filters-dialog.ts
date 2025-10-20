import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

import { AcmsChipFilter } from '../acms-chip-filter/acms-chip-filter';
import { HideoutListFiltersInput } from '../../services/api-client/api-client';
import { PoeVersion } from '../../models/PoeVersion';
import { HideoutMap } from '../../models/HideoutMap';
import { HideoutTag } from '../../models/HideoutTag';

export interface HideoutFiltersBaseData {
  maps: HideoutMap[];
  tags: HideoutTag[];
}

export interface DialogData {
  baseData: HideoutFiltersBaseData;
  filters: HideoutListFiltersInput;
}

@Component({
  selector: 'app-hideout-filters-dialog',
  imports: [
    AcmsChipFilter,
    MatFormFieldModule,
    MatInput,
    MatButtonToggleModule,
    MatButton,
    MatDialogModule,
  ],
  templateUrl: './hideout-filters-dialog.html',
  styleUrl: './hideout-filters-dialog.scss',
})
export class HideoutFiltersDialog {
  PoeVersion = PoeVersion;

  dialogRef = inject(MatDialogRef<HideoutFiltersDialog, HideoutListFiltersInput>);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  selectedFilters = signal(this.data.filters);

  updateFilter<T extends keyof HideoutListFiltersInput>(
    filter: T,
    newValue: Exclude<HideoutListFiltersInput[T], undefined> | null,
  ) {
    this.selectedFilters.update((current) => {
      const newFilters = { ...current };

      if (newValue != null) newFilters[filter] = newValue;
      else delete newFilters[filter];

      return newFilters;
    });
  }

  encodePoeVersion(toggleGroupValue: PoeVersion[]) {
    // keep it the same as before if the user attemps to have no options selected
    if (toggleGroupValue.length === 0) return this.selectedFilters().poeVersion!;
    if (toggleGroupValue.length === 2) return null;

    return toggleGroupValue[0];
  }

  decodePoeVersion(filterValue?: PoeVersion) {
    if (filterValue == undefined) return [PoeVersion.One, PoeVersion.Two];
    return [filterValue];
  }

  encodeMTX(toggleGroupValue: number[]) {
    if (toggleGroupValue.length === 0) return this.selectedFilters().hasMTX!;
    if (toggleGroupValue.length === 2) return null;

    return Boolean(toggleGroupValue[0]);
  }

  decodeMTX(filterValue?: boolean) {
    if (filterValue == undefined) return [0, 1];
    return [filterValue ? 1 : 0];
  }

  tagsToOptions(tags: HideoutTag[]) {
    return tags.map((t) => ({ label: t.name, value: t.id }));
  }

  mapsToOptions(maps: HideoutMap[]) {
    return maps.map((m) => ({ label: m.name, value: m.id }));
  }
}
