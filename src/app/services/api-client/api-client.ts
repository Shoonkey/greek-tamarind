import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { HideoutMetadata } from '../../models/HideoutMetadata';
import { PoeVersion } from '../../models/PoeVersion';
import { BaseApiClient } from './api-client.base';

export interface HideoutListFiltersInput {
  poeVersion?: PoeVersion;
  hasMTX?: boolean;
  title?: string;
  maps?: string[];
  tags?: string[];
}

export interface HideoutListOptions {
  page: number;
  filters: HideoutListFiltersInput;
}

interface GetHideoutListResponse {
  list: HideoutMetadata[];
  matchCount: number;
}

interface GetHideoutMapsResponse {
  maps: any;
}

interface GetHideoutTagsResponse {
  tags: string[];
}

interface GetHideoutPageCountResponse {
  itemsPerPage: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList({ page, filters }: HideoutListOptions) {
    return this.requestAPI<GetHideoutListResponse>('/hideout/list', {
      params: { page, filters: JSON.stringify(filters) },
    });
  }

  getHideoutMaps() {
    return this.requestAPI<GetHideoutMapsResponse>('/hideout/maps').pipe(map((v) => v.maps));
  }

  getHideoutTags() {
    return this.requestAPI<GetHideoutTagsResponse>('/hideout/tags').pipe(map((v) => v.tags));
  }

  getHideoutPaginationData() {
    return this.requestAPI<GetHideoutPageCountResponse>('/hideout/pagination');
  }
}
