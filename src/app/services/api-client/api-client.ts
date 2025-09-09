import { Injectable } from '@angular/core';

import { BaseApiClient } from './api-client.base';

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList() {
    return this.requestAPI('/hideout/list');
  }
}
