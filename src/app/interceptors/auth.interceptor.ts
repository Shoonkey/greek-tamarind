import { AngularHttpInterceptor } from '../models/AngularHttpInterceptor';

export const authInterceptor: AngularHttpInterceptor = (req, next) => {
  const authToken = ''; // TODO: inject(AuthService).getAuthToken();

  const updatedReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${authToken}`),
  });

  return next(updatedReq);
};
