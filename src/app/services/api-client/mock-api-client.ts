import { Injectable } from '@angular/core';

import { BaseApiClient } from './api-client.base';

interface MockTestRecord {
  id?: number;
  test: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MockApiClient extends BaseApiClient {
  record: MockTestRecord = {
    id: 1,
    test: true,
  };

  get() {
    return this.requestAPI(`/mock/get`);
  }

  post() {
    const recordWithoutId = { ...this.record };
    delete recordWithoutId.id;

    return this.requestAPI('/mock/post', {
      method: 'POST',
      body: {
        test: true,
      },
    });
  }

  put() {
    return this.requestAPI('/mock/put', {
      method: 'PUT',
      body: this.record,
    });
  }

  delete() {
    return this.requestAPI(`/mock/delete`, {
      method: 'DELETE',
    });
  }
}
