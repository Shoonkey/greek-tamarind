import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { debounce, finalize, forkJoin, interval, Observable, Subscription } from 'rxjs';
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
export class HideoutList implements OnInit, OnDestroy {
  resizeSubscription!: Subscription;

  apiClient = inject(ApiClient);
  eltRef = inject<ElementRef<HTMLElement>>(ElementRef);

  hideoutTags = signal<string[]>([]);
  hideoutMaps = signal<string[]>([]);
  loadedHideouts = signal<HideoutMetadata[]>([]);
  filters = signal<HideoutListFiltersInput>({});

  currentServerPage = signal<number>(1);
  serverItemCount = signal<number | null>(null);
  serverItemsPerPage = signal<number | null>(null);

  currentClientPage = signal<number>(1);
  clientItemsPerPage = signal<number | null>(null);

  loading = signal<boolean>(false);
  errors = signal<string[]>([]);

  filtersBaseData = computed<HideoutFiltersBaseData>(() => ({
    maps: this.hideoutMaps(),
    tags: this.hideoutTags(),
  }));

  currentPageHideouts = computed<HideoutMetadata[]>(() => {
    const currentPage = this.currentServerPage();
    const hideouts = this.loadedHideouts();
    const clientItemsPerPage = this.clientItemsPerPage();

    if (!clientItemsPerPage) return [];

    const startAt = (currentPage - 1) * clientItemsPerPage;
    const endAt = Math.min(startAt + clientItemsPerPage, hideouts.length);

    return hideouts.slice(startAt, endAt);
  });

  clientPageCount = computed<number>(() => {
    const clientItemsPerPage = this.clientItemsPerPage();
    const itemCount = this.serverItemCount();

    if (!clientItemsPerPage || !itemCount) return 1;

    return Math.ceil(itemCount / clientItemsPerPage);
  });

  ngOnInit() {
    this.loadPageData().add(() => this.updateLayoutFromWidth(document.body.clientWidth));

    this.subscribeToResizeEvent(document.body, (entries) => {
      const entry = entries[entries.length - 1];
      const { width } = entry.contentRect;

      this.updateLayoutFromWidth(width);
    });
  }

  ngOnDestroy() {
    this.unsubscribeToResizeEvent();
  }

  updateFilters(newFilters: HideoutListFiltersInput) {
    this.filters.set(newFilters);
  }

  nextPageNeedsData() {
    // TODO: Does the client have enough cached products for the next page or does it need to call the server?
    return true;
  }

  handlePageChange(newClientPage: number) {
    this.currentClientPage.set(newClientPage);

    // if (this.nextPageNeedsData())
    this.loadHideouts();
  }

  updateLayoutFromWidth(width: number) {
    if (width >= 1200) {
      this.setLayoutVariables({
        itemsPerLine: 3,
        itemsPerPage: 6,
      });
    } else if (width >= 800) {
      this.setLayoutVariables({
        itemsPerLine: 2,
        itemsPerPage: 4,
      });
    } else {
      this.setLayoutVariables({
        itemsPerLine: 1,
        itemsPerPage: 2,
      });
    }
  }

  setLayoutVariables(opts: { itemsPerLine: number; itemsPerPage: number }) {
    if (!this.eltRef) return;

    const elt = this.eltRef.nativeElement;
    elt.style.setProperty('--items-per-line', opts.itemsPerLine.toString());
    elt.style.setProperty('--items-per-page', opts.itemsPerPage.toString());

    this.clientItemsPerPage.set(opts.itemsPerPage);
  }

  performSearch(e: SubmitEvent) {
    e.preventDefault();
    this.currentServerPage.set(1);
    this.loadHideouts();
  }

  // `callback` runs 500ms after the layout stops being resized
  subscribeToResizeEvent(element: HTMLElement, callback: (entries: ResizeObserverEntry[]) => void) {
    const observable = new Observable<ResizeObserverEntry[]>((subscriber) => {
      const observer = new ResizeObserver((entries) => subscriber.next(entries));
      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    });

    this.resizeSubscription = observable.pipe(debounce(() => interval(500))).subscribe(callback);
  }

  unsubscribeToResizeEvent() {
    this.resizeSubscription.unsubscribe();
  }

  loadPageData() {
    const api = this.apiClient;

    this.startLoading();

    return forkJoin({
      pagination: api.getHideoutPaginationData(),
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
      hideoutResponse: this.loadHideouts({ standalone: false }),
    })
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: ({ pagination, tags, maps, hideoutResponse }) => {
          this.serverItemCount.set(pagination.itemCount);
          this.hideoutTags.set(tags);
          this.hideoutMaps.set(maps);

          const { list } = hideoutResponse;
          this.loadedHideouts.update((hdts) => [...hdts, ...list]);
        },
        error: (err) => this.addError(err),
      });
  }

  loadHideouts(opts: { standalone?: boolean } = {}) {
    const { standalone = true } = opts;

    if (standalone) this.startLoading();

    const observable = this.apiClient.getHideoutList({
      page: this.currentServerPage(),
      filters: this.filters(),
    });

    if (standalone)
      observable.pipe(finalize(() => this.finishLoading())).subscribe({
        next: (hideoutResponse) => {
          const { list, matchCount } = hideoutResponse;
          this.loadedHideouts.update((hdts) => [...hdts, ...list]);
          this.serverItemCount.set(matchCount);
        },
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
