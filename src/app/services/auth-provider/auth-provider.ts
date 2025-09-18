import { Injectable } from '@angular/core';
import { LoggedUser } from '../../models/LoggedUser';

@Injectable({
  providedIn: 'root',
})
export class AuthProvider {
  user?: LoggedUser = {
    username: 'potato',
  };

  login() {}
  signup() {}
  logout() {}
}
