import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { debounce, finalize, forkJoin, interval, Observable, Subscription } from 'rxjs';
import { MatButton } from '@angular/material/button';

import {
  ApiClient,
  GetHideoutListResponse,
  HideoutListFiltersInput,
} from '../../services/api-client/api-client';
import { LoggingService } from '../../services/logging-service/logging-service';
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

  loggingService = inject(LoggingService);
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

  loadingPage = signal<boolean>(false);
  loadingList = signal<boolean>(false);
  errors = signal<string[]>([]);

  filtersBaseData = computed<HideoutFiltersBaseData>(() => ({
    maps: this.hideoutMaps(),
    tags: this.hideoutTags(),
  }));

  clientHideoutList = computed<HideoutMetadata[]>(() => {
    const { startAt, endAt } = this.getClientListLimits();
    return this.loadedHideouts().slice(startAt, endAt);
  });

  clientPageCount = computed<number>(() => {
    const clientItemsPerPage = this.clientItemsPerPage();
    const serverItemCount = this.serverItemCount();

    if (!clientItemsPerPage || !serverItemCount) return 1;

    return Math.ceil(serverItemCount / clientItemsPerPage);
  });

  serverPageCount = computed<number>(() => {
    const serverItemCount = this.serverItemCount();
    const serverItemsPerPage = this.serverItemsPerPage();

    if (!serverItemsPerPage || !serverItemCount) return 1;

    return Math.ceil(serverItemCount / serverItemsPerPage);
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

  getClientListLimits() {
    const currentPage = this.currentClientPage();
    const hideouts = this.loadedHideouts();
    const clientItemsPerPage = this.clientItemsPerPage();

    if (!clientItemsPerPage) return { startAt: 0, endAt: 0 };

    const startAt = (currentPage - 1) * clientItemsPerPage;
    const endAt = Math.min(startAt + clientItemsPerPage, hideouts.length);

    return { startAt, endAt };
  }

  pageRequiresMoreData(page: number) {
    const currentClientPage = this.currentClientPage();
    const serverItemCount = this.serverItemCount();
    const serverItemsPerPage = this.serverItemsPerPage();

    if (currentClientPage > page || !serverItemCount || !serverItemsPerPage) return false;

    const serverPage = this.currentServerPage();
    const serverPageCount = this.serverPageCount();

    const list = this.loadedHideouts();
    const { endAt } = this.getClientListLimits();

    return !list[endAt - 1] && serverPage < serverPageCount;
  }

  handlePageChange(newClientPage: number) {
    if (this.pageRequiresMoreData(newClientPage)) {
      this.loggingService.logInfo('Page requires more data! Loading more hideouts.');
      this.loadHideouts();
    }

    this.currentClientPage.set(newClientPage);
  }

  updateLayoutFromWidth(width: number) {
    this.loggingService.logInfo('Updating layout based on window width...');

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

    this.handlePageChange(this.currentClientPage());
  }

  setLayoutVariables(opts: { itemsPerLine: number; itemsPerPage: number }) {
    if (!this.eltRef) return;

    const { itemsPerLine, itemsPerPage } = opts;
    const elt = this.eltRef.nativeElement;
    elt.style.setProperty('--items-per-line', itemsPerLine.toString());
    elt.style.setProperty('--items-per-page', itemsPerPage.toString());

    this.loggingService.logInfo(
      `Layout set to ${itemsPerLine} items per line and ${itemsPerPage} items per page`,
    );

    this.clientItemsPerPage.set(itemsPerPage);
  }

  performSearch(e: SubmitEvent) {
    e.preventDefault();
    this.currentServerPage.set(1);
    this.loadHideouts({ freshList: true });
  }

  // `callback` runs `intervalMs` milliseconds after the layout stops being resized
  subscribeToResizeEvent(element: HTMLElement, callback: (entries: ResizeObserverEntry[]) => void) {
    const intervalMs = 300;

    const observable = new Observable<ResizeObserverEntry[]>((subscriber) => {
      const observer = new ResizeObserver((entries) => subscriber.next(entries));
      observer.observe(element);

      return () => observer.disconnect();
    });

    this.resizeSubscription = observable
      .pipe(debounce(() => interval(intervalMs)))
      .subscribe(callback);
  }

  unsubscribeToResizeEvent() {
    this.resizeSubscription.unsubscribe();
  }

  loadPageData() {
    const api = this.apiClient;

    this.loadingPage.set(true);

    return forkJoin({
      pagination: api.getHideoutPaginationData(),
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
      hideoutResponse: this.loadHideouts({ standalone: false }),
    })
      .pipe(finalize(() => this.loadingPage.set(false)))
      .subscribe({
        next: ({ pagination, tags, maps, hideoutResponse }) => {
          this.serverItemsPerPage.set(pagination.itemsPerPage);
          this.serverItemCount.set(pagination.itemCount);
          this.hideoutTags.set(tags);
          this.hideoutMaps.set(maps);

          const { list } = hideoutResponse;
          this.loadedHideouts.update((hdts) => [...hdts, ...list]);
        },
        error: (err) => this.addError(err),
      });
  }

  loadHideouts(opts: { standalone?: boolean; freshList?: boolean } = {}) {
    const { standalone = true, freshList = false } = opts;

    if (standalone) this.startLoadingHideouts();

    const nextServerPage = this.currentServerPage() + 1;

    if (standalone && nextServerPage < this.serverPageCount()) {
      this.loggingService.logError(
        "Can't load more hideout because there are no record pages available",
      );

      return new Observable<GetHideoutListResponse>((subscriber) =>
        subscriber.next({ list: [], matchCount: 0 }),
      );
    }

    const observable = this.apiClient.getHideoutList({
      page: nextServerPage,
      filters: this.filters(),
    });

    if (standalone)
      observable
        .pipe(
          finalize(() => {
            this.currentServerPage.set(nextServerPage);
            this.finishLoadingHideouts();
          }),
        )
        .subscribe({
          next: (hideoutResponse) => {
            const { list, matchCount } = hideoutResponse;

            this.serverItemCount.set(matchCount);

            if (freshList) {
              this.loadedHideouts.set(list);
            } else {
              this.loadedHideouts.update((hdts) => [...hdts, ...list]);
            }
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

  startLoadingHideouts() {
    this.loadingList.set(true);
    this.clearErrors();
  }

  finishLoadingHideouts() {
    this.loadingList.set(false);
  }
}
