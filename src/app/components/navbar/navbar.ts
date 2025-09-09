import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../button/button';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-navbar',
  imports: [Button, Icon, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  isDropdownOpen = signal<boolean>(false);

  toggleDropdown() {
    console.log('toggle');
    this.isDropdownOpen.update((open) => !open);
  }
}
