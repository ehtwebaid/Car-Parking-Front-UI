import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment'
import { CommonService } from '../../../service/common.service';
@Component({
  selector: 'app-monthly-calendar',
  standalone: true,
  imports: [FullCalendarModule, ReactiveFormsModule, CommonModule],
  templateUrl: './monthly-calendar.component.html',
  styleUrl: './monthly-calendar.component.css'
})
export class MonthlyCalendarComponent {
  @Input() slotAvailabilityFilter: any = null;
  @Input() weekday: any;
  @Input() weekend: any;
  @Output() enableMonthlyBooking=new EventEmitter();
  disable_dates:any=[];
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  @ViewChild("calendar", { static: false }) calendarComponent!: FullCalendarComponent;
  calendarInfo: any = {};
  selectedDateEl: HTMLElement | null = null;

  monthlyBookingForm = this.fb.group({
    arrival_date: [null, Validators.required],
    departure_date: [null, Validators.required],
    weekday: [0],
    weekend: [0],
  });
  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: false,
    events: [],
    datesSet: (info: any) => this.onDatesSet(info),

    dateClick: (info: any) => {
    if(!this.slotAvailabilityFilter)
    {
      return;
    }
    const slotDeatil=  this.slotAvailabilityFilter?.slot;
    const arrival_date:any=moment(`${info?.dateStr} ${slotDeatil?.start_time}`, 'YYYY-MM-DD HH:mm');
    const departure_date:any=moment(`${info?.dateStr} ${slotDeatil?.end_time}`, 'YYYY-MM-DD HH:mm').add(30,'days');
    this.monthlyBookingForm.patchValue({arrival_date:arrival_date,departure_date:departure_date});
    if (this.selectedDateEl) {
      this.selectedDateEl.style.backgroundColor = '';
      this.selectedDateEl.style.color = '';
    }

    // Highlight the clicked date cell
    info.dayEl.style.backgroundColor = '#EAE5CA';
    info.dayEl.style.color = '#fff';

    // Store for next click
    this.selectedDateEl = info.dayEl;
    },
    validRange: {
    start: moment().format('YYYY-MM-DD') // disables past days completely
  },
  };
  calHeading: any = null;
  constructor(){
  this.monthlyBookingForm.valueChanges.subscribe(res=>{
  if(!this.monthlyBookingForm.invalid)
  {
    this.enableMonthlyBooking.emit(true);
    const bookingData:any={...this.monthlyBookingForm.value,...{slot:this.slotAvailabilityFilter?.slot}};
    this.commonService.monthlyBookingData.next(bookingData);
  }
  })
  }
  previousBooking() {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.prev();

  }
  nextBooking() {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.next();
  }
  async onDatesSet(info: any) {
    this.calendarInfo = info;

    const visibleStart = moment.utc(info.view.currentStart).local();
    const monthStart = visibleStart.clone().startOf('month');
    const monthEnd = visibleStart.clone().endOf('month');
    this.calHeading = this.calendarComponent.getApi().getCurrentData().viewTitle;
    const dateFilter: any = { end_date: moment(monthEnd).format('YYYY-MM-DD'), id: this.slotAvailabilityFilter?.slot?.id };
    const currentDate = moment();
    if (currentDate > monthStart) {
      dateFilter.start_date = currentDate.format('YYYY-MM-DD');
    }
    else {
      dateFilter.start_date = moment(monthStart).format('YYYY-MM-DD');
    }
    if (!this.slotAvailabilityFilter?.slot?.id) {
      return;
    }
    this.disable_dates=await this.fetchDisabledDates(dateFilter);
    this.updateDayCellStyles();
  }
  ngOnChanges(changes: SimpleChanges): void {

    // 👇 Safely pass same shape as datesSet callback
    if (changes['weekday']) {
      this.monthlyBookingForm.patchValue({ weekday: this.weekday });
    }
    if (changes['weekend']) {
      this.monthlyBookingForm.patchValue({ weekend: this.weekend });
    }
    if (this.slotAvailabilityFilter?.slot?.id) {
      this.onDatesSet(this.calendarInfo);

    }
  }
  setCalendarHeight() {
    this.calendarComponent.getApi().updateSize();
  }
  async fetchDisabledDates(dateFilter: any) {

      return new Promise( (resolve, reject) => {
        let { weekday, weekend } = this.monthlyBookingForm.value;
        weekday = weekday ? 1 : 0;
        weekend = weekend ? 1 : 0;
         this.commonService.postJsonData("user/available-monthly-booking", { ...dateFilter, weekday, weekend }).subscribe(resp => {
          if (resp.status == 'success') {
            resolve(resp?.data);  // success
          }
            else{
           reject([]); // failure
        }
      });

      });
  }
  updateDayCellStyles() {
  const dayEls = document.querySelectorAll('.fc-daygrid-day');
   dayEls.forEach((el: any) => {
    const dateStr = el.getAttribute('data-date');
    if (this.disable_dates.includes(dateStr)) {
      el.style.pointerEvents = 'none';
      el.style.backgroundColor = '#ffe6e6';
      el.style.color = '#999';
    } else {
      el.style.pointerEvents = 'auto';
      el.style.backgroundColor = '';
      el.style.color = '';
    }
  });
}


}
