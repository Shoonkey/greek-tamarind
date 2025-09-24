import { Injectable } from '@angular/core';

import { HideoutMetadata } from '../../models/HideoutMetadata';
import { BaseApiClient } from './api-client.base';
import { map } from 'rxjs';

export interface PaginationOptions {
  page: number;
}

interface GetHideoutListResponse {
  list: HideoutMetadata[];
}

interface GetHideoutMapsResponse {
  maps: any;
}

interface GetHideoutTagsResponse {
  tags: string[];
}

interface GetHideoutPageCountResponse {
  pageCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList(opts: PaginationOptions) {
    return this.requestAPI<GetHideoutListResponse>('/hideout/list', {
      params: { page: opts.page },
    }).pipe(map((v) => v.list));
  }

  getHideoutMaps() {
    return this.requestAPI<GetHideoutMapsResponse>('/hideout/maps').pipe(map((v) => v.maps));
  }

  getHideoutTags() {
    return this.requestAPI<GetHideoutTagsResponse>('/hideout/tags').pipe(map((v) => v.tags));
  }

  getHideoutPageCount() {
    return this.requestAPI<GetHideoutPageCountResponse>('/hideout/page-count').pipe(
      map((v) => v.pageCount),
    );
  }
}
