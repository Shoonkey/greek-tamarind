import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, isSignal } from '@angular/core';
import { of } from 'rxjs';

import { LoggingService } from '../logging-service/logging-service';
import { SmartListManager } from './smart-list-manager';
import { SmartList } from './smart-list';

interface SmartListSpyTeam<T = jasmine.Spy<jasmine.Func>> {
  retrieve: T;
  error: T;
}

describe('SmartListManager', () => {
  let service: SmartListManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LoggingService,
          useValue: { logInfo: () => {}, logError: () => {} },
        },
      ],
    });

    service = TestBed.inject(SmartListManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to create a smart list', () => {
    const smartList = service.getSmartList<number>({
      itemsPerPage: 2,
      retrieverFn: () => of({ items: [3], totalCount: 2 }),
      prefetchPageCount: 1,
      onError: () => {},
    });

    expect(smartList).toBeTruthy();
  });

  describe('SmartList', () => {
    let smartList: SmartList<number>;
    let spies: SmartListSpyTeam;
    let expectedFirstPageSize: number;

    let mocks = {
      data: [2, 8, 1, 12, 9, 25, 42],
      itemsPerPage: 2,
      prefetchPageCount: 2,
    };

    beforeEach(() => {
      expectedFirstPageSize = (1 + mocks.prefetchPageCount) * mocks.itemsPerPage;

      spies = {
        retrieve: jasmine.createSpy('SmartListRetrieve'),
        error: jasmine.createSpy('SmartListError'),
      };

      smartList = service.getSmartList<number>({
        itemsPerPage: mocks.itemsPerPage,
        prefetchPageCount: mocks.prefetchPageCount,
        retrieverFn: (page, pageSize) => {
          spies.retrieve(page, pageSize);
          const totalCount = mocks.data.length;

          const startIdx = (page - 1) * pageSize;
          const endIdx = Math.min(startIdx + pageSize, mocks.data.length);

          if (startIdx >= totalCount) throw new Error('Failed to retrieve');

          const items = mocks.data.slice(startIdx, endIdx);
          return of({ items, totalCount });
        },
        onError: (err) => spies.error(err),
      });

      smartList.updateItemsPerPage(mocks.itemsPerPage);
    });

    it('.list() should be a signal that starts empty', () => {
      expect(isSignal(smartList.list)).toBeTrue();
      expect(smartList.list()).toEqual([]);
    });

    it('.totalPages() should be a signal that starts equal to 0', () => {
      expect(isSignal(smartList.totalPages)).toBeTrue();
      expect(smartList.totalPages()).toBe(0);
    });

    describe('.triggerPageChangeFlow()', () => {
      it('should cause .list() to be populated', () => {
        smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
        expect(smartList.list().length).toBeGreaterThan(0);
      });

      describe('newFlow = true', () => {
        it('should cause .totalPages() to update according to how many client pages the total records from the server make up', () => {
          smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
          smartList.updateItemsPerPage(3);
          expect(smartList.totalPages()).toBe(Math.ceil(mocks.data.length / 3));
        });

        it('should load the first page plus `prefetchPageCount` pages', () => {
          smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
          expect(spies.retrieve.calls.first().args).toEqual([1, expectedFirstPageSize]);
        });

        it('should cause the list to empty before re-filling', () => {
          smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
          const lengthAfterFirstLoad = smartList.list().length;
          expect(lengthAfterFirstLoad).toBeGreaterThan(0);

          smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
          expect(smartList.list().length).toBe(lengthAfterFirstLoad);
        });
      });

      describe('newFlow = false | undefined', () => {
        it('should load only the next page, as soon as it reaches the last page in memory', () => {
          smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
          smartList.triggerPageChangeFlow({ page: 2 });
          smartList.triggerPageChangeFlow({ page: 3, newFlow: false });

          expect(spies.retrieve.calls.mostRecent().args)
            .withContext('Page 3 should load only the next page, page number 4')
            .toEqual([4, mocks.itemsPerPage]);
        });

        it('should not trigger request for pages that are in memory', () => {
          smartList.triggerPageChangeFlow({ page: 1, newFlow: true });
          smartList.triggerPageChangeFlow({ page: 2 });
          expect(spies.retrieve)
            .withContext(
              'Only 1st page should trigger a request (the 2nd should have been fetched along with it)',
            )
            .toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
