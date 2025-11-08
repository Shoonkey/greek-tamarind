import { ComponentHarness, HarnessLoader, HarnessPredicate } from '@angular/cdk/testing';

export abstract class CustomElementTester<T extends ComponentHarness> {
  protected loader: HarnessLoader;

  private _harness?: T | null;
  private _predicate?: HarnessPredicate<T>;

  constructor(harnessLoader: HarnessLoader) {
    this.loader = harnessLoader;
  }

  protected get predicate() {
    if (!this._predicate)
      throw new Error(
        'No harness predicate found. Use `.setHarnessPredicate(predicate) before executing any tests',
      );

    return this._predicate;
  }

  setHarness(elementHarness: T) {
    this._harness = elementHarness;
  }

  setHarnessPredicate(elementQuery: HarnessPredicate<T>) {
    if (this._harness) delete this._harness;
    this._predicate = elementQuery;
  }

  async expectElementToExist() {
    await this.loadHarness();
    expect(this._harness).withContext('component should exist').not.toBeNull();
  }

  private async loadHarness() {
    if (this._harness) return;
    this._harness = await this.loader.getHarnessOrNull(this.predicate);
  }

  protected async getHarness() {
    if (!this._harness) await this.loadHarness();
    return this._harness!;
  }
}
