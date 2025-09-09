import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  title = input<string>();
  click = output<PointerEvent>();

  handleClick(e: PointerEvent) {
    e.stopPropagation();
    this.click.emit(e);
  }
}
