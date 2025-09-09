import { environment } from '../../../environments/environment';
import { ApiErrorCode } from '../../i18n/api.errors';

type CommonHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestData = BodyInit;

interface OkApiResponse {
  ok: true;
  data: any;
}

interface OopsApiResponse {
  ok: false;
  errorCode: string;
}

type ApiClientResponse = OkApiResponse | OopsApiResponse;

interface RequestConfig {
  body?: RequestData;
  method?: CommonHttpMethod;
}

export abstract class BaseApiClient {
  private apiURL = environment.apiURL;
  private unexpectedErrorCode: ApiErrorCode = 'UNEXPECTED_ERROR';

  private Ok(data: any): OkApiResponse {
    return { ok: true, data };
  }

  private Oops(errorCode?: string): OopsApiResponse {
    return {
      ok: false,
      errorCode: errorCode || this.unexpectedErrorCode,
    };
  }

  protected async requestAPI(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiClientResponse> {
    const url = `${this.apiURL}/${endpoint}`;

    try {
      const { method = 'GET', body } = config;
      const response = await fetch(url, { method, body });
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
