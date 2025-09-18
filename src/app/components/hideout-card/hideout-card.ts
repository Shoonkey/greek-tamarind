import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HideoutMetadata } from '../../models/HideoutMetadata';
import { HideoutImage } from '../../models/HideoutImage';

@Component({
  selector: 'app-hideout-card',
  imports: [RouterLink],
  templateUrl: './hideout-card.html',
  styleUrl: './hideout-card.scss',
})
export class HideoutCard {
  hideout = input.required<HideoutMetadata>();
  selectedImgIdx = signal<number>(0);

  selectedImg = computed<HideoutImage>(() => {
    const imgs = this.hideout().images;
    const idx = this.selectedImgIdx();
    return imgs[idx];
  });

  remainingImgs = computed<HideoutImage[]>(() => {
    const selectedIdx = this.selectedImgIdx();
    const images = this.hideout().images;
    return images.filter((_, idx) => idx !== selectedIdx);
  });
}
