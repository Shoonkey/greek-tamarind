import { inject } from '@angular/core';

import { AngularHttpInterceptor } from '../models/AngularHttpInterceptor';
import { LoggingService } from '../services/logging-service/logging-service';
import { EnvironmentService } from '../services/environment-service/environment-service';

export const loggingInterceptor: AngularHttpInterceptor = (req, next) => {
  const environment = inject(EnvironmentService);

  if (!environment.isProduction()) {
    const loggingService = inject(LoggingService);
    loggingService.logInfo(`API request at: ${req.url}`);
  }

  return next(req);
};
