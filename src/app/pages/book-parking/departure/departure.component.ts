import { Component, inject, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { CommonService } from '../../../service/common.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departure',
  standalone: true,
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule,CommonModule,ReactiveFormsModule],
  templateUrl: './departure.component.html',
  styleUrl: './departure.component.css'
})
export class DepartureComponent {
private fb = inject(FormBuilder);
private commonService = inject(CommonService);
@Input() bookingHours:any=[];
@Input() end_available_hours:any=[];
arrival_index: any;
departure_index: any;
submitting:boolean=false;
constructor(){
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
arrivalForm = this.fb.group({
departure_slot: [null,Validators.required],
});
selectSlot(slot: any, index: number) {
this.submitting=false;
this.departure_index=  index;
this.arrival_index=0;
this.arrivalForm.patchValue({departure_slot:slot});
this.commonService.setDepartureTime.next(slot);
}
}
