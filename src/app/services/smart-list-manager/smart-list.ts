import { WritableSignal, Signal, signal, computed } from '@angular/core';
import { Observable, finalize } from 'rxjs';

import { LoggingService } from '../logging-service/logging-service';

type SmartListRetrieverResponse<T> = Observable<{
  items: T[];
  totalCount: number;
}>;

type SmartListRetrieverFn<T> = (page: number, pageSize: number) => SmartListRetrieverResponse<T>;
type SmartListErrorFn = (err: string) => void;

interface SmartListPageChangeFlowOptions {
  page: number;
  newFlow?: boolean;
}

export interface SmartListOptions<T> {
  itemsPerPage: number;
  prefetchPageCount: number;
  retrieverFn: SmartListRetrieverFn<T>;
  onError: SmartListErrorFn;
}

export class SmartList<T> {
  private _loggingService: LoggingService;

  private _loading: WritableSignal<boolean>;
  loading: Signal<boolean>;

  private _serverCurrentPage: WritableSignal<number>;
  private _serverItemsPerPage: WritableSignal<number>;
  private _serverTotalPages: Signal<number>;
  private _serverMatchCount: WritableSignal<number>;

  private _clientCurrentPage: WritableSignal<number>;
  private _clientItemsPerPage: WritableSignal<number>;
  private _clientStoredPages: Signal<number>;
  currentPage: Signal<number>;
  totalPages: Signal<number>;

  private _storedList: WritableSignal<T[]>;
  list: Signal<T[]>;

  private _prefetchPageCount: number;

  private _retrieverFn: SmartListRetrieverFn<T>;
  private _onError: SmartListErrorFn;

  constructor(loggingService: LoggingService, opts: SmartListOptions<T>) {
    this._loggingService = loggingService;

    const { itemsPerPage, prefetchPageCount, retrieverFn, onError } = opts;

    this._retrieverFn = retrieverFn;
    this._onError = onError;

    this._clientItemsPerPage = signal<number>(1);
    this._serverItemsPerPage = signal<number>(itemsPerPage);
    this._prefetchPageCount = prefetchPageCount;

    const currPage = 1;
    this._serverCurrentPage = signal<number>(currPage);
    this._clientCurrentPage = signal<number>(currPage);
    this.currentPage = this._clientCurrentPage.asReadonly();

    this._storedList = signal<T[]>([]);
    this._serverMatchCount = signal<number>(0);

    this.list = computed<T[]>(() => {
      const [startAt, endAt] = this._getListBoundaries();
      return this._storedList().slice(startAt, endAt);
    });

    this._serverTotalPages = computed<number>(() =>
      Math.ceil(this._serverMatchCount() / this._serverItemsPerPage()),
    );

    this._clientStoredPages = computed<number>(() =>
      Math.ceil(this._storedList().length / this._clientItemsPerPage()),
    );

    this.totalPages = computed<number>(() =>
      Math.ceil(this._serverMatchCount() / this._clientItemsPerPage()),
    );

    this._loading = signal<boolean>(false);
    this.loading = this._loading.asReadonly();
  }

  triggerPageChangeFlow({
    page: clientPage,
    newFlow = false,
  }: SmartListPageChangeFlowOptions): void {
    if (clientPage <= 0) return;

    const clientStoredPages = this._clientStoredPages();
    const serverCurrentPage = this._serverCurrentPage();
    const serverTotalPages = this._serverTotalPages();
    const serverItemsPerPage = this._serverItemsPerPage();

    const hasClientStoredPages = clientStoredPages > 0;
    const isAtLastClientPage = clientPage === clientStoredPages;
    const serverHasMoreData = serverCurrentPage < serverTotalPages;

    if (newFlow) {
      this._loggingService.logInfo(
        `[SmartList] Making the first call of a flow (first access or filters changed)`,
      );

      this._flush();

      const pagesToFetch = this._prefetchPageCount + 1;
      const prefetchesAndCurrentPage = serverItemsPerPage * pagesToFetch;
      this._retrieveData(1, prefetchesAndCurrentPage);
      this._serverCurrentPage.set(this._prefetchPageCount + 1);
    } else if (hasClientStoredPages && isAtLastClientPage && serverHasMoreData) {
      this._loggingService.logInfo(
        `[SmartList] User is at the last client page and server has more data;`,
        `loading server page ${serverCurrentPage + 1}/${serverTotalPages}`,
      );

      this._retrieveData(serverCurrentPage + 1, serverItemsPerPage);
      this._serverCurrentPage.set(serverCurrentPage + 1);
    }

    this._clientCurrentPage.set(clientPage);
  }

  updateItemsPerPage(itemsPerPage: number) {
    this._clientItemsPerPage.set(itemsPerPage);
  }

  private _flush() {
    this._storedList.set([]);
  }

  private _retrieveData(page: number, pageSize: number) {
    this._loading.set(true);

    this._retrieverFn(page, pageSize)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: ({ items, totalCount }) => {
          this._storedList.update((list) => [...list, ...items]);
          this._serverMatchCount.set(totalCount);
        },
        error: (err) => this._onError(err),
      });
  }

  private _getListBoundaries(): [number, number] {
    const list = this._storedList();
    const currentPage = this._clientCurrentPage();
    const itemsPerPage = this._clientItemsPerPage();

    const startAt = (currentPage - 1) * itemsPerPage;
    const endAt = Math.min(startAt + itemsPerPage, list.length);

    return [startAt, endAt];
  }
}
