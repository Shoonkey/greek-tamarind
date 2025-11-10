import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { MockApiClient } from './mock-api-client';
import { ApiErrorCode } from './api-errors';

describe('BaseApiClient', () => {
  let mockApiClient: MockApiClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    mockApiClient = TestBed.inject(MockApiClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(mockApiClient).toBeTruthy();
  });

  describe('should be able to requests', () => {
    it('GET', async () => {
      const promise = firstValueFrom(mockApiClient.get());

      const testReq = httpTesting.expectOne('/mock/get', 'GET request');
      expect(testReq.request.method).withContext(`Request method should be GET`).toBe('GET');

      testReq.flush(mockApiClient.record);

      expect(await promise)
        .withContext('Response should be correct')
        .toEqual(mockApiClient.record);
    });

    it('POST', async () => {
      const promise = firstValueFrom(mockApiClient.post());

      const testReq = httpTesting.expectOne(
        {
          method: 'POST',
          url: '/mock/post',
        },
        'POST request',
      );

      expect(testReq.request.method).withContext(`Request method should be POST`).toBe('POST');

      const recordWithoutId = { ...mockApiClient.record };
      delete recordWithoutId.id;

      expect(testReq.request.body).toEqual(recordWithoutId);

      testReq.flush(true);

      expect(await promise)
        .withContext('Response should be correct')
        .toBeTrue();
    });

    it('PUT', async () => {
      const promise = firstValueFrom(mockApiClient.put());

      const testReq = httpTesting.expectOne(
        {
          method: 'PUT',
          url: '/mock/put',
        },
        'PUT request',
      );

      expect(testReq.request.method).withContext(`Request method should be PUT`).toBe('PUT');
      expect(testReq.request.body).toEqual(mockApiClient.record);

      testReq.flush(true);

      expect(await promise)
        .withContext('Response should be correct')
        .toBeTrue();
    });

    it('DELETE', async () => {
      const promise = firstValueFrom(mockApiClient.delete());

      const testReq = httpTesting.expectOne(
        {
          method: 'DELETE',
          url: '/mock/delete',
        },
        'DELETE request',
      );

      expect(testReq.request.method).withContext(`Request method should be DELETE`).toBe('DELETE');

      testReq.flush(true);

      expect(await promise)
        .withContext('Response should be correct')
        .toBeTrue();
    });
  });

  // update tests as new errors are made
  describe('should handle errors', () => {
    let promise: Promise<any>;
    let testReq: TestRequest;

    beforeEach(() => {
      promise = firstValueFrom(mockApiClient.get());
      testReq = httpTesting.expectOne('/mock/get', 'GET request');
    });

    it('Frontend/NETWORK_ERROR', async () => {
      // Simulate network error (https://angular.dev/guide/http/testing#network-errors)
      testReq.error(new ProgressEvent('Network error'));

      await expectAsync(promise).toBeRejectedWithError('Unable to reach API');
    });

    it('Backend/API_FORBIDDEN', async () => {
      testReq.flush(
        { errorCode: ApiErrorCode.API_FORBIDDEN },
        { status: HttpStatusCode.Forbidden, statusText: 'Forbidden access' },
      );
      await expectAsync(promise).toBeRejectedWithError('Unauthorized operation');
    });

    it('Backend/API_UPLOAD_FAILED', async () => {
      testReq.flush(
        { errorCode: ApiErrorCode.API_UPLOAD_FAILED },
        { status: 400, statusText: 'Upload failed' },
      );
      await expectAsync(promise).toBeRejectedWithError("Couldn't finish uploading file");
    });

    it('Backend/API_UPLOAD_TOO_LARGE', async () => {
      testReq.flush(
        { errorCode: ApiErrorCode.API_UPLOAD_TOO_LARGE },
        { status: HttpStatusCode.PayloadTooLarge, statusText: 'File too large for upload' },
      );
      await expectAsync(promise).toBeRejectedWithError(
        "Couldn't upload because the file is too large",
      );
    });

    it('Backend/ROUTE_NOT_FOUND', async () => {
      testReq.flush(
        { errorCode: ApiErrorCode.API_ROUTE_NOT_FOUND },
        { status: HttpStatusCode.NotFound, statusText: 'Route not found' },
      );
      await expectAsync(promise).toBeRejectedWithError("Couldn't find route");
    });

    it('Backend/USER_NOT_FOUND', async () => {
      testReq.flush(
        { errorCode: ApiErrorCode.USER_NOT_FOUND },
        { status: HttpStatusCode.NotFound, statusText: 'User not found' },
      );
      await expectAsync(promise).toBeRejectedWithError("Couldn't find user");
    });

    it('Backend/HIDEOUT_NOT_FOUND', async () => {
      testReq.flush(
        { errorCode: ApiErrorCode.HIDEOUT_NOT_FOUND },
        { status: HttpStatusCode.NotFound, statusText: 'Hideout not found' },
      );
      await expectAsync(promise).toBeRejectedWithError("Couldn't find hideout");
    });

    it("Fallback (when the backend doesn't give an error code)", async () => {
      testReq.flush({}, { status: HttpStatusCode.BadRequest, statusText: 'Bad request' });
      await expectAsync(promise).toBeRejectedWithError('An unexpected error happened on our end');
    });

    afterEach(() => {
      expect(testReq.cancelled).toBeTrue();
    });
  });

  it('should allow for request cancellation', () => {
    const request$ = mockApiClient.get();
    const subscription = request$.subscribe();

    const testReq = httpTesting.expectOne('/mock/get', 'GET request');
    subscription.unsubscribe();

    expect(() => testReq.flush(null)).toThrowError('Cannot flush a cancelled request.');
    expect(testReq.cancelled).toBeTrue();
  });

  afterEach(() => {
    httpTesting.verify();
  });
});
