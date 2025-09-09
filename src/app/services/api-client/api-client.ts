import { Injectable } from '@angular/core';

import { BaseApiClient } from './api-client.base';
import { HideoutMetadata } from '../../models/HideoutMetadata';

export interface LoadHideoutsOptions {
  page: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList(opts: LoadHideoutsOptions) {
    return this.requestAPI<HideoutMetadata[]>('/hideout/list', { params: { page: opts.page } });
  }
}
