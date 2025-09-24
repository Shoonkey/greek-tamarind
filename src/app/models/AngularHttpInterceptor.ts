import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AngularHttpInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
) => Observable<HttpEvent<any>>;
