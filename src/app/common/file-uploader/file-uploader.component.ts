import { Component, ElementRef, EventEmitter, inject, Input, input, OnInit, Output, ViewChild } from '@angular/core';
import { DragDropDirective } from '../../directive/drag-drop.directive';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../service/common.service';
import { maxSIZEMB, maxUploads } from '../../../global/app.global';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [DragDropDirective, ReactiveFormsModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.css'
})
export class FileUploaderComponent implements OnInit {

  @Input() MAX_UPLODS: any;
  @Output() onFileUpload = new EventEmitter<any>(); // Declares an output property named 'dataEmitted'
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onFileDropped(file: any) {
    this.onFileUpload.emit(file);
    // const reader = new FileReader();
    // reader.onload = () => {
    // };
    // reader.readAsDataURL(file);
  }
  ngOnInit(): void {

  }
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const filesArray = Array.from(input.files); // FileList → File[]
    const validImages = Array.from(input.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (filesArray.length > this.MAX_UPLODS) {
      this.commonService.showError(`You can upload a maximum of ${this.MAX_UPLODS} images.`);
      this.fileInput.nativeElement.value = '';
      return;
    }
    else if (validImages.length != filesArray.length) {
      this.commonService.showError(`Only Image is allowed`);
      this.fileInput.nativeElement.value = '';
      return;
    }
    for await (const file of validImages) {
      if (file.size > (maxSIZEMB()* 1024 * 1024)) {
        this.commonService.showError(`⚠️ File is too large! Maximum allowed size is ${maxSIZEMB()} MB.`);
         this.fileInput.nativeElement.value = '';
        return;
      }
    }
    this.onFileUpload.emit(validImages);
    this.fileInput.nativeElement.value = '';

  }
  setMAX_UPLODS(value: any) {
    this.MAX_UPLODS = value;
  }
}
