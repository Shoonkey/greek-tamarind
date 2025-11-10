import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';

import { LoggingService } from '../logging-service/logging-service';
import { EnvironmentService } from '../environment-service/environment-service';
import { ApiErrorCode, getApiErrorMsg } from './api-errors';

type CommonHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestData = Record<string, any>;

enum ClientErrorCode {
  NETWORK_ERROR,
}

interface RequestConfig {
  params?: RequestData;
  body?: RequestData;
  method?: CommonHttpMethod;
}

export abstract class BaseApiClient {
  protected http = inject(HttpClient);
  private _loggingService = inject(LoggingService);
  private _envService = inject(EnvironmentService);

  private _apiURL = this._envService.getApiUrl();

  private getClientErrorMsg(errorCode?: ClientErrorCode) {
    switch (errorCode) {
      case ClientErrorCode.NETWORK_ERROR:
        return 'Unable to reach API';
      default:
        return 'An unexpected error happened';
    }
  }

  protected requestAPI<T>(endpoint: string, config: RequestConfig = {}) {
    const { method = 'GET', params, body } = config;

    const url = `${this._apiURL}${endpoint}`;

    return this.http
      .request<T>(method, url, {
        responseType: 'json',
        params,
        body,
      })
      .pipe(
        catchError(({ status, error: response }: HttpErrorResponse) => {
          let errorMsg;

          if (status === 0) errorMsg = this.getClientErrorMsg(ClientErrorCode.NETWORK_ERROR);
          else errorMsg = getApiErrorMsg(response.errorCode as ApiErrorCode);

          this._loggingService.logError(
            'An API client request failed.',
            `Error code: ${response.errorCode}`,
            `Message: ${errorMsg}`,
          );

          throw new Error(errorMsg);
        }),
      );
  }
}
