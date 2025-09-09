import { Component, input, output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  title = input<string>();
  click = output<PointerEvent>();
  class = input<string>();

  handleClick(e: PointerEvent) {
    e.stopPropagation();
    this.click.emit(e);
  }
}
