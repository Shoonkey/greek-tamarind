import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { PaginationControl } from './pagination-control';
import { CustomButtonTester } from '../../test-utils/custom-button-tester.spec';
import { MatTooltipHarness } from '@angular/material/tooltip/testing';

describe('PaginationControl', () => {
  let component: PaginationControl;
  let componentRef: ComponentRef<PaginationControl>;
  let fixture: ComponentFixture<PaginationControl>;

  let harnessLoader: HarnessLoader;
  let customBtnTester: CustomButtonTester;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationControl],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationControl);
    harnessLoader = await TestbedHarnessEnvironment.loader(fixture);
    customBtnTester = new CustomButtonTester(harnessLoader);

    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('currentPage', 1);
    componentRef.setInput('totalPages', 2);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the current page and the total amount of pages', async () => {
    const nativeElt: HTMLElement = fixture.nativeElement;

    function getPageContainerText() {
      const pgContainer = nativeElt.querySelector('.page-container')!;
      expect(pgContainer).withContext('page container should exist').not.toBeNull();
      return pgContainer.textContent;
    }

    expect(getPageContainerText()).toBe('1 / 2');

    componentRef.setInput('currentPage', 2);
    await fixture.whenStable();
    expect(getPageContainerText()).toBe('2 / 2');

    componentRef.setInput('totalPages', 6);
    await fixture.whenStable();
    expect(getPageContainerText()).toBe('2 / 6');
  });

  describe('previous page button', () => {
    let btnIdentityOpts = { selector: 'button:first-child' };
    beforeEach(() => {
      customBtnTester.setHarnessPredicate(MatButtonHarness.with(btnIdentityOpts));
    });

    it('should exist', async () => {
      await customBtnTester.expectElementToExist();
    });

    it('should contain proper icon and tooltip text', async () => {
      await customBtnTester.expectBtnToHaveIcon('chevron_left');

      const tooltipPredicate = MatTooltipHarness.with(btnIdentityOpts);
      await customBtnTester.expectBtnToHaveTooltip('Previous page', tooltipPredicate);
    });

    it("should be disabled when it's already on the first page", async () => {
      await customBtnTester.expectBtnToHaveDisabledState(true);
    });

    it("should be enabled when it's on a page other than the first", async () => {
      componentRef.setInput('currentPage', 2);
      await customBtnTester.expectBtnToHaveDisabledState(false);
    });

    it('should be able to navigate to the previous page', async () => {
      const spy = jasmine.createSpy('pageChangedSpy');
      const subscription = component.pageChanged.subscribe((newPage) => spy(newPage));

      componentRef.setInput('currentPage', 2);
      await customBtnTester.click();

      expect(spy)
        .withContext('should emit `pageChanged` event with newPage = 1')
        .toHaveBeenCalledOnceWith(1);

      subscription.unsubscribe();
    });
  });

  describe('next page button', () => {
    let btnIdentityOpts = { selector: 'button:last-child' };

    beforeEach(async () => {
      customBtnTester.setHarnessPredicate(MatButtonHarness.with(btnIdentityOpts));
    });

    it('should exist', async () => {
      await customBtnTester.expectElementToExist();
    });

    it('should contain proper icon and tooltip text', async () => {
      await customBtnTester.expectBtnToHaveIcon('chevron_right');

      const tooltipPredicate = MatTooltipHarness.with(btnIdentityOpts);
      await customBtnTester.expectBtnToHaveTooltip('Next page', tooltipPredicate);
    });

    it("should be disabled when it's already on the last page", async () => {
      componentRef.setInput('currentPage', 2);
      await customBtnTester.expectBtnToHaveDisabledState(true);
    });

    it("should be enabled when it's on a page other than the last", async () => {
      await customBtnTester.expectBtnToHaveDisabledState(false);
    });

    it('should be able to navigate to the next page', async () => {
      const spy = jasmine.createSpy('pageChangedSpy');
      const subscription = component.pageChanged.subscribe((newPage) => spy(newPage));

      await customBtnTester.click();

      expect(spy)
        .withContext('should emit `pageChanged` event with newPage = 2')
        .toHaveBeenCalledOnceWith(2);

      subscription.unsubscribe();
    });
  });
});
