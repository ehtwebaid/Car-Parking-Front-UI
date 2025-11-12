import { Directive, EventEmitter, HostBinding, HostListener, inject, Input, Output } from '@angular/core';
import { CommonService } from '../service/common.service';
import { maxSIZEMB } from '../../global/app.global';

@Directive({
  selector: '[appDragDrop]',
  standalone: true
})
export class DragDropDirective {

  constructor() {}
  private readonly MAX_SIZE_MB = maxSIZEMB();
  @Input() MAX_UPLODS:any;
  @Output() fileDropped = new EventEmitter<File>(); // ✅ still works but more explicit above
  @HostBinding('class.fileover') fileOver: boolean = false;
  public commonService = inject(CommonService);
  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    if (this.MAX_UPLODS<=0) return;
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(event: DragEvent) {
    if (this.MAX_UPLODS<=0) return;
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(event: DragEvent) {

    if (this.MAX_UPLODS<=0) {alert("HH");return};
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (!file.type.startsWith('image/')) {
        this.commonService.showError('Only image files are allowed!');
        return;
      }
      const maxSizeBytes = this.MAX_SIZE_MB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.commonService.showError(`⚠️ File is too large! Maximum allowed size is ${this.MAX_SIZE_MB} MB.`);
        return;
      }
      this.fileDropped.emit(file);
    }
  }
}
