import { environment } from '../../environments/environment';
import { AngularHttpInterceptor } from '../models/AngularHttpInterceptor';

export const loggingInterceptor: AngularHttpInterceptor = (req, next) => {
  if (!environment.production) console.log(`API request at: ${req.url}`);

  return next(req);
};
