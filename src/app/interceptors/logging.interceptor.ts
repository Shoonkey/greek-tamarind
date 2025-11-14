import { inject } from '@angular/core';

import { LoggingService } from '../services/logging-service/logging-service';
import { AngularHttpInterceptor } from '../models/AngularHttpInterceptor';

export const loggingInterceptor: AngularHttpInterceptor = (req, next) => {
  const loggingService = inject(LoggingService);
  loggingService.logInfo(`API request at: ${req.url}`);

  return next(req);
};
