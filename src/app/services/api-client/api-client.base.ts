import { environment } from '../../../environments/environment';
import { ApiErrorCode } from '../../i18n/api.errors';

type CommonHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestData = Record<string, any>;

interface OkApiResponse<T> {
  ok: true;
  data: T;
}

interface OopsApiResponse {
  ok: false;
  errorCode: ApiErrorCode;
}

type ApiClientResponse<T> = OkApiResponse<T> | OopsApiResponse;

interface RequestConfig {
  params?: RequestData;
  body?: RequestData;
  method?: CommonHttpMethod;
}

export abstract class BaseApiClient {
  private apiURL = environment.apiURL;
  private unexpectedErrorCode: ApiErrorCode = 'UNEXPECTED_ERROR';

  private Ok<T>(data: T): OkApiResponse<T> {
    return { ok: true, data };
  }

  private Oops(errorCode?: string): OopsApiResponse {
    return {
      ok: false,
      errorCode: (errorCode as ApiErrorCode) || this.unexpectedErrorCode,
    };
  }

  protected async requestAPI<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiClientResponse<T>> {
    const { method, params, body } = config;

    let url = `${this.apiURL}/${endpoint}`;

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
        if (!responseData?.errorId) return this.Oops();
        return this.Oops(responseData.errorId);
      }

      return this.Ok(responseData);
    } catch (e) {
      if (!environment.production) console.error(e);
      return this.Oops();
    }
  }
}
