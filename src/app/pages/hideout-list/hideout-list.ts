import { Component, inject, OnInit, signal } from '@angular/core';

import { ApiClient } from '../../services/api-client/api-client';

@Component({
  selector: 'app-hideout-list',
  imports: [],
  templateUrl: './hideout-list.html',
  styleUrl: './hideout-list.scss',
})
export class HideoutList implements OnInit {
  apiClient = inject(ApiClient);

  hideouts = signal<string>('');

  async loadHideoutsAsText() {
    return this.apiClient.getHideoutList().then(JSON.stringify);
  }

  ngOnInit() {
    this.loadHideoutsAsText().then((text) => this.hideouts.set(text));
  }
}
