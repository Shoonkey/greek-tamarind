import { Component, inject, OnInit, signal } from '@angular/core';

import { ApiClient, PaginationOptions } from '../../services/api-client/api-client';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
import { HideoutMetadata } from '../../models/HideoutMetadata';
import { AcmsChipFilter } from '../../components/acms-chip-filter/acms-chip-filter';

@Component({
  selector: 'app-hideout-list',
  imports: [HideoutCard, PaginationControl, AcmsChipFilter],
  templateUrl: './hideout-list.html',
  styleUrl: './hideout-list.scss',
})
export class HideoutList implements OnInit {
  apiClient = inject(ApiClient);

  hideoutTags = signal<string[]>([]);
  hideoutMaps = signal<string[]>([]);
  hideouts = signal<HideoutMetadata[]>([]);

  currentPage = signal<number>(1);
  pageCount = signal<number | null>(null);
  loading = signal<boolean>(false);
  errors = signal<string[]>([]);

  ngOnInit() {
    Promise.all([
      this.loadHideoutPageCount(),
      this.loadHideoutTags(),
      this.loadHideoutMaps(),
      this.loadHideoutTags(),
      this.loadHideouts({ page: this.currentPage() }),
    ]);
  }

  handlePageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadHideouts({ page: newPage });
  }

  async loadHideoutPageCount() {
    const response = await this.apiClient.getHideoutPageCount();

    if (response.ok) this.pageCount.set(response.data.pageCount);
    else this.addError(response.errorMsg);
  }

  async loadHideoutTags() {
    const response = await this.apiClient.getHideoutTags();

    if (response.ok) this.hideoutTags.set(response.data.tags);
    else this.addError(response.errorMsg);
  }

  async loadHideoutMaps() {
    const response = await this.apiClient.getHideoutMaps();

    if (response.ok) this.hideoutMaps.set(response.data.maps);
    else this.addError(response.errorMsg);
  }

  async loadHideouts({ page }: PaginationOptions) {
    const response = await this.apiClient.getHideoutList({ page });

    if (response.ok) this.hideouts.set(response.data.list);
    else this.addError(response.errorMsg);
  }

  addError(errorMsg: string) {
    this.errors.update((list) => [...list, errorMsg]);
  }

  clearErrors() {
    this.errors.set([]);
  }
}
