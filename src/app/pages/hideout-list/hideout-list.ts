import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { debounce, finalize, forkJoin, interval, Observable, Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiClient, HideoutListFiltersInput } from '../../services/api-client/api-client';
import { LoggingService } from '../../services/logging-service/logging-service';
import { SmartListManager } from '../../services/smart-list-manager/smart-list-manager';
import { KeyboardShortcutListener } from '../../services/keyboard-shortcut-listener/keyboard-shortcut-listener';
import { HideoutListItem } from '../../models/HideoutListItem';
import { HideoutMap } from '../../models/HideoutMap';
import { HideoutTag } from '../../models/HideoutTag';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
import { PlaceholderHideoutCard } from '../../components/placeholder-hideout-card/placeholder-hideout-card';
import {
  HideoutFiltersBaseData,
  HideoutFiltersDialog,
} from '../../components/hideout-filters-dialog/hideout-filters-dialog';

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
  hideoutList?: Signal<HideoutList[]>;

  loggingService = inject(LoggingService);
  apiClient = inject(ApiClient);
  dialogManager = inject(MatDialog);
  smartListManager = inject(SmartListManager);
  keyboardShortcutListener = inject(KeyboardShortcutListener);

  eltRef = inject<ElementRef<HTMLElement>>(ElementRef);

  hideoutTags = signal<HideoutMap[]>([]);
  hideoutMaps = signal<HideoutTag[]>([]);
  filters = signal<HideoutListFiltersInput>({});

  smartList = this.smartListManager.getSmartList<HideoutListItem>({
    itemsPerPage: 6,
    prefetchPageCount: 1,
    retrieverFn: (page, pageSize) => this.loadHideouts(page, pageSize),
    onError: (err) => this.addError(err),
  });

  loadingFilters = signal<boolean>(false);
  errors = signal<string[]>([]);

  filtersBaseData = computed<HideoutFiltersBaseData>(() => ({
    maps: this.hideoutMaps(),
    tags: this.hideoutTags(),
  }));

  activeFiltersCount = computed<number>(() => {
    const filters = this.filters();
    return Object.keys(filters).length;
  });

  ngOnInit() {
    this.loadFilters();

    this.subscribeToResizeEvent(document.body, (entries) => {
      const entry = entries[entries.length - 1];
      const { width } = entry.contentRect;
      this.updateLayoutFromWidth(width);
    });

    this.setupFilterShortcut();
    this.updateLayoutFromWidth(document.body.clientWidth);

    this.smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
  }

  ngOnDestroy() {
    if (this.resizeSubscription) this.resizeSubscription.unsubscribe();
    if (this.filterShortcutSubscription) this.filterShortcutSubscription.unsubscribe();
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

    this.smartList.triggerPageChangeFlow({ page: this.smartList.currentPage() });
  }

  setupFilterShortcut() {
    this.keyboardShortcutListener.watch((ev) => {
      if (!ev.ctrlKey || ev.key.toLowerCase() !== 'k') return;
      if (this.dialogManager.openDialogs.length !== 0) return;

      ev.preventDefault();
      this.triggerFilterDialogFlow();
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

    this.smartList.updateItemsPerPage(itemsPerPage);
  }

  triggerFilterDialogFlow() {
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
      this.filters.set(newFilters);
      this.smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
    });
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

  loadFilters() {
    const api = this.apiClient;

    this.loadingFilters.set(true);

    return forkJoin({
      tags: api.getHideoutTags(),
      maps: api.getHideoutMaps(),
    })
      .pipe(
        finalize(() => {
          this.loadingFilters.set(false);
        }),
      )
      .subscribe({
        next: ({ tags, maps }) => {
          this.hideoutTags.set(tags);
          this.hideoutMaps.set(maps);
        },
        error: (err) => this.addError(err),
      });
  }

  loadHideouts(page: number, pageSize: number) {
    return this.apiClient.getHideoutList({
      page,
      pageSize,
      filters: this.filters(),
    });
  }

  addError(errorMsg: string) {
    this.errors.update((list) => [...list, errorMsg]);
  }

  clearErrors() {
    this.errors.set([]);
  }

  clearFilters() {
    this.filters.set({});
    this.smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
  }
}
