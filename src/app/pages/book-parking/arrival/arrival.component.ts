import { Component, computed, EventEmitter, inject, Input, Output, signal, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { CommonService } from '../../../service/common.service';
import moment from 'moment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-arrival',
  standalone: true,
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule, ReactiveFormsModule, CommonModule],
  templateUrl: './arrival.component.html',
  styleUrl: './arrival.component.css',
  // encapsulation: ViewEncapsulation.None // Disables view encapsulation
})
export class ArrivalComponent {
  @Input() bookingHours: any = [];
  @Input() slotDetail: any = null;
  @Input() slotAvailabilityFilter: any = {};
  @Output() showSecondSlot=new EventEmitter();
  start_available_hours: any = [];
  diffDays:any=0;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  arrivalForm = this.fb.group({
    arrival_slot: [null, Validators.required],
    departure_slot: [null],
  });
  submitting = false;

  arrival_index: any;
  departure_index: any;
  slotFilterInfo = signal<any>({});
  hasSlotFilterInfo = computed(() => {
    const info = this.slotFilterInfo();
    return !!(info.start_date && info.end_date && info.slot);
  });
  constructor() {
  this.commonService.resetTime.subscribe(res=>{
  this.arrival_index=-1;
  this.departure_index=-1;
  this.arrivalForm.reset();
  });
   this.commonService.arrivalDeptRequired.subscribe((res)=>{
  if(res)
  {
    this.submitting=true;
    this.commonService.arrivalDeptRequired.next(false);
  }
  })

  }
  ngOnChanges(changes: SimpleChanges): void {
  if(changes['slotAvailabilityFilter']?.currentValue)
  {
    this.slotFilterInfo.update(current => ({
      ...current,
      ...changes['slotAvailabilityFilter']?.currentValue
    }));
    if(this.hasSlotFilterInfo())
    {
      this.arrivalForm.patchValue(this.slotFilterInfo());
      this.fetchAvailableSlot()
    }
  }
  }
  fetchAvailableSlot() {

      const{start_date,end_date,slot:{id}}=this.slotFilterInfo();
      const postData = { start_date: moment(start_date).format('YYYY-MM-DD'), end_date: moment(end_date).format('YYYY-MM-DD'), id };
      this.commonService.postJsonData("user/available-booking-hour", postData).subscribe(resp => {
        if (resp.status == 'success') {
          this.start_available_hours = resp.data?.start_available_hours;
          this.diffDays=resp.data?.diffDays;
          if(this.diffDays>0)
          {
            this.arrivalForm.get('departure_slot')?.clearValidators();
          }
          else
          {
            this.arrivalForm.get('departure_slot')?.addValidators([Validators.required]);
          }
          this.arrivalForm.get('departure_slot')?.updateValueAndValidity();
          this.showSecondSlot.emit({show:resp.data?.diffDays>0?true:false,end_available_hours:resp.data?.end_available_hours});
        }
      });


  }

  selectSlot(slot: any, index: number) {
    let arrival_dept: string | null = null;
    if(this.diffDays>0)
    {
      this.submitting=false;
      this.arrival_index = index;
      this.departure_index=this.bookingHours.length-1;
      this.arrivalForm.patchValue({arrival_slot:slot,departure_slot:this.bookingHours.at(-1)});
      this.commonService.setArrivalTime.next(slot);
      return;
    }
    // helper: check if all slots in range are available
    const isRangeAvailable = (startIndex: number, endIndex: number): boolean => {
      for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
        const hour = this.bookingHours[i];
        if (!this.start_available_hours.includes(hour)) {
          return false; // found disabled slot
        }
      }
      return true;
    };

    if (!this.arrivalForm.value.arrival_slot) {
      // set arrival first
      arrival_dept = "arrival_slot";
      this.arrival_index = index;
    }
    else if (!this.arrivalForm.value.departure_slot) {
      if (index < this.arrival_index) {
        // trying to select earlier slot as arrival
        if (!isRangeAvailable(index, this.arrival_index)) return; // block selection
        this.arrivalForm.patchValue({
          departure_slot: this.arrivalForm.value?.arrival_slot,
        });
        this.departure_index = this.arrival_index;
        this.arrival_index = index;
        arrival_dept = "arrival_slot";
      }
      else {
        // selecting departure
        if (!isRangeAvailable(this.arrival_index, index)) return; // block selection
        arrival_dept = "departure_slot";
        this.departure_index = index;
      }
    }
    else if (index > this.arrival_index && index < this.departure_index) {
      if (!isRangeAvailable(this.arrival_index, index)) return;
      arrival_dept = "arrival_slot";
      this.arrival_index = index;
    }
    else if (index < this.arrival_index) {
      if (!isRangeAvailable(index, this.departure_index ?? index)) return;
      arrival_dept = "arrival_slot";
      this.arrival_index = index;
    }
    else if (index > this.departure_index) {
      if (!isRangeAvailable(this.arrival_index, index)) return;
      arrival_dept = "departure_slot";
      this.departure_index = index;
    }
    if (arrival_dept) {
      if(this.bookingHours.length==24 && arrival_dept=='arrival_slot' && index==23)
      {
        const departure_slot:any='23:59:59';
        this.arrivalForm.patchValue({departure_slot:departure_slot});
      }
      this.arrivalForm.patchValue({ [arrival_dept]: slot });
      if(!this.arrivalForm.invalid)
      {
        this.submitting=false;
        const{arrival_slot,departure_slot}=this.arrivalForm.value;
        this.commonService.setArrivalTime.next(arrival_slot);
        this.commonService.setDepartureTime.next(departure_slot);
        return;

      }

    }
  }


}
