import {
  MatMenuHarness,
  MatMenuItemHarness,
  MenuHarnessFilters,
} from '@angular/material/menu/testing';

import { CustomElementTester } from './custom-element-tester.spec';
import { BaseHarnessFilters, HarnessPredicate } from '@angular/cdk/testing';

interface ExpectToHaveItemWithOptions {
  withText?: string;
}

export class CustomMenuTester extends CustomElementTester<MatMenuHarness> {
  async expectOpenStateToBe(openState: boolean) {
    const harness = await this.getHarness();
    const actualOpenState = await harness.isOpen();
    expect(actualOpenState)
      .withContext(`menu should ${openState ? 'be' : 'not be'} open`)
      .toBe(openState);
  }

  async openMenu() {
    const harness = await this.getHarness();
    await harness.open();
  }

  async getItemHarness(itemPredicate: HarnessPredicate<MatMenuItemHarness>) {
    const harness = await this.getHarness();
    const itemHarness = await harness.getHarnessOrNull(itemPredicate);

    expect(itemHarness).withContext('item should exist').toBeDefined();

    return itemHarness!;
  }

  async expectToHaveItem(
    itemPredicate: HarnessPredicate<MatMenuItemHarness>,
    opts: ExpectToHaveItemWithOptions = {},
  ) {
    const harness = await this.getHarness();
    const itemHarness = await harness.getHarnessOrNull(itemPredicate);

    expect(itemHarness).withContext('item should exist').toBeDefined();

    if (!itemHarness) return;

    if (opts.withText) expect(await itemHarness.getText()).toBe(opts.withText);
  }
}
