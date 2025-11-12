import { CommonService } from './../../../service/common.service';
import { CommonOptions } from 'node:child_process';
import { Component, EventEmitter, inject, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';

@Component({
  selector: 'app-booking-calender',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './booking-calender.component.html',
  styleUrl: './booking-calender.component.css',

})
export class BookingCalenderComponent {
  @ViewChild("calendar", { static: false }) calendarComponent!: FullCalendarComponent;
  @Output() changeCalHeading=new EventEmitter();
  @Output() viewBooking=new EventEmitter();
  commonService=inject(CommonService);
  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin],
    datesSet: (info: any) => this.onDatesSet(info),
    initialView: 'dayGridMonth',
    headerToolbar: false,
    events: [],
    eventClick: (info: any) => {
     this.viewBooking.emit(info.event.id);
    }
  };
  async onDatesSet(info: any) {
    const visibleStart = moment.utc(info.view.currentStart).local();
    const monthStart = visibleStart.clone().startOf('month');
    const monthEnd = visibleStart.clone().endOf('month');

    console.log('Visible:', visibleStart.format());
    console.log('Month Start:', monthStart.format());
    console.log('Month End:', monthEnd.format());
    // Get actual month end (last day of the month)
    const calendarApi = this.calendarComponent.getApi();
    const calendarData:any=await this.calenderData({"start_date":monthStart.format('YYYY-MM-DD'),"end_date":monthEnd.format('YYYY-MM-DD')});
    calendarApi.removeAllEventSources();
    calendarApi.addEventSource(calendarData); //obligatory
    calendarApi.refetchEvents();
    this.changeCalHeading.emit(calendarApi.getCurrentData().viewTitle);

  }
  previousBooking()
  {
    const calendarApi = this.calendarComponent.getApi();
     calendarApi.prev();

  }
   nextBooking()
  {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.next();
  }
  async calenderData(filter:any)
  {
      return new Promise( (resolve, reject) => {
       this.commonService.postFormData("parking-owner/calendar-view",filter).subscribe(resp=>{
        if(resp.status=='success')
        {
           resolve(resp?.data);  // success
        }
        else{
           reject([]); // failure
        }
      })

      });
  }


}
