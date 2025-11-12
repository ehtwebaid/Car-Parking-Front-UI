import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { OrdinalPipe } from '../../../pipe/ordinal.pipe';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,OrdinalPipe],
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.css'
})
export class BookingSummaryComponent implements OnInit {
  private commonService = inject(CommonService);
  bookingData:any=null;
  @Input() bookingType:any;
  ngOnInit(): void {
  this.commonService.updateBookingData.subscribe(res=>{
  if(res)
  {
      this.bookingData= res;
      this.bookingData.start_date=moment(res?.start_date, "YYYY-MM-DD HH:mm:ss").toDate();
      this.bookingData.end_date=moment(res?.end_date, "YYYY-MM-DD HH:mm:ss").toDate();
      const start = moment(res?.start_date, "YYYY-MM-DD HH:mm:ss");
      const end = moment(res?.end_date, "YYYY-MM-DD HH:mm:ss");
      const duration = moment.duration(end.diff(start));
      this.bookingData.durations=duration.asHours();
  }

  });
   this.commonService.monthlyBookingData.subscribe((res:any)=>{
  if(res)
  {
      this.bookingData= res;
      this.bookingData.start_date=moment(res?.arrival_date, "YYYY-MM-DD HH:mm:ss").toDate();
      this.bookingData.end_date=moment(res?.departure_date, "YYYY-MM-DD HH:mm:ss").toDate();
      let access_hours:any;
      if(this.bookingData?.weekday && this.bookingData?.weekend)
      {
        access_hours='Monday - Sunday';
      }
      else if(this.bookingData?.weekday && !this.bookingData?.weekend)
      {
        access_hours='Monday - Friday';
      }
       else if(!this.bookingData?.weekday && this.bookingData?.weekend)
      {
        access_hours='Saturday - Sunday';
      }
      if(this.bookingData?.slot?.twenty_four_service)
      {
        access_hours+=' 24h';
      }
      else
      {
      const start = moment(this.bookingData?.slot?.start_time, "HH:mm:ss");
      const end = moment(this.bookingData?.slot?.end_time, "HH:mm:ss");
      const duration = moment.duration(end.diff(start));
      access_hours+=`${duration.asHours()}h`;
      }
      this.bookingData.access_hours=access_hours;
       this.bookingData.renewalDate=moment(res?.departure_date).format('DD');

  }

  });
  }


}
