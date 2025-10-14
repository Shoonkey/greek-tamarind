import { inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { AngularHttpInterceptor } from '../models/AngularHttpInterceptor';
import { LoggingService } from '../services/logging-service/logging-service';

export const loggingInterceptor: AngularHttpInterceptor = (req, next) => {
  if (!environment.production) {
    const loggingService = inject(LoggingService);
    loggingService.logInfo(`API request at: ${req.url}`);
  }

  return next(req);
};
