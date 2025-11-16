import { provideZonelessChangeDetection } from '@angular/core';
import {
  ComponentFixture,
  DeferBlockBehavior,
  DeferBlockFixture,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { HideoutTag } from '../../models/HideoutTag';
import { HideoutMap } from '../../models/HideoutMap';
import { PoeVersion } from '../../models/PoeVersion';
import {
  ApiClient,
  GetHideoutListResponse,
  HideoutListOptions,
} from '../../services/api-client/api-client';
import { CustomButtonTester } from '../../test-utils/custom-button-tester.spec';
import { mockHideoutMetadata } from '../../mocks/hideout-metadata';
import { HideoutList } from './hideout-list';

const mockedData = 'abcde'.split('').map((id) => ({
  ...mockHideoutMetadata,
  id,
}));

class TestApiClient {
  getHideoutTags() {
    return of<HideoutTag[]>([{ id: 'a', name: 'b' }]);
  }

  getHideoutMaps() {
    return of<HideoutMap[]>([{ id: 'b', name: 'c' }]);
  }

  getHideoutList(_opts: HideoutListOptions) {
    return of<GetHideoutListResponse>({
      items: mockedData,
      totalCount: mockedData.length,
    });
  }
}

describe('HideoutList', () => {
  let component: HideoutList;
  let fixture: ComponentFixture<HideoutList>;
  let nativeElt: HTMLElement;
  let deferBlocks: DeferBlockFixture[];
  let spies: jasmine.SpyObj<TestApiClient>;

  beforeEach(async () => {
    // couldn't manage to find a way to `spyOnAllFunctions.and.callThrough`
    // so this does it manually for each function
    spies = {
      getHideoutList: spyOn(TestApiClient.prototype, 'getHideoutList').and.callThrough(),
      getHideoutMaps: spyOn(TestApiClient.prototype, 'getHideoutMaps').and.callThrough(),
      getHideoutTags: spyOn(TestApiClient.prototype, 'getHideoutTags').and.callThrough(),
    };

    await TestBed.configureTestingModule({
      imports: [HideoutList],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        {
          provide: ApiClient,
          useClass: TestApiClient,
        },
        {
          provide: ActivatedRoute,
          useValue: null,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HideoutList);
    component = fixture.componentInstance;
    nativeElt = fixture.nativeElement;

    deferBlocks = await fixture.getDeferBlocks();

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 2 defer blocks: one for filters and one for the list', () => {
    expect(deferBlocks.length).toBe(2);
  });

  describe('filter area', () => {
    let filterAreaDeferBlock: DeferBlockFixture;
    let filterArea: HTMLElement;
    let harnessLoader: HarnessLoader;
    let customBtnTester: CustomButtonTester;

    beforeEach(() => {
      harnessLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      customBtnTester = new CustomButtonTester(harnessLoader);
      filterAreaDeferBlock = deferBlocks[0];
      filterArea = nativeElt.querySelector('.filter-area')!;
      expect(filterArea).withContext('.filter-area container should exist').not.toBeNull();
    });

    describe('before loading', () => {
      beforeEach(async () => {
        await filterAreaDeferBlock.render(DeferBlockState.Placeholder);
      });

      it('should show filters are being loaded', () => {
        expect(filterArea.innerText).toBe('Loading filters...');
        expect(filterArea.querySelector('mat-progress-spinner')).not.toBeNull();
      });
    });

    describe('after loading', () => {
      async function getDialogHarnesses() {
        return await harnessLoader.getAllHarnesses(MatDialogHarness);
      }

      beforeEach(async () => {
        await filterAreaDeferBlock.render(DeferBlockState.Complete);
      });

      it('should show filter button', async () => {
        customBtnTester.setHarnessPredicate(
          MatButtonHarness.with({ selector: '.filter-area button' }),
        );

        await customBtnTester.expectElementToExist();
        await customBtnTester.expectBtnToHaveIcon('tune');
        await customBtnTester.expectBtnToHaveText('Filters', { hasIcon: true });

        const kbdShortcut: HTMLElement = filterArea.querySelector('.kbd-shortcut')!;
        expect(kbdShortcut).withContext('keyboard shortcut info should be shown').not.toBeNull();
        expect(kbdShortcut.innerText)
          .withContext('shown keyboard shortcut should be correct')
          .toBe('Ctrl + K');
      });

      it('Ctrl + K should open dialog', async () => {
        const spy = spyOn(component, 'triggerFilterDialogFlow').and.callThrough();

        const ctrlKEvent = new KeyboardEvent('keydown', { key: 'K', ctrlKey: true });
        document.dispatchEvent(ctrlKEvent);

        expect(spy)
          .withContext('.triggerFilterDialogFlow() should be called')
          .toHaveBeenCalledTimes(1);

        const dialogs = await getDialogHarnesses();
        expect(dialogs.length).withContext('One dialog should be open').toBe(1);
      });

      it('clear button should clear the filters', async () => {
        component.filters.set({ hasMTX: true, poeVersion: 1 });
        await fixture.whenStable();

        expect(component.activeFiltersCount())
          .withContext('active filters count should be 2')
          .toBe(2);

        const btn: HTMLButtonElement = nativeElt.querySelector('.clear-btn-container button')!;
        expect(btn).withContext('clear button should exist').not.toBeNull();
        btn.click();

        expect(component.activeFiltersCount())
          .withContext('active filters count should be 0')
          .toBe(0);
      });

      describe('should show currently active filters properly for', () => {
        function getActiveFiltersText() {
          const elt: HTMLElement = nativeElt.querySelector('.clear-btn-container p')!;
          expect(elt).withContext('active filters label should exist').not.toBeNull();
          return elt.innerText;
        }

        it('zero filters', async () => {
          component.filters.set({});
          await fixture.whenStable();
          expect(getActiveFiltersText()).toBe('No active filters');
        });

        it('one filter', async () => {
          component.filters.set({ hasMTX: true });
          await fixture.whenStable();

          expect(getActiveFiltersText()).toBe('1 active filter');
        });

        it('two or more filters', async () => {
          component.filters.set({ hasMTX: true, poeVersion: PoeVersion.Two });
          await fixture.whenStable();

          expect(getActiveFiltersText())
            .withContext('should work with two')
            .toBe('2 active filters');

          component.filters.set({
            hasMTX: true,
            poeVersion: PoeVersion.Two,
            name: 'a',
            mapIds: ['a'],
            tagIds: ['b'],
          });
          await fixture.whenStable();

          expect(getActiveFiltersText())
            .withContext('should work with more than two')
            .toBe('5 active filters');
        });
      });
    });
  });

  describe('hideout list', () => {
    let hideoutListDeferBlock: DeferBlockFixture;

    beforeEach(() => {
      hideoutListDeferBlock = deferBlocks[1];
    });

    describe('before loading', () => {
      beforeEach(async () => {
        await hideoutListDeferBlock.render(DeferBlockState.Placeholder);
      });

      it('should render placeholder elements', () => {
        const placeholderList: HTMLElement = nativeElt.querySelector('.placeholder-hideout-list')!;
        expect(placeholderList).withContext('Placeholder list should exist').not.toBeNull();

        const placeholderItems = nativeElt.querySelectorAll('app-placeholder-hideout-card');
        expect(placeholderItems.length).toBeGreaterThan(0);
      });
    });

    describe('after loading', () => {
      function getListItems() {
        return nativeElt.querySelectorAll('.hideout-item');
      }

      beforeEach(async () => {
        await hideoutListDeferBlock.render(DeferBlockState.Complete);
      });

      it('should render a list of hideouts', () => {
        const hideoutList: HTMLElement = nativeElt.querySelector('.hideout-list')!;
        expect(hideoutList).withContext('hideout list should exist').not.toBeNull();

        expect(getListItems().length)
          .withContext('list should contain 1 or more items')
          .toBeGreaterThan(0);
      });

      it('should update with new hideouts on page change', async () => {
        // set first page to holds all except 2 records, so the next page has 2
        component.setLayoutVariables({
          itemsPerLine: 2,
          itemsPerPage: mockedData.length - 2,
        });
        // update smart-list to take new items per page value into consideration
        component.smartList.triggerPageChangeFlow({ page: 1 });

        await fixture.whenStable();
        expect(getListItems().length)
          .withContext(
            'setLayoutVariables() + triggerPageChangeFlow() properly update items per page',
          )
          .toBe(mockedData.length - 2);

        component.smartList.triggerPageChangeFlow({ page: 2 });
        await fixture.whenStable();

        expect(getListItems().length).toBe(2);
      });

      it('should have pagination control', () => {
        const paginationControl = nativeElt.querySelector('app-pagination-control');
        expect(paginationControl).withContext('pagination should exist').not.toBeNull();
      });
    });
  });

  describe('should retrieve once from the API', () => {
    it('the hideout tags', () => {
      expect(spies.getHideoutTags).toHaveBeenCalledTimes(1);
    });

    it('the hideout maps', () => {
      expect(spies.getHideoutMaps).toHaveBeenCalledTimes(1);
    });

    it('the first pages of hideouts (the first one plus `prefetchPageCount` to cache)', () => {
      expect(spies.getHideoutList).toHaveBeenCalledTimes(1);

      const call = spies.getHideoutList.calls.first();
      const expectedPageLength =
        component.itemsPerPageRetrieved * (component.prefetchPageCount + 1);

      expect(call.args[0]).toEqual({ page: 1, pageSize: expectedPageLength, filters: {} });
    });
  });
});
