import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HarnessLoader } from '@angular/cdk/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness, MatMenuItemHarness } from '@angular/material/menu/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatTooltipHarness } from '@angular/material/tooltip/testing';

import { AuthProvider } from '../../services/auth-provider/auth-provider';
import { LoggedUser } from '../../models/LoggedUser';
import { CustomButtonTester } from '../../test-utils/custom-button-tester.spec';
import { CustomMenuTester } from '../../test-utils/custom-menu-tester.spec';
import { Navbar } from './navbar';

class MockAuthProvider {
  private _user: WritableSignal<LoggedUser | null>;

  constructor(mockUser: LoggedUser) {
    this._user = signal<LoggedUser | null>(mockUser);
  }

  get user() {
    return this._user.asReadonly();
  }

  logout() {
    this._user.set(null);
  }
}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let nativeElement: HTMLElement;

  let harnessLoader: HarnessLoader;

  let mockUser: LoggedUser = { username: 'potato' };
  let mockAuthProvider: MockAuthProvider;
  let customButtonTester: CustomButtonTester;

  beforeEach(async () => {
    mockAuthProvider = new MockAuthProvider(mockUser);

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: AuthProvider,
          useValue: mockAuthProvider,
        },
        {
          provide: ActivatedRoute,
          useValue: null,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;

    harnessLoader = TestbedHarnessEnvironment.loader(fixture);
    customButtonTester = new CustomButtonTester(harnessLoader);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when logged in', () => {
    it('should contain link to homepage', async () => {
      const homepageLink = nativeElement.querySelector("a[href='/']");
      expect(homepageLink).not.toBeNull();
    });

    it('should contain link to own uploaded hideouts page with tooltip and icon', async () => {
      const identityOpts = { selector: `a[href='/user/${mockUser.username}']` };

      const predicate = MatButtonHarness.with(identityOpts);
      customButtonTester.setHarnessPredicate(predicate);

      await customButtonTester.expectElementToExist();
      await customButtonTester.expectBtnToHaveIcon('stacks');

      const tooltipPredicate = MatTooltipHarness.with(identityOpts);
      await customButtonTester.expectBtnToHaveTooltip('Your uploaded hideouts', tooltipPredicate);
    });

    it('should contain link to hideout upload page with tooltip and icon', async () => {
      const identityOpts = { selector: "a[href='/hideout/upload']" };

      const predicate = MatButtonHarness.with(identityOpts);
      customButtonTester.setHarnessPredicate(predicate);

      await customButtonTester.expectElementToExist();
      await customButtonTester.expectBtnToHaveIcon('upload_file');

      const tooltipPredicate = MatTooltipHarness.with(identityOpts);
      await customButtonTester.expectBtnToHaveTooltip('Upload hideout', tooltipPredicate);
    });

    it('should contain a user button with tooltip and icon', async () => {
      const identityOpts = { ancestor: '.user-profile' };

      const btnPredicate = MatButtonHarness.with(identityOpts);
      customButtonTester.setHarnessPredicate(btnPredicate);

      await customButtonTester.expectElementToExist();
      await customButtonTester.expectBtnToHaveIcon('account_circle');

      const tooltipPredicate = MatTooltipHarness.with(identityOpts);
      await customButtonTester.expectBtnToHaveTooltip('User menu', tooltipPredicate);

      const menuPredicate = MatMenuHarness.with(identityOpts);
      await customButtonTester.expectBtnToTriggerMenu(menuPredicate);
    });

    describe('user dropdown', () => {
      let customMenuTester: CustomMenuTester;

      beforeEach(async () => {
        customMenuTester = new CustomMenuTester(harnessLoader);
        customMenuTester.setHarnessPredicate(MatMenuHarness.with({ ancestor: '.user-profile' }));

        await customMenuTester.expectElementToExist();
        await customMenuTester.expectOpenStateToBe(false);

        await customMenuTester.openMenu();
      });

      it("should show 'Logged in as {username}'", async () => {
        const itemPredicate = MatMenuItemHarness.with({ selector: '.logged-user-notice' });

        await customMenuTester.expectToHaveItem(itemPredicate, {
          withText: `Logged in as ${mockUser.username}`,
        });
      });

      it('should contain a link to settings page', async () => {
        const itemPredicate = MatMenuItemHarness.with({ selector: "a[href='/settings']" });
        const itemHarness = await customMenuTester.getItemHarness(itemPredicate);
        await customButtonTester.setHarness(itemHarness);

        await customButtonTester.expectBtnToHaveIcon('settings');
        await customButtonTester.expectBtnToHaveText('Settings', { hasIcon: true });
      });

      describe('logout button', () => {
        beforeEach(async () => {
          const itemPredicate = MatMenuItemHarness.with({ selector: 'button:last-child' });
          const itemHarness = await customMenuTester.getItemHarness(itemPredicate);
          await customButtonTester.setHarness(itemHarness);
        });

        it('should exist', async () => {
          await customButtonTester.expectElementToExist();
        });

        it('should be the last item', async () => {
          await customButtonTester.expectBtnToHaveIcon('logout');
          await customButtonTester.expectBtnToHaveText('Log out', { hasIcon: true });
        });

        it('should cause user to logout', async () => {
          expect(mockAuthProvider.user()).toBeTruthy();
          await customButtonTester.click();
          expect(mockAuthProvider.user()).toBeNull();
        });
      });
    });
  });

  describe('when logged out', () => {
    beforeEach(async () => {
      mockAuthProvider.logout();
      await fixture.whenStable();
    });

    it('should contain link to homepage', () => {
      const link = nativeElement.querySelector("a[href='/']");
      expect(link).toBeTruthy();
    });

    it('should not contain link to profile page', () => {
      const link = nativeElement.querySelector(`a[href^='/user/']`);
      expect(link).toBeFalsy();
    });

    it('should not contain link to hideout upload page', () => {
      const link = nativeElement.querySelector(`a[href='/hideout/upload']`);
      expect(link).toBeFalsy();
    });

    it('should not contain link to settings page', () => {
      const link = nativeElement.querySelector(`a[href='/settings']`);
      expect(link).toBeFalsy();
    });
  });
});
