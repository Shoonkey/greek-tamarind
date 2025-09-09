import { Component, input } from '@angular/core';

import { Hideout } from '../../models/Hideout';

@Component({
  selector: 'app-hideout-page',
  imports: [],
  templateUrl: './hideout-page.html',
  styleUrl: './hideout-page.scss',
})
export class HideoutPage {
  hideout = input.required<Hideout>();
}
