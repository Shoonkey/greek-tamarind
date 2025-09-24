import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiClient, PaginationOptions } from '../../services/api-client/api-client';
import { HideoutMetadata } from '../../models/HideoutMetadata';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
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
    const api = this.apiClient;

    this.loading.set(true);

    forkJoin({
      pageCount: api.getHideoutPageCount(),
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
      list: api.getHideoutList({ page: this.currentPage() }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ pageCount, tags, maps, list }) => {
          this.pageCount.set(pageCount);
          this.hideoutTags.set(tags);
          this.hideoutMaps.set(maps);
          this.hideouts.set(list);
        },
        error: (err) => {}, // TODO: handle error
      });
  }

  loadHideouts({ page }: PaginationOptions) {
    this.apiClient.getHideoutList({ page });
  }

  handlePageChange(newPage: number) {
    this.currentPage.set(newPage);

    this.loading.set(true);
    // TODO: implement hideout reload
    // this.loadHideouts({ page: newPage });
    // this.loading.set(false);
  }

  addError(errorMsg: string) {
    this.errors.update((list) => [...list, errorMsg]);
  }

  clearErrors() {
    this.errors.set([]);
  }
}
