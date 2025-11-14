import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from '@angular/core';
import { InteractivityChecker, AriaDescriber } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root',
})
class MockInteractivityChecker extends InteractivityChecker {
  override isFocusable(..._args: any[]): boolean {
    return true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockAriaDescriber extends AriaDescriber {
  override describe(hostElement: Element, message: string | HTMLElement, role?: string): void {
    if (message instanceof HTMLElement) return;
    super.describe(hostElement, message, role);
  }
}

export function provideMockA11YEnvironment(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: InteractivityChecker,
      useClass: MockInteractivityChecker,
    },
    {
      provide: AriaDescriber,
      useClass: MockAriaDescriber,
    },
  ]);
}

// Allows to test for badge description content.
// Necessary because Material Angular doesn't expose a .getDescription() method on the
// MatBadgeHarness and the aria-describedby relationship implied by adding a matBadgeDescription
// generates a message completely outside of the component scope, at document level through the
// AriaDescriber service
export class CustomAriaDescriptionTester {
  private _ariaDescriberInstance: MockAriaDescriber;
  private _describeFnSpy: jasmine.Spy<MockAriaDescriber['describe']>;

  constructor(ariaDescriber: MockAriaDescriber) {
    this._ariaDescriberInstance = ariaDescriber;
    this._describeFnSpy = spyOn(ariaDescriber, 'describe');
  }

  expectRecentDescriptionMessageToBe(expectedMsg: string) {
    expect(this._ariaDescriberInstance.describe)
      .withContext('AriaDescriber.describe should have been called')
      .toHaveBeenCalled();

    const descriptionMsg = this._describeFnSpy.calls.mostRecent().args[1];
    expect(descriptionMsg).withContext('ARIA description message should match').toBe(expectedMsg);
  }
}
