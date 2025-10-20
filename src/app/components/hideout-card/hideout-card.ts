import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HideoutListItem } from '../../models/HideoutListItem';

@Component({
  selector: 'app-hideout-card',
  imports: [RouterLink],
  templateUrl: './hideout-card.html',
  styleUrl: './hideout-card.scss',
})
export class HideoutCard {
  hideout = input.required<HideoutListItem>();
  selectedImgIdx = signal<number>(0);
}
