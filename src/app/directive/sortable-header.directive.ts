import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

type SortDirection = 'asc' | 'desc' | '';

@Directive({
  selector: '[appSortableHeader]',
  standalone: true
})
export class SortableHeaderDirective {
  @Input() appSortableHeader: string = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<{ column: string, direction: SortDirection }>();

  private rotate: Record<SortDirection, SortDirection> = {
    'asc': 'desc',
    'desc': '',
    '': 'asc'
  };

  @HostListener('click')
  onClick() {
    this.direction = this.rotate[this.direction];
    this.sort.emit({ column: this.appSortableHeader, direction: this.direction?this.direction:'asc' });
  }
}
