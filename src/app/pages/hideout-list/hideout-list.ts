import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { debounce, finalize, forkJoin, interval, Observable, Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiClient, HideoutListFiltersInput } from '../../services/api-client/api-client';
import { LoggingService } from '../../services/logging-service/logging-service';
import { HideoutListItem } from '../../models/HideoutListItem';
import { HideoutMap } from '../../models/HideoutMap';
import { HideoutTag } from '../../models/HideoutTag';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
import {
  HideoutFiltersBaseData,
  HideoutFiltersDialog,
} from '../../components/hideout-filters-dialog/hideout-filters-dialog';
import { KeyboardShortcutListener } from '../../services/keyboard-shortcut-listener/keyboard-shortcut-listener';
import { PlaceholderHideoutCard } from '../../components/placeholder-hideout-card/placeholder-hideout-card';

@Component({
  selector: 'app-hideout-list',
  imports: [
    HideoutCard,
    PaginationControl,
    MatIcon,
    MatButton,
    MatTooltip,
    MatProgressSpinnerModule,
    PlaceholderHideoutCard,
  ],
  templateUrl: './hideout-list.html',
  styleUrl: './hideout-list.scss',
})
export class HideoutList implements OnInit, OnDestroy {
  resizeSubscription!: Subscription;
  filterShortcutSubscription!: Subscription;

  loggingService = inject(LoggingService);
  apiClient = inject(ApiClient);
  dialogManager = inject(MatDialog);
  keyboardShortcutListener = inject(KeyboardShortcutListener);
  eltRef = inject<ElementRef<HTMLElement>>(ElementRef);

  hideoutTags = signal<HideoutMap[]>([]);
  hideoutMaps = signal<HideoutTag[]>([]);
  loadedHideouts = signal<HideoutListItem[]>([]);
  filters = signal<HideoutListFiltersInput>({});

  currentServerPage = signal<number>(1);
  currentClientPage = signal<number>(1);
  serverItemCount = signal<number | null>(null);
  itemsPerPage = signal<number>(5);

  loadingFilters = signal<boolean>(false);
  loadingList = signal<boolean>(false);
  errors = signal<string[]>([]);

  filtersBaseData = computed<HideoutFiltersBaseData>(() => ({
    maps: this.hideoutMaps(),
    tags: this.hideoutTags(),
  }));

  activeFiltersCount = computed<number>(() => {
    const filters = this.filters();
    return Object.keys(filters).length;
  });

  clientHideoutList = computed<HideoutListItem[]>(() => {
    const { startAt, endAt } = this.getClientListLimits();
    return this.loadedHideouts().slice(startAt, endAt);
  });

  clientPageCount = computed<number>(() => {
    const itemsPerPage = this.itemsPerPage();
    const serverItemCount = this.serverItemCount();

    if (!itemsPerPage || !serverItemCount) return 1;

    return Math.ceil(serverItemCount / itemsPerPage);
  });

  serverPageCount = computed<number>(() => {
    const serverItemCount = this.serverItemCount();
    const itemsPerPage = this.itemsPerPage();

    if (!itemsPerPage || !serverItemCount) return 1;

    return Math.ceil(serverItemCount / itemsPerPage);
  });

  ngOnInit() {
    this.loadPageData().add(() => this.updateLayoutFromWidth(document.body.clientWidth));

    this.subscribeToResizeEvent(document.body, (entries) => {
      const entry = entries[entries.length - 1];
      const { width } = entry.contentRect;

      this.updateLayoutFromWidth(width);
    });

    this.setupFilterShortcut();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) this.resizeSubscription.unsubscribe();
    if (this.filterShortcutSubscription) this.filterShortcutSubscription.unsubscribe();
  }

  getClientListLimits() {
    const currentPage = this.currentClientPage();
    const hideouts = this.loadedHideouts();
    const itemsPerPage = this.itemsPerPage();

    if (!itemsPerPage) return { startAt: 0, endAt: 0 };

    const startAt = (currentPage - 1) * itemsPerPage;
    const endAt = Math.min(startAt + itemsPerPage, hideouts.length);

    return { startAt, endAt };
  }

  pageRequiresMoreData(page: number) {
    const currentClientPage = this.currentClientPage();
    const serverItemCount = this.serverItemCount();
    const itemsPerPage = this.itemsPerPage();

    if (currentClientPage > page || !serverItemCount || !itemsPerPage) return false;

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

  setupFilterShortcut() {
    this.keyboardShortcutListener.watch((ev) => {
      if (!ev.ctrlKey || ev.key.toLowerCase() !== 'k') return;
      if (this.dialogManager.openDialogs.length !== 0) return;

      ev.preventDefault();
      this.openFilterDialog();
    });
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

    this.itemsPerPage.set(itemsPerPage);
  }

  openFilterDialog() {
    const dialogRef: MatDialogRef<HideoutFiltersDialog, HideoutListFiltersInput> =
      this.dialogManager.open(HideoutFiltersDialog, {
        data: {
          baseData: this.filtersBaseData(),
          filters: this.filters(),
          maps: this.hideoutMaps(),
          tags: this.hideoutTags(),
        },
      });

    dialogRef.afterClosed().subscribe((newFilters) => {
      if (!newFilters) return;
      this.performSearch(newFilters);
    });
  }

  performSearch(filters: HideoutListFiltersInput) {
    this.currentServerPage.set(1);
    this.currentClientPage.set(1);
    this.filters.set(filters);
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

    this.loadingFilters.set(true);
    this.loadingList.set(true);

    return forkJoin({
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
      hideoutResponse: this.loadHideouts({ standalone: false, freshList: true }),
    })
      .pipe(
        finalize(() => {
          this.loadingFilters.set(false);
          this.loadingList.set(false);
        }),
      )
      .subscribe({
        next: ({ tags, maps, hideoutResponse }) => {
          this.hideoutTags.set(tags);
          this.hideoutMaps.set(maps);

          const { items, totalCount } = hideoutResponse;
          this.serverItemCount.set(totalCount);

          this.loadedHideouts.update((hdts) => [...hdts, ...items]);
        },
        error: (err) => this.addError(err),
      });
  }

  loadHideouts(opts: { standalone?: boolean; freshList?: boolean } = {}) {
    const { standalone = true, freshList = false } = opts;

    if (standalone) this.startLoadingHideouts();

    const serverPage = this.currentServerPage();

    // if (standalone && nextServerPage < this.serverPageCount()) {
    //   this.loggingService.logError(
    //     "Can't load more hideout because there are no record pages available",
    //   );

    //   return new Observable<GetHideoutListResponse>((subscriber) =>
    //     subscriber.next({ list: [], matchCount: 0 }),
    //   );
    // }

    const observable = this.apiClient.getHideoutList({
      page: freshList ? 1 : serverPage + 1,
      filters: this.filters(),
    });

    if (standalone)
      observable
        .pipe(
          finalize(() => {
            this.currentServerPage.set(serverPage);
            this.finishLoadingHideouts();
          }),
        )
        .subscribe({
          next: (hideoutResponse) => {
            const { items, totalCount } = hideoutResponse;

            this.serverItemCount.set(totalCount);

            if (freshList) {
              this.currentServerPage.set(1);
              this.currentClientPage.set(1);
              this.loadedHideouts.set(items);
            } else {
              this.loadedHideouts.update((hdts) => [...hdts, ...items]);
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

  clearFilters() {
    this.filters.set({});
    this.performSearch(this.filters());
  }

  startLoadingHideouts() {
    this.loadingList.set(true);
    this.clearErrors();
  }

  finishLoadingHideouts() {
    this.loadingList.set(false);
  }
}
