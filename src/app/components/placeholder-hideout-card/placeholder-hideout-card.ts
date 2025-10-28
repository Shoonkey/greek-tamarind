import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder-hideout-card',
  imports: [],
  templateUrl: './placeholder-hideout-card.html',
  styleUrl: './placeholder-hideout-card.scss',
})
export class PlaceholderHideoutCard {
  imgCount = Math.floor(Math.random() * 3) + 2;
  mockImgArray = new Array(this.imgCount);
}
