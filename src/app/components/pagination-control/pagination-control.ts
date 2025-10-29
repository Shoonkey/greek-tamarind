import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-pagination-control',
  imports: [MatIconButton, MatIcon, MatTooltip],
  templateUrl: './pagination-control.html',
  styleUrl: './pagination-control.scss',
})
export class PaginationControl {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChanged = output<number>();
}
