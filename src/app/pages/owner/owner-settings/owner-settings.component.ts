import { Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TitleService } from '../../../service/title.service';
import { FileUploaderComponent } from '../../../common/file-uploader/file-uploader.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { getParkingSpaceID, maxUploads, setParkingSpaceID } from '../../../../global/app.global';
import { catchError, exhaustMap, of } from 'rxjs';
import { ProfileComponent } from '../../profile/profile.component';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { SlotSettingComponent } from '../slot-setting/slot-setting.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddParkingComponent } from '../add-parking/add-parking.component';
import { CreateSlotComponent } from '../create-slot/create-slot.component';

@Component({
  selector: 'app-owner-settings',
  standalone: true,
  imports: [FileUploaderComponent, ReactiveFormsModule, CommonModule, ProfileComponent, ChangePasswordComponent,
    SlotSettingComponent, NgbModalModule,AddParkingComponent,CreateSlotComponent],
  templateUrl: './owner-settings.component.html',
  styleUrl: './owner-settings.component.css'
})
export class OwnerSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  private modalService = inject(NgbModal);

  public photos: any = [];
  public MAX_UPLODS: any;
  modalRef: any;
  slotmodalRef: any;
  @ViewChild('content') content!: TemplateRef<any>;
  @ViewChild('slot_content') slot_content!: TemplateRef<any>;
  @ViewChild('setting_ref') SlotSettingRef!:SlotSettingComponent

  ParkingSpaceID: any;
  parkingData: any = null;
  submitting: boolean = false;

  @ViewChild('file_uploader') fileUploader!: FileUploaderComponent;
  public titleService = inject(TitleService);

  parkingForm = this.fb.group({
    id: [null],
    files: [[], Validators.required],
    photos: [[]],
    deleted_files: [],

  });

  ngOnInit(): void {
    this.titleService.setPageTitle("Settings");
    this.MAX_UPLODS = maxUploads() - this.photos.length;
    if (this.commonService.isBrowser()) {
      this.ParkingSpaceID = getParkingSpaceID();
      console.log(this.ParkingSpaceID);
      if (this.ParkingSpaceID) {
        this.parkingForm.patchValue({ id: this.ParkingSpaceID });
        this.fechParkingDetail();
      }
    }

  }
  fechParkingDetail() {
    this.commonService.postJsonData("parking-owner/parking-space/detail", { id: this.ParkingSpaceID }).subscribe(resp => {
      if (resp.status == 'success') {
        this.parkingData = resp.data;
          this.parkingForm.patchValue({ photos: this.parkingData.photos.toString() });
      }
    });
  }
  attachFiles(files: any) {
    let photos: any = this.parkingForm.value.files?this.parkingForm.value.files:[];
    files = Array.isArray(files) ? files : [files]
    photos = [...photos, ...files];
    this.MAX_UPLODS = this.MAX_UPLODS - photos.length;
    this.fileUploader.setMAX_UPLODS(this.MAX_UPLODS);
    this.parkingForm.patchValue({ files: photos });
    for (let file of photos) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos.push({ file, url: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }
  removePhoto(index: number) {
    this.photos.splice(index, 1);
    this.MAX_UPLODS = this.MAX_UPLODS + 1;
    this.fileUploader.setMAX_UPLODS(this.MAX_UPLODS);
  }
  onSubmit() {
    if(!this.ParkingSpaceID)
    {
      this.commonService.showError("Please Add Parking Space First");
      this.openAddParking();
      return;
    }
    this.submitting = true;
    if (this.parkingForm.invalid) {
      this.parkingForm.markAllAsTouched(); // 🔥 Show validation errors
      return;
    }



    const { files,photos,deleted_files} = this.parkingForm.value;
    of(this.parkingForm.value).pipe(
      exhaustMap(({ }) =>
        this.commonService.postFormData('parking-owner/parking-space/add-photo', {
          ...{ files: files, id: this.ParkingSpaceID,photos,deleted_files}
        }).pipe(

          catchError((err) => {
            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      this.submitting = false;
      if (res.status == 'success') {
        this.commonService.showSuccess(res.message);
        this.parkingData = res.data;
        this.parkingForm.patchValue({photos:this.parkingData.photos,deleted_files:null,files:null});
        this.MAX_UPLODS=maxUploads();
        this.photos = [];
      }

    });

  }
   removeExistingPhoto(index: number)
  {
    let photos:any=this.parkingForm.value.photos;
    photos=photos.split(",");
    const file_path=photos[index];
    photos.splice(index, 1);
    this.parkingData?.image_previews.splice(index, 1);
    this.parkingForm.patchValue({photos:photos.toString()});
    let deleted_files:any=[this.parkingForm.value.deleted_files,file_path];
    deleted_files = deleted_files.filter(Boolean);
    this.parkingForm.patchValue({deleted_files:deleted_files.toString(),photos:photos.toString()});

    if(photos.length<=0)
    {
      this.parkingForm.get('files')?.addValidators(Validators.required);
      this.parkingForm.get('files')?.updateValueAndValidity();

    }
  }
  openAddParking() {
    this.modalRef = this.modalService.open(this.content, { scrollable: true, size: 'xl', backdrop: 'static', keyboard: false });// Disable outside click
  }
   openAddSlot() {
    if(!this.ParkingSpaceID)
    {
      this.commonService.showError("Please Add Parking Space First");
      this.openAddParking();
      return;
    }
    this.slotmodalRef = this.modalService.open(this.slot_content, { scrollable: true, size: 'lg', backdrop: 'static', keyboard: false });// Disable outside click
  }
    closeModal(data:any) {
      this.modalRef.close();
      this.parkingData=data;
      setParkingSpaceID(this.parkingData.id);
      this.ParkingSpaceID=this.parkingData.id;

    }
      closeslotModal(data:any) {
      this.slotmodalRef.close();
      this.ParkingSpaceID=this.parkingData.id;
      this.SlotSettingRef.fetchViewSlot(this.ParkingSpaceID)

    }

}
