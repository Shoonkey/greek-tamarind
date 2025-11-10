import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpParams, HttpRequest, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { HideoutMap } from '../../models/HideoutMap';
import { ApiClient, GetHideoutListResponse, HideoutListOptions } from './api-client';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let httpTesting: HttpTestingController;

  function expectParamToExist(params: HttpParams, paramName: string) {
    const param = params.getAll(paramName)!;
    expect(param).withContext(`Param "${paramName}" should exist`).not.toBeNull();
  }

  function expectSingleValueParam(params: HttpParams, paramName: string) {
    const param = params.getAll(paramName)!;
    expect(param.length)
      .withContext(`param "${paramName}" should be set only once in the URL`)
      .toBe(1);
  }

  function expectArrayParam(params: HttpParams, paramName: string) {
    const param = params.getAll(paramName)!;
    expect(param.length)
      .withContext(`param "${paramName}" should be set multiple times in the URL`)
      .toBeGreaterThan(1);
  }

  function expectParamValue(params: HttpParams, paramName: string, expectedValue: any) {
    let param: any = params.get(paramName)!;

    switch (typeof expectedValue) {
      case 'number':
        param = parseInt(param, 10);
        expect(param).withContext(`param "${paramName}" should be a valid integer`).not.toBeNaN();
        break;
      case 'boolean':
        expect(['true', 'false'])
          .withContext(`param "${paramName}" should be a valid boolean`)
          .toContain(param);
        param = param === 'true';
        break;
      default:
        break;
    }

    expect(param).toEqual(expectedValue);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    apiClient = TestBed.inject(ApiClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(apiClient).toBeTruthy();
  });

  describe('.getHideoutList({ page, size, filters })', () => {
    let promise: Promise<GetHideoutListResponse>;
    let testReq: TestRequest;
    let reqParams: HttpParams;
    let mockParams: Required<HideoutListOptions> = {
      page: 1,
      pageSize: 5,
      filters: {
        hasMTX: true,
        name: 'some name',
        poeVersion: 1,
        mapIds: ['a', 'b'],
        tagIds: ['c', 'd'],
      },
    };

    beforeEach(() => {
      promise = firstValueFrom(apiClient.getHideoutList(mockParams));
      testReq = httpTesting.expectOne({ method: 'GET' });
      reqParams = testReq.request.params;
    });

    it('should GET /hideout/list', async () => {
      const { method, url } = testReq.request;
      expect(method).toBe('GET');
      expect(url).toBe('/hideout/list');
    });

    it('should set `page` param properly', () => {
      expectParamToExist(reqParams, 'page');
      expectSingleValueParam(reqParams, 'page');
      expectParamValue(reqParams, 'page', mockParams.page);
    });

    it('should set `pageSize` param properly', () => {
      expectParamToExist(reqParams, 'pageSize');
      expectSingleValueParam(reqParams, 'pageSize');
      expectParamValue(reqParams, 'pageSize', mockParams.pageSize);
    });

    it('should send each filter as a parameter itself', () => {
      const params = Object.keys(mockParams.filters);
      params.forEach((param) => expectParamToExist(reqParams, param));
    });

    it('should send every single-value filter properly', () => {
      const singleParams = ['hasMTX', 'name', 'poeVersion'];
      singleParams.forEach((singleValueParam) => {
        expectParamToExist(reqParams, singleValueParam);
        expectSingleValueParam(reqParams, singleValueParam);
      });

      expectParamValue(reqParams, 'name', mockParams.filters.name);
      expectParamValue(reqParams, 'hasMTX', mockParams.filters.hasMTX);
      expectParamValue(reqParams, 'poeVersion', mockParams.filters.poeVersion);
    });

    it('should send every array filter properly', () => {
      const arrayParams = ['mapIds', 'tagIds'];
      arrayParams.forEach((arrayParam) => {
        expectParamToExist(reqParams, arrayParam);
        expectArrayParam(reqParams, arrayParam);
      });
    });

    afterEach(async () => {
      testReq.flush({ items: [], totalCount: 0 });
      expect(await promise).toEqual({ items: [], totalCount: 0 });
    });
  });

  describe('.getHideoutMaps()', () => {
    let promise: Promise<HideoutMap[]>;
    let testReq: TestRequest;

    beforeEach(() => {
      promise = firstValueFrom(apiClient.getHideoutMaps());
      testReq = httpTesting.expectOne({ method: 'GET' });
    });

    it('should GET /hideout/maps', () => {
      const { method, url } = testReq.request;
      expect(method).toBe('GET');
      expect(url).toBe('/hideout/maps');
    });

    afterEach(async () => {
      testReq.flush([{ id: 'a', name: 'b' }]);
      expect(await promise).toEqual([{ id: 'a', name: 'b' }]);
    });
  });

  describe('.getHideoutTags()', () => {
    let promise: Promise<HideoutMap[]>;
    let testReq: TestRequest;

    beforeEach(() => {
      promise = firstValueFrom(apiClient.getHideoutTags());
      testReq = httpTesting.expectOne({ method: 'GET' });
    });

    it('should GET /hideout/tags', () => {
      const { method, url } = testReq.request;
      expect(method).toBe('GET');
      expect(url).toBe('/hideout/tags');
    });

    afterEach(async () => {
      testReq.flush([{ id: 'a', name: 'b' }]);
      expect(await promise).toEqual([{ id: 'a', name: 'b' }]);
    });
  });

  afterEach(() => {
    httpTesting.verify();
  });
});
