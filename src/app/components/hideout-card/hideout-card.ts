import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HideoutMetadata } from '../../models/HideoutMetadata';

@Component({
  selector: 'app-hideout-card',
  imports: [RouterLink],
  templateUrl: './hideout-card.html',
  styleUrl: './hideout-card.scss',
})
export class HideoutCard {
  hideout = input.required<HideoutMetadata>();
}
