import '@phosphor-icons/web/light';

import { Component, input } from '@angular/core';

type IconSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  name = input.required<string>();
  size = input<IconSize>('sm');
}
