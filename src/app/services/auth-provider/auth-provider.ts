import { Injectable, signal } from '@angular/core';

import { LoggedUser } from '../../models/LoggedUser';

@Injectable({
  providedIn: 'root',
})
export class AuthProvider {
  private _user = signal<LoggedUser | null>(null);

  get user() {
    return this._user.asReadonly();
  }

  // TODO: Implement auth
  login() {
    this._user.set({ username: 'potato' });
  }

  signup() {}

  logout() {
    this._user.set(null);
  }
}
