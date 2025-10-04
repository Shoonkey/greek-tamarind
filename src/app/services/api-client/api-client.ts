import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { HideoutMetadata } from '../../models/HideoutMetadata';
import { BaseApiClient } from './api-client.base';
import { HideoutListFiltersOutput } from '../../components/hideout-list-filters/hideout-list-filters';

export interface HideoutListOptions {
  page: number;
  filters: HideoutListFiltersOutput;
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
  getHideoutList({ page, filters }: HideoutListOptions) {
    return this.requestAPI<GetHideoutListResponse>('/hideout/list', {
      params: { page, filters: JSON.stringify(filters) },
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
