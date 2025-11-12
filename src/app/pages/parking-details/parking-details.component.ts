import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../service/common.service';
import { Router } from '@angular/router';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import { map, Observable, of } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { NumericDirective } from '../../directive/numeric.directive';
import moment from 'moment';
import { CustomDateStrPipe } from '../../pipe/custom-date-str.pipe';

@Component({
  selector: 'app-parking-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgSelectModule,
    NumericDirective,
    CustomDateStrPipe,
  ],
  templateUrl: './parking-details.component.html',
  styleUrl: './parking-details.component.css',
})
export class ParkingDetailsComponent implements OnInit {
  @Input() parkingDetail: any = {};
  slotID: any = null;
  @Output() onSelectSlot = new EventEmitter();
  @Output() changeDateRange = new EventEmitter();
  @Input() slotAvailabilityFilter: any = null;
  @Input() bookingType: any = 'hourly';
  selectMode: any = 'range';
  monthlyBookingData: any = null;
  vehicle_types$: Observable<any> = of([]);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  arrivalForm = this.fb.group({
    slot: this.fb.group({
      id: [null, Validators.required],
      slot_code: [null, Validators.required],
    }),
    date_range: [null],
    vehicle_number: [null, Validators.required],
    car_type: [null, Validators.required],
    start_date: [null, Validators.required],
    end_date: [null, Validators.required],
    ev_charing_duration: [null],
    is_ev_charing: [0],
  });
  submitting = false;
  ngOnInit(): void {
    this.fetchVehicleTypes();
    this.commonService.setArrivalTime.subscribe((resp) => {
      if (resp) {
        const date = moment(this.slotAvailabilityFilter?.start_date).format(
          'YYYY-MM-DD'
        );
        const time = resp;
        const dateTime = moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm A');
        const start_date: any = dateTime.format('YYYY-MM-DD HH:mm:ss');
        this.arrivalForm.patchValue({ start_date: start_date });
      }
    });
    this.commonService.setDepartureTime.subscribe((resp) => {
      if (resp) {
        const date = moment(this.slotAvailabilityFilter?.end_date).format(
          'YYYY-MM-DD'
        );
        const time = resp;
        const dateTime = moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm A');
        const end_date: any = dateTime.format('YYYY-MM-DD HH:mm:ss');
        this.arrivalForm.patchValue({ end_date: end_date });
      }
    });
    this.commonService.monthlyBookingData.subscribe((resp: any) => {
      if (resp) {
        this.monthlyBookingData = resp;
        let access_hours: any;
        if (
          this.monthlyBookingData?.weekday &&
          this.monthlyBookingData?.weekend
        ) {
          access_hours = 'Monday - Sunday';
        } else if (
          this.monthlyBookingData?.weekday &&
          !this.monthlyBookingData?.weekend
        ) {
          access_hours = 'Monday - Friday';
        } else if (
          !this.monthlyBookingData?.weekday &&
          this.monthlyBookingData?.weekend
        ) {
          access_hours = 'Saturday - Sunday';
        }
        if (this.monthlyBookingData?.slot?.twenty_four_service) {
          access_hours += ' 24h';
        } else {
          const start = moment(
            this.monthlyBookingData?.slot?.start_time,
            'HH:mm:ss'
          );
          const end = moment(
            this.monthlyBookingData?.slot?.end_time,
            'HH:mm:ss'
          );
          const duration = moment.duration(end.diff(start));
          access_hours += `${duration.asHours()}h`;
        }
        this.monthlyBookingData.access_hours = access_hours;
        this.monthlyBookingData.renewalDate = moment(
          resp?.departure_date
        ).format('DD');
        this.arrivalForm.patchValue({
          start_date: resp?.arrival_date,
          end_date: resp?.departure_date,
        });
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.slotAvailabilityFilter) {
      const { slot } = this.slotAvailabilityFilter;
      if (slot) {
        this.arrivalForm.patchValue({
          start_date: null,
          end_date: null,
          slot: slot,
        });
        if (!slot?.is_ev_charing) {
          this.arrivalForm.patchValue({
            ev_charing_duration: null,
            is_ev_charing: 0,
          });
        }
        if (slot?.twenty_four_service) {
          this.selectMode = 'range';
        } else {
          this.selectMode = 'single';
        }
        this.arrivalForm.get('ev_charing_duration')?.clearValidators();
        this.arrivalForm.get('ev_charing_duration')?.updateValueAndValidity();
        this.commonService.updateBookingData.next(null);
        this.commonService.resetTime.next('Reset');
      }
    }
  }
  selectSlot(info: any) {
    this.slotID = info.id;
    this.onSelectSlot.emit({ id: info.id, code: info?.slot_code });
  }
  closeCalander(ev: any) {
    if (Array.isArray(ev)) {
      this.changeDateRange.emit({ start_date: ev[0], end_date: ev[1] });
      return;
    }
    this.changeDateRange.emit({ start_date: ev, end_date: ev });
  }
  setEVCharging(ev: any) {
    if (ev?.target.checked) {
      this.arrivalForm.patchValue({ is_ev_charing: 1 });
      this.arrivalForm
        .get('ev_charing_duration')
        ?.addValidators([Validators.required, Validators.min(1)]);
    } else {
      this.arrivalForm.patchValue({
        is_ev_charing: 0,
        ev_charing_duration: null,
      });
      this.arrivalForm.clearValidators();
      this.arrivalForm.get('ev_charing_duration')?.clearValidators();
    }
    this.arrivalForm.get('ev_charing_duration')?.updateValueAndValidity();
  }
  fetchVehicleTypes() {
    this.vehicle_types$ = this.commonService
      .getData('master/car-type')
      .pipe(map((res: any) => (res.status === 'success' ? res.data : [])));
  }

  submitData() {
    this.submitting = true;
    if (this.arrivalForm.invalid) {
      this.commonService.arrivalDeptRequired.next(true);
      return;
    }
    let bookingData:any={
      ...this.arrivalForm?.value,
      ...{ slot: this.slotAvailabilityFilter?.slot },
    }
    if(this.bookingType=='monthly')
    {
      const{weekday,weekend,access_hours,renewalDate}=this.monthlyBookingData;
      bookingData={...bookingData,weekday,weekend,access_hours,renewalDate};
    }
    this.commonService.updateBookingData.next({...bookingData,...{booking_type:this.bookingType}});
  }
  resetTime() {
    this.arrivalForm.patchValue({ start_date: null, end_date: null });
    this.commonService.updateBookingData.next(null);
    this.commonService.resetTime.next('Reset');
  }
}
