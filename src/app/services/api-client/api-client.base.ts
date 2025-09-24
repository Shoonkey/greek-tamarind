import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';

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

  private logError(...e: any[]) {
    if (environment.production) return;

    console.error('An API client request failed.', ...e);
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
          this.logError(response.errorCode);

          let errorMsg;

          if (status === 0) errorMsg = this.getClientErrorMsg(ClientErrorCode.REQUEST_TIMED_OUT);
          else errorMsg = this.getApiErrorMsg(response.errorCode as ApiErrorCode);

          throw new Error(errorMsg);
        }),
      );
  }
}
