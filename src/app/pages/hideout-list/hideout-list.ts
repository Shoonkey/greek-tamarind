import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ApiClient } from '../../services/api-client/api-client';
import { HideoutMetadata } from '../../models/HideoutMetadata';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
import {
  HideoutFiltersBaseData,
  HideoutListFilters,
  HideoutListFiltersOutput,
} from '../../components/hideout-list-filters/hideout-list-filters';

@Component({
  selector: 'app-hideout-list',
  imports: [HideoutCard, PaginationControl, HideoutListFilters],
  templateUrl: './hideout-list.html',
  styleUrl: './hideout-list.scss',
})
export class HideoutList implements OnInit {
  apiClient = inject(ApiClient);

  hideoutTags = signal<string[]>([]);
  hideoutMaps = signal<string[]>([]);
  hideouts = signal<HideoutMetadata[]>([]);
  filters = signal<HideoutListFiltersOutput>({});

  currentPage = signal<number>(1);
  pageCount = signal<number | null>(null);
  loading = signal<boolean>(false);
  errors = signal<string[]>([]);

  filtersBaseData = computed<HideoutFiltersBaseData>(() => ({
    maps: this.hideoutMaps(),
    tags: this.hideoutTags(),
  }));

  ngOnInit() {
    const api = this.apiClient;

    this.startLoading();

    forkJoin({
      pageCount: api.getHideoutPageCount(),
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
      list: this.loadHideouts(),
    })
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: ({ pageCount, tags, maps, list }) => {
          this.pageCount.set(pageCount);
          this.hideoutTags.set(tags);
          this.hideoutMaps.set(maps);
          this.hideouts.set(list);
        },
        error: (err) => this.addError(err),
      });
  }

  updateFilters(newFilters: HideoutListFiltersOutput) {
    this.filters.set(newFilters);
    this.currentPage.set(1);

    this.loadHideouts()
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (list) => this.hideouts.set(list),
        error: (err) => this.addError(err),
      });
  }

  handlePageChange(newPage: number) {
    this.currentPage.set(newPage);

    this.startLoading();

    this.loadHideouts()
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (list) => this.hideouts.set(list),
        error: (err) => this.addError(err),
      });
  }

  loadHideouts() {
    return this.apiClient.getHideoutList({
      page: this.currentPage(),
      filters: this.filters(),
    });
  }

  addError(errorMsg: string) {
    this.errors.update((list) => [...list, errorMsg]);
  }

  clearErrors() {
    this.errors.set([]);
  }

  startLoading() {
    this.loading.set(true);
    this.clearErrors();
  }

  finishLoading() {
    this.loading.set(false);
  }
}
