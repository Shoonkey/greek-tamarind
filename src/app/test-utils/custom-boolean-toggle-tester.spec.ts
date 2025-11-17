import { CustomToggleGroupTester } from './custom-toggle-group-tester.spec';

type InternalStates = 'uncheckedLeft' | 'uncheckedRight' | 'bothChecked';

interface InternalToExternalExpectations<T> {
  expression: () => T | undefined;
  expectedValues: Record<InternalStates, T | undefined>;
}

interface ExternalToInternalExpectations {
  causeUncheckedLeft: () => void | Promise<void>;
  causeUncheckedRight: () => void | Promise<void>;
  causeBothChecked: () => void | Promise<void>;
}

export class CustomBooleanToggleTester extends CustomToggleGroupTester {
  async expectMultipleDeselectionToBeImpossible() {
    await this._assertOnlyTwoToggles();

    const [leftToggle, rightToggle] = await this.getToggleHarnesses();
    await leftToggle.uncheck();
    await rightToggle.uncheck();

    expect(await rightToggle.isChecked())
      .withContext(
        "if the left toggle is unchecked, the right toggle shouldn't be allowed to become unchecked too",
      )
      .toBeTrue();

    await leftToggle.check();
    await rightToggle.uncheck();
    await leftToggle.uncheck();

    expect(await leftToggle.isChecked())
      .withContext(
        "if the right toggle is unchecked, the left toggle shouldn't be allowed to become unchecked too",
      )
      .toBeTrue();
  }

  async expectOperationToCauseStates(operationsToStates: ExternalToInternalExpectations) {
    const { causeBothChecked, causeUncheckedLeft, causeUncheckedRight } = operationsToStates;

    await causeBothChecked();
    expect(await this._getToggleStates())
      .withContext('Expected operation to cause both toggles to be checked')
      .toEqual(this._stateNameToToggleStates('bothChecked'));

    await causeUncheckedLeft();
    expect(await this._getToggleStates())
      .withContext('Expected operation to cause only the left toggle to be unchecked')
      .toEqual(this._stateNameToToggleStates('uncheckedLeft'));

    await causeUncheckedRight();
    expect(await this._getToggleStates())
      .withContext('Expected operation to cause only the right toggle to be unchecked')
      .toEqual(this._stateNameToToggleStates('uncheckedRight'));
  }

  async expectStatesToResolveExpressionTo<T>(
    stateToBehaviorMap: InternalToExternalExpectations<T>,
  ) {
    const { expression, expectedValues } = stateToBehaviorMap;

    const [leftToggle, rightToggle] = await this.getToggleHarnesses();
    await leftToggle.check();
    await rightToggle.check();

    expect(expression())
      .withContext(
        `Expected having both toggles checked to cause expression to be ${expectedValues.bothChecked}`,
      )
      .toBe(expectedValues.bothChecked);

    await leftToggle.uncheck();
    expect(expression())
      .withContext(
        `Expected having the left toggle unchecked to cause expression to be ${expectedValues.uncheckedLeft}`,
      )
      .toBe(expectedValues.uncheckedLeft);

    await leftToggle.check();
    await rightToggle.uncheck();
    expect(expression())
      .withContext(
        `Expected having the right toggle unchecked to cause expression to be ${expectedValues.uncheckedRight}`,
      )
      .toBe(expectedValues.uncheckedRight);
  }

  private async _assertOnlyTwoToggles() {
    const toggles = await this.getToggleHarnesses();
    expect(toggles.length).withContext('boolean toggle groups should have only 2 toggles').toBe(2);
  }

  private _stateNameToToggleStates(stateName: InternalStates) {
    switch (stateName) {
      case 'bothChecked':
        return [true, true];
      case 'uncheckedLeft':
        return [false, true];
      case 'uncheckedRight':
        return [true, false];
      default:
        throw new Error(`Unrecognized state name ${stateName}`);
    }
  }

  private async _getToggleStates() {
    const [left, right] = await this.getToggleHarnesses();
    return [await left.isChecked(), await right.isChecked()];
  }
}
