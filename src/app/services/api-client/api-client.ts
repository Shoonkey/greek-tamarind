import { Injectable } from '@angular/core';

import { BaseApiClient } from './api-client.base';
import { HideoutListItem } from '../../models/HideoutListItem';
import { PoeVersion } from '../../models/PoeVersion';
import { HideoutMap } from '../../models/HideoutMap';
import { HideoutTag } from '../../models/HideoutTag';

export interface HideoutListFiltersInput {
  poeVersion?: PoeVersion;
  hasMTX?: boolean;
  name?: string;
  mapIds?: string[];
  tagIds?: string[];
}

export interface HideoutListOptions {
  page: number;
  pageSize: number;
  filters?: HideoutListFiltersInput;
}

export interface GetHideoutListResponse {
  items: HideoutListItem[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient extends BaseApiClient {
  getHideoutList({ page, pageSize, filters }: HideoutListOptions) {
    return this.requestAPI<GetHideoutListResponse>('/hideout/list', {
      params: { page, pageSize, ...filters },
    });
  }

  getHideoutMaps() {
    return this.requestAPI<HideoutMap[]>('/hideout/maps');
  }

  getHideoutTags() {
    return this.requestAPI<HideoutTag[]>('/hideout/tags');
  }
}
