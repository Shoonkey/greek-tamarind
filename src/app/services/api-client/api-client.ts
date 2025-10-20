import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { BaseApiClient } from './api-client.base';
import { HideoutListItem } from '../../models/HideoutListItem';
import { PoeVersion } from '../../models/PoeVersion';
import { HideoutMap } from '../../models/HideoutMap';
import { HideoutTag } from '../../models/HideoutTag';

export interface HideoutListFiltersInput {
  poeVersion?: PoeVersion;
  hasMTX?: boolean;
  name?: string;
  maps?: string[];
  tags?: string[];
}

export interface HideoutListOptions {
  page: number;
  filters?: HideoutListFiltersInput;
}

export interface GetHideoutListResponse {
  items: HideoutListItem[];
  totalCount: number;
}

export interface GetHideoutMapsResponse {
  maps: HideoutMap[];
}

export interface GetHideoutTagsResponse {
  tags: HideoutTag[];
}

export interface GetHideoutPageCountResponse {
  itemsPerPage: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList({ page, filters }: HideoutListOptions) {
    return this.requestAPI<GetHideoutListResponse>('/hideout/list', {
      params: { page, ...filters },
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
