import { Component, input, output, signal } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-pagination-control',
  imports: [Button, Icon],
  templateUrl: './pagination-control.html',
  styleUrl: './pagination-control.scss',
})
export class PaginationControl {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  editing = signal<boolean>(false);

  pageChange = output<number>();

  toggleInputMode() {
    this.editing.update((isEditing) => !isEditing);
  }

  handlePageChange(newPage: number) {
    this.pageChange.emit(newPage);
  }

  handlePageFormSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const pageInput = form.elements[0] as HTMLInputElement;

    const newPage = parseInt(pageInput.value);
    this.handlePageChange(newPage);
  }
}
