import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FileUploaderComponent } from '../../../common/file-uploader/file-uploader.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { NgbTimepickerConfig, NgbTimepickerModule, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { NumericDirective } from '../../../directive/numeric.directive';
import { catchError, map, Observable, of, exhaustMap } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { atLeastOneFileValidator, atLeastOneSlotValidator, divisibleBy30Validator, endTimeAfterStartTimeValidator, maxFieldValidator, maxUploads } from '../../../../global/app.global';

@Component({
  selector: 'app-add-parking',
  standalone: true,
  imports: [FileUploaderComponent, NgbTimepickerModule, ReactiveFormsModule, NumericDirective, NgSelectModule, CommonModule],
  templateUrl: './add-parking.component.html',
  styleUrl: './add-parking.component.css',
  providers: [NgbTimepickerConfig],
  encapsulation: ViewEncapsulation.None // Disables view encapsulation

})
export class AddParkingComponent implements OnInit {
  @ViewChild('addressInput', { static: true }) addressInput!: ElementRef;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  public photos: any = [];
  public MAX_UPLODS: any;
  @ViewChild('file_uploader') fileUploader!: FileUploaderComponent;
  @Input() parkingData:any
  @Output() onParkingCreate = new EventEmitter<any>(); // Declares an output property named 'dataEmitted'
  parkingForm = this.fb.group({
    id: [null],
    title: [null, Validators.required],
    parking_type_id: [null, Validators.required],
    state_id: [null, Validators.required],
    address: [null, Validators.required],
    city: [null, Validators.required],
    zip: [null, Validators.required],
    total_slot: [null, [Validators.required, Validators.min(1)]],
    per_hour_price: [null, [Validators.required, Validators.min(1)]],
    per_month_price: [null, [Validators.required, Validators.min(1)]],
    ev_charging_price: [null, Validators.required],
    min_booking_duration: [null, [Validators.required,Validators.min(30)]],
    is_ev_charing: ['1'],
    ev_charing_slot: [null, [Validators.required, Validators.min(1)]],
    lat: [null, Validators.required],
    lang: [null, Validators.required],
    twenty_four_service: ['1'],
    weekday_slot: ['1'],
    weekend_slot: ['1'],
    is_cc_tv: ['1'],
    start_time: [{ hour: 0, minute: 0 }],
    end_time: [{ hour: 23, minute: 59 }],
    files: [[],Validators.required],
    photos: [[]],
    deleted_files: [],



  },
    { validators: [atLeastOneSlotValidator, endTimeAfterStartTimeValidator(),divisibleBy30Validator('min_booking_duration'),maxFieldValidator('total_slot', 'ev_charing_slot')] }

  );
  submitting = false;
  states$: Observable<any[]> = of([]); // <-- initialize to empty array observable
  parking_types$: Observable<any[]> = of([]); // <-- initialize to empty array observable

  constructor(config: NgbTimepickerConfig) {
    // customize default values of ratings used by this component tree
    config.seconds = false;
    config.spinners = false;

  }
  ngOnInit() {
    const interval = setInterval(() => {
      if ((window as any).google && (window as any).google.maps) {
        clearInterval(interval);
        this.initAutocomplete();
      }
    }, 300);
    if (this.commonService.isBrowser()) {
      this.fetchAllStates();
      this.fetchAllParkingTypes();
      if(this.parkingData)
      {
        this.parkingForm.patchValue(this.parkingData);
        this.parkingForm.patchValue({photos:this.parkingData.photos.toString()});
        this.parkingForm.get('files')?.clearValidators();
        this.parkingForm.get('files')?.updateValueAndValidity();

      }

    }
    this.parkingForm.get('twenty_four_service')?.valueChanges.subscribe(resp => {
      if (resp) {
        this.parkingForm.get('start_time')?.addValidators(Validators.required);
        this.parkingForm.get('end_time')?.addValidators(Validators.required);

      }
      else {
        this.parkingForm.get('start_time')?.clearValidators();
        this.parkingForm.get('end_time')?.clearValidators();
        this.parkingForm.patchValue({ start_time: { hour: 0, minute: 0 }, end_time: { hour: 23, minute: 59 } });

      }
      this.parkingForm.get('start_time')?.updateValueAndValidity();
      this.parkingForm.get('end_time')?.updateValueAndValidity();

    });
    this.parkingForm.get('is_ev_charing')?.valueChanges.subscribe((resp: any) => {
      if (resp) {
        this.parkingForm.get('ev_charing_slot')?.addValidators([Validators.required, Validators.min(1)]);
        this.parkingForm.get('ev_charging_price')?.addValidators([Validators.required, Validators.min(1)]);

      }
      else {
        this.parkingForm.get('ev_charing_slot')?.clearValidators();
        this.parkingForm.get('ev_charging_price')?.clearValidators();
        this.parkingForm.patchValue({ ev_charing_slot: null, ev_charging_price: null });

      }
      this.parkingForm.get('ev_charing_slot')?.updateValueAndValidity();
      this.parkingForm.get('ev_charging_price')?.updateValueAndValidity();

    })
    this.MAX_UPLODS = maxUploads() - this.photos.length;

  }
  initAutocomplete() {
    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      {
        types: ['geocode'], // Or 'address'
        fields: ['formatted_address', 'geometry', 'address_components'],
        componentRestrictions: { country: 'us' }, // Optional: Restrict to India
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        const lat = place.geometry.location.lat();
        const lang = place.geometry.location.lng();
        const city = place.address_components.find((c: any) => c.types.includes('locality'))?.long_name
          || place.address_components.find((c: any) => c.types.includes('sublocality'))?.long_name
          || '';

        const zip = place.address_components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';
        const address=place.formatted_address;
        this.parkingForm.patchValue({ lat, lang, city, zip,address});


      }
    });
  }
  fetchAllStates() {
    return this.states$ = this.commonService.getData("master/state").pipe(
      map((res: any) => res.status === 'success' ? res.data : [])
    );
  }
  fetchAllParkingTypes() {
    return this.parking_types$ = this.commonService.getData("master/parking-type").pipe(
      map((res: any) => res.status === 'success' ? res.data : [])
    );
  }
  onSubmit() {
    this.submitting = true;

    if (this.parkingForm.invalid) {
      this.parkingForm.markAllAsTouched(); // 🔥 Show validation errors
      const firstInvalidControl: HTMLElement = document.querySelector(
      '.ng-invalid[formControlName]'
    ) as HTMLElement;

    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidControl.focus();
    }

      return;
    }
    let start_time: any;
    let end_time: any;

    if (!this.parkingForm.value?.twenty_four_service) {
      start_time = this.parkingForm.value?.start_time?.hour + ':' + this.parkingForm.value?.start_time?.minute;
      end_time = this.parkingForm.value?.end_time?.hour + ':' + this.parkingForm.value?.end_time?.minute;

    }
    else {
      start_time = null;
      end_time = null;
    }
    const {files}=this.parkingForm.value;
    of(this.parkingForm.value).pipe(
      exhaustMap(({  }) =>
        this.commonService.postFormData('parking-owner/parking-space/create', {...this.parkingForm.value,start_time, end_time,...{files:files}
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
        this.onParkingCreate.emit(res?.data);
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
    this.parkingForm.patchValue({deleted_files:deleted_files.toString()});

    if(photos.length<=0)
    {
      this.parkingForm.get('files')?.addValidators(Validators.required);
      this.parkingForm.get('files')?.updateValueAndValidity();

    }
  }



}
