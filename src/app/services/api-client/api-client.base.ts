import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoggingService } from '../logging-service/logging-service';

type CommonHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestData = Record<string, any>;

// TODO: Add all error codes possibly receivable from API
export enum ApiErrorCode {
  HIDEOUT_NOT_FOUND,
  USER_NOT_FOUND,
  UNAUTHORIZED_OPERATION,
}

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
  private loggingService = inject(LoggingService);

  private apiURL = environment.apiURL;

  private getClientErrorMsg(errorCode?: ClientErrorCode) {
    switch (errorCode) {
      case ClientErrorCode.REQUEST_TIMED_OUT:
        return 'Unable to reach API';
      default:
        return 'An unexpected error happened';
    }
  }

  // TODO: Make a proper map between error codes and error messages
  private getApiErrorMsg(errorCode?: ApiErrorCode) {
    switch (errorCode) {
      case ApiErrorCode.UNAUTHORIZED_OPERATION:
        return 'Unauthorized operation';
      case ApiErrorCode.USER_NOT_FOUND:
        return "Couldn't find user";
      case ApiErrorCode.HIDEOUT_NOT_FOUND:
        return "Couldn't find hideout";
      default:
        return 'An unexpected error happened';
    }
  }

  protected requestAPI<T>(endpoint: string, config: RequestConfig = {}) {
    const { method = 'GET', params, body } = config;

    const url = `${this.apiURL}${endpoint}`;

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
          else errorMsg = this.getApiErrorMsg(response.errorCode as ApiErrorCode);

          this.loggingService.logError(
            'An API client request failed.',
            `Error code: ${response.errorCode}`,
            `Message: ${errorMsg}`,
          );

          throw new Error(errorMsg);
        }),
      );
  }
}
