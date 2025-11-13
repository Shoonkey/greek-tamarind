import { ComponentHarness, HarnessPredicate, HarnessQuery } from '@angular/cdk/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { MatTooltipHarness } from '@angular/material/tooltip/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';

import { CustomElementTester } from './custom-element-tester.spec';

interface ExpectBtnToHaveTextOptions {
  hasIcon?: boolean;
}

// This interface allows the tester to be used both with
// MatButtonHarness and MatMenuItemHarness
interface ButtonLikeHarness extends ComponentHarness {
  getHarness: <T extends ComponentHarness>(predicate: HarnessQuery<T>) => Promise<T>;
  click: () => Promise<void>;
  getText: () => Promise<string>;
}

export class CustomButtonTester extends CustomElementTester<ButtonLikeHarness> {
  async click() {
    const btnHarness = await this.getHarness();
    await btnHarness.click();
  }

  async expectBtnToHaveDisabledState(disabled: boolean) {
    const btnHarness = await this.getHarness();
    const btnHostElt = await btnHarness.host();

    const isDisabled = await btnHostElt.getProperty<boolean>('disabled');
    expect(isDisabled).withContext(`Button should have disabled=${disabled}`).toBe(disabled);
  }

  async expectBtnToHaveIcon(
    expectedIconName: string,
    iconPredicate?: HarnessPredicate<MatIconHarness>,
  ) {
    const btnHarness = await this.getHarness();

    const iconHarness = await btnHarness.getHarness(iconPredicate ?? MatIconHarness);
    const actualIconName = await iconHarness.getName();
    expect(actualIconName).withContext('button should have the proper icon').toBe(expectedIconName);
  }

  async expectBtnToHaveTooltip(
    expectedTooltipText: string,
    tooltipPredicate: HarnessPredicate<MatTooltipHarness>,
  ) {
    const tooltipHarness = await this.loader.getHarness(tooltipPredicate);
    const isOpen = await tooltipHarness.isOpen();
    expect(isOpen).withContext('tooltip should be closed by default').toBeFalse();

    await tooltipHarness.show();

    const tooltipText = await tooltipHarness.getTooltipText();
    expect(tooltipText)
      .withContext('button should have the correct tooltip text')
      .toBe(expectedTooltipText);
  }

  async expectBtnToHaveText(expectedText: string, opts: ExpectBtnToHaveTextOptions = {}) {
    const btnText = await this._getButtonText({ hasIcon: opts.hasIcon });
    expect(btnText).toBe(expectedText);
  }

  async expectBtnToTriggerMenu(menuPredicate: HarnessPredicate<MatMenuHarness>) {
    const btnHarness = await this.getHarness();
    const menuHarness = await this.loader.getHarnessOrNull(menuPredicate);

    expect(menuHarness).withContext('menu should exist').not.toBeNull();

    if (!menuHarness) return;

    let isMenuOpen = await menuHarness.isOpen();

    expect(isMenuOpen).withContext('menu should be closed at first').toBeFalse();

    await btnHarness.click();

    isMenuOpen = await menuHarness.isOpen();
    expect(isMenuOpen).withContext('menu should be open after clicking the button').toBeTrue();
  }

  private async _getButtonText({ hasIcon = false }: { hasIcon?: boolean }) {
    const btnHarness = await this.getHarness();

    if (!hasIcon) return btnHarness.getText();

    const btnHostElt = await btnHarness.host();
    const btnInnerHTML = await btnHostElt.getProperty('innerHTML');
    return this._getBtnWithoutIcon(btnInnerHTML).textContent.trim();
  }

  private _getBtnWithoutIcon(btnInnerHTML: string) {
    const btnClone = document.createElement('button');
    btnClone.innerHTML = btnInnerHTML;

    const iconElt = btnClone.querySelector('mat-icon');

    if (iconElt) btnClone.removeChild(iconElt);

    return btnClone;
  }
}
