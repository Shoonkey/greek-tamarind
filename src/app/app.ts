import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  iconRegistry = inject(MatIconRegistry);

  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
