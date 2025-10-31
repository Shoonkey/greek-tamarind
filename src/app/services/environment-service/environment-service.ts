import { Injectable } from '@angular/core';

import { AppEnvironment } from '../../../environments/environment.type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private _environment: AppEnvironment = environment;

  isProduction() {
    return this._environment.production;
  }

  getApiUrl() {
    return this._environment.apiURL;
  }
}
