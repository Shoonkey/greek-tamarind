import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';

import { AuthProvider } from '../../services/auth-provider/auth-provider';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    MatDivider,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  authProvider = inject(AuthProvider);
  router = inject(Router);

  user = this.authProvider.user;

  authModalOpen = signal<boolean>(false);

  // TODO: implement auth modal component
  openAuthModal() {
    this.authModalOpen.set(true);
  }

  login(username: string, password: string) {
    this.authProvider.login();
  }

  logout() {
    this.authProvider.logout();
    this.router.navigateByUrl('/');
  }
}
