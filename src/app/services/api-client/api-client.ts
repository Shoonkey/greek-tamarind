import { Injectable } from '@angular/core';

import { BaseApiClient } from './api-client.base';

export interface LoadHideoutsOptions {
  page: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList(opts: LoadHideoutsOptions) {
    return this.requestAPI('/hideout/list', { params: { page: opts.page } });
  }
}
