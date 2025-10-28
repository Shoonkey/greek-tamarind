import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { TruncatePipe } from '../../pipes/truncate-pipe/truncate-pipe';
import { HideoutListItem } from '../../models/HideoutListItem';

@Component({
  selector: 'app-hideout-card',
  imports: [RouterLink, MatIcon, TruncatePipe, MatTooltip],
  templateUrl: './hideout-card.html',
  styleUrl: './hideout-card.scss',
})
export class HideoutCard {
  hideout = input.required<HideoutListItem>();
  selectedImgIdx = signal<number>(0);
}
