import { environment } from '../../../environments/environment';

type CommonHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestData = Record<string, any>;

// TODO: Add all error codes possibly receivable from API
export enum ApiErrorCode {
  HIDEOUT_NOT_FOUND,
  USER_NOT_FOUND,
}

enum RequestErrorCode {
  REQUEST_CANCELLED,
  REQUEST_BLOCKED,
  INVALID_REQUEST,
}

interface OkApiResponse<T> {
  ok: true;
  data: T;
}

interface OopsApiResponse {
  ok: false;
  errorMsg: string;
}

export type ApiClientResponse<T> = OkApiResponse<T> | OopsApiResponse;

interface RequestConfig {
  params?: RequestData;
  body?: RequestData;
  method?: CommonHttpMethod;
}

export abstract class BaseApiClient {
  private apiURL = environment.apiURL;

  private Ok<T>(data: T): OkApiResponse<T> {
    return { ok: true, data };
  }

  private Oops(errorCode?: ApiErrorCode | RequestErrorCode): OopsApiResponse {
    return {
      ok: false,
      errorMsg: this.getErrorMsgFromCode(errorCode),
    };
  }

  // TODO: Make a proper map between error codes and error messages
  private getErrorMsgFromCode(errorCode?: ApiErrorCode | RequestErrorCode) {
    switch (errorCode) {
      case RequestErrorCode.REQUEST_BLOCKED:
        return 'Request blocked';
      case RequestErrorCode.REQUEST_CANCELLED:
        return 'Request cancelled';
      case RequestErrorCode.INVALID_REQUEST:
        return 'Unable to reach API';
      default:
        return 'An unexpected error happened';
    }
  }

  private logError(...e: any[]) {
    if (environment.production) return;

    console.error('An API client request failed.', ...e);
  }

  protected async requestAPI<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiClientResponse<T>> {
    const { method, params, body } = config;

    let url = `${this.apiURL}${endpoint}`;

    if (params) {
      const encodedParams = new URLSearchParams(params);
      url += `?${encodedParams}`;
    }

    let fetchConfig: RequestInit = {};

    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    if (method === 'POST' && body) {
      headers.set('Content-Type', 'application/json');
      fetchConfig.body = JSON.stringify(body);
    }

    fetchConfig.headers = headers;

    try {
      const response = await fetch(url, fetchConfig);
      const responseData = await response.json();

      if (!response.ok) {
        if (!responseData?.errorCode)
          this.logError("The API returned ok=false but didn't return an error code");

        return this.Oops(responseData.errorCode as ApiErrorCode);
      }

      return this.Ok(responseData);
    } catch (e) {
      // Known exceptions for fetch:
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
      if (e instanceof DOMException) {
        if (e.name === 'AbortError') return this.Oops(RequestErrorCode.REQUEST_CANCELLED);
        if (e.name === 'NotAllowedError') return this.Oops(RequestErrorCode.REQUEST_BLOCKED);
      }

      // If it reaches this point, a TypeError was thrown, due to invalid setup, a network error,
      // or being blocked by a permissions policy. The most likely here is that either the user
      // isn't connected to the internet or the API didn't respond.
      this.logError('Unexpected fetch error', e);
      return this.Oops(RequestErrorCode.INVALID_REQUEST);
    }
  }
}
