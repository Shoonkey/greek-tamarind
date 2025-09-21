import { Component, input, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-pagination-control',
  imports: [MatIconButton, MatIcon],
  templateUrl: './pagination-control.html',
  styleUrl: './pagination-control.scss',
})
export class PaginationControl {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  editing = signal<boolean>(false);

  pageChanged = output<number>();

  toggleInputMode() {
    this.editing.update((isEditing) => !isEditing);
  }

  handlePageFormSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const pageInput = form.elements[0] as HTMLInputElement;

    const newPage = parseInt(pageInput.value);
    this.pageChanged.emit(newPage);
  }
}
