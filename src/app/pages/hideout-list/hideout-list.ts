import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { MatButton } from '@angular/material/button';

import { ApiClient, HideoutListFiltersInput } from '../../services/api-client/api-client';
import { HideoutMetadata } from '../../models/HideoutMetadata';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
import {
  HideoutFiltersBaseData,
  HideoutListFilters,
} from '../../components/hideout-list-filters/hideout-list-filters';

@Component({
  selector: 'app-hideout-list',
  imports: [HideoutCard, PaginationControl, HideoutListFilters, MatButton],
  templateUrl: './hideout-list.html',
  styleUrl: './hideout-list.scss',
})
export class HideoutList implements OnInit {
  apiClient = inject(ApiClient);

  hideoutTags = signal<string[]>([]);
  hideoutMaps = signal<string[]>([]);
  hideouts = signal<HideoutMetadata[]>([]);
  filters = signal<HideoutListFiltersInput>({});

  currentPage = signal<number>(1);
  pageCount = signal<number | null>(null);
  loading = signal<boolean>(false);
  errors = signal<string[]>([]);

  filtersBaseData = computed<HideoutFiltersBaseData>(() => ({
    maps: this.hideoutMaps(),
    tags: this.hideoutTags(),
  }));

  ngOnInit() {
    this.loadPageData();
  }

  updateFilters(newFilters: HideoutListFiltersInput) {
    this.filters.set(newFilters);
  }

  handlePageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadHideouts();
  }

  performSearch(e: SubmitEvent) {
    e.preventDefault();
    this.currentPage.set(1);
    this.loadHideouts();
  }

  loadPageData() {
    const api = this.apiClient;

    this.startLoading();

    forkJoin({
      pageCount: api.getHideoutPageCount(),
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
      list: this.loadHideouts({ standalone: false }),
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

  loadHideouts(opts: { standalone?: boolean } = {}) {
    const { standalone = true } = opts;

    if (standalone) this.startLoading();

    const observable = this.apiClient.getHideoutList({
      page: this.currentPage(),
      filters: this.filters(),
    });

    if (standalone)
      observable.pipe(finalize(() => this.finishLoading())).subscribe({
        next: (list) => this.hideouts.set(list),
        error: (err) => this.addError(err),
      });

    return observable;
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
