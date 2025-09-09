import { Component, inject, OnInit, signal } from '@angular/core';

import { ApiClient, LoadHideoutsOptions } from '../../services/api-client/api-client';
import { HideoutCard } from '../../components/hideout-card/hideout-card';
import { PaginationControl } from '../../components/pagination-control/pagination-control';
import { HideoutMetadata } from '../../models/HideoutMetadata';
import { i18nApi } from '../../i18n';

@Component({
  selector: 'app-hideout-list',
  imports: [HideoutCard, PaginationControl],
  templateUrl: './hideout-list.html',
  styleUrl: './hideout-list.scss',
})
export class HideoutList implements OnInit {
  apiClient = inject(ApiClient);

  currentPage = signal<number>(1);

  hideouts = signal<HideoutMetadata[] | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async loadHideouts(opts: LoadHideoutsOptions) {
    this.loading.set(true);
    const response = await this.apiClient.getHideoutList(opts);
    this.loading.set(false);

    if (response.ok) this.hideouts.set(response.data);
    else {
      const errorMessage = i18nApi('en-US', response.errorCode);
      this.error.set(errorMessage);
    }
  }

  updatePage(page: number) {
    this.loadHideouts({ page });
  }

  ngOnInit() {
    this.loadHideouts({ page: this.currentPage() });
  }
}
