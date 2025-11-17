import {
  MatButtonToggleGroupHarness,
  MatButtonToggleHarness,
} from '@angular/material/button-toggle/testing';

import { CustomElementTester } from './custom-element-tester.spec';

export class CustomToggleGroupTester extends CustomElementTester<MatButtonToggleGroupHarness> {
  async expectToggleFieldToHaveLabels(visualLabel: string, ariaLabel: string) {
    const toggleGroup = await this.getHarness();
    const host = await toggleGroup.host();
    expect(await host.getAttribute('aria-label'))
      .withContext('should have proper ARIA label')
      .toBe(ariaLabel);

    const parentElt: HTMLElement = await host.getProperty('parentElement');
    const paragraphElt = parentElt.querySelector('p')!;
    expect(paragraphElt).withContext('visual description should exist').not.toBeNull();
    expect(paragraphElt.innerText)
      .withContext('should have proper visual description')
      .toBe(visualLabel);
  }

  async expectTogglesToHaveNames(names: string[]) {
    const toggles = await this.getToggleHarnesses();

    for (let i = 0; i < toggles.length; i++) {
      expect(await toggles[i].getText())
        .withContext(`toggle at position ${i} should have proper label"`)
        .toBe(names[i]);
    }
  }

  async expectToggleGroupState(contextTip: string, states: boolean[]) {
    const toggles = await this.getToggleHarnesses();

    expect(states.length)
      .withContext('there should be the same number of states as there are of toggles')
      .toBe(toggles.length);

    for (let i = 0; i < toggles.length; i++) {
      const testContext = await this.getToggleStateTestContext(contextTip, toggles[i], states[i]);
      expect(await toggles[i].isChecked())
        .withContext(testContext)
        .toBe(states[i]);
    }
  }

  async getToggleHarnesses() {
    const toggleGroup = await this.getHarness();
    return await toggleGroup.getToggles();
  }

  protected async getToggleStateTestContext(
    contextTip: string,
    toggleHarness: MatButtonToggleHarness,
    state: boolean,
  ) {
    let str: string = `(${contextTip}) `;
    str += `Toggle "${await toggleHarness.getText()}" should be `;
    str += state ? 'checked' : 'unchecked';
    return str;
  }
}
