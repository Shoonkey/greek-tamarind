import { Injectable } from '@angular/core';

import { BaseApiClient } from './api-client.base';
import { HideoutMetadata } from '../../models/HideoutMetadata';

export interface PaginationOptions {
  page: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList(opts: PaginationOptions) {
    return this.requestAPI<{ list: HideoutMetadata[] }>('/hideout/list', {
      params: { page: opts.page },
    });
  }

  getHideoutMaps() {
    return this.requestAPI<{ maps: string[] }>('/hideout/maps');
  }

  getHideoutTags() {
    return this.requestAPI<{ tags: string[] }>('/hideout/tags');
  }

  getHideoutPageCount() {
    return this.requestAPI<{ pageCount: number }>('/hideout/page-count');
  }
}
