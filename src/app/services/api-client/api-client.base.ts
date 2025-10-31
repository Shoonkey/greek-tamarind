import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoggingService } from '../logging-service/logging-service';
import { ApiErrorCode, getApiErrorMsg } from './api-errors';
import { EnvironmentService } from '../environment-service/environment-service';

type CommonHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestData = Record<string, any>;

enum ClientErrorCode {
  REQUEST_TIMED_OUT,
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
      case ClientErrorCode.REQUEST_TIMED_OUT:
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

          if (status === 0) errorMsg = this.getClientErrorMsg(ClientErrorCode.REQUEST_TIMED_OUT);
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
