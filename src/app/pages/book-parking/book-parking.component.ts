import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { NgbAccordionDirective, NgbAccordionModule, NgbCarouselConfig, NgbCarouselModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap'
import { ParkingDetailsComponent } from '../parking-details/parking-details.component'
import { CommonService } from '../../service/common.service'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { GoogleMapsModule, MapInfoWindow } from '@angular/google-maps'
import { catchError, exhaustMap, of } from 'rxjs'
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker'
import { getToken } from '../../../global/app.global'
import { ArrivalComponent } from './arrival/arrival.component'
import { DepartureComponent } from './departure/departure.component'
import { SlotListsComponent } from './slot-lists/slot-lists.component'
import { BookingSummaryComponent } from "./booking-summary/booking-summary.component";
import { PaymentSummaryComponent } from "./payment-summary/payment-summary.component";
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MonthlyCalendarComponent } from "./monthly-calendar/monthly-calendar.component";
@Component({
  selector: 'app-book-parking',
  standalone: true,
  imports: [NgbCarouselModule, NgbAccordionModule, NgbNavModule, ParkingDetailsComponent, CommonModule, GoogleMapsModule,
    ArrivalComponent, DepartureComponent, SlotListsComponent,
    BookingSummaryComponent, PaymentSummaryComponent, FullCalendarModule, MonthlyCalendarComponent],
  templateUrl: './book-parking.component.html',
  styleUrl: './book-parking.component.css',
  encapsulation: ViewEncapsulation.None // Disables view encapsulation

})
export class BookParkingComponent implements OnInit {

  public commonService = inject(CommonService)
  route: any = inject(ActivatedRoute)
  active: any = 1
  parkingDetail: any = null
  zoom: number = 15
  center!: google.maps.LatLngLiteral
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild('monthlyCalendar', { static: false }) monthlyCalendar!: MonthlyCalendarComponent;
  @ViewChild('accordion') accordion!: NgbAccordionDirective
  marker: any
  slotDetail: any = null;
  @ViewChild('arrival') arrival!: ArrivalComponent;
  showSecondSlot: boolean = false;
  bookingInfo = signal<any>({});
  hasBookingInfo = computed(() => {
    const info = this.bookingInfo();
    if (!info) {
      return false;
    }
    return !!(info.start_date && info.end_date && info.slot);
  });
  end_available_hours: any = [];
  slotAvailabilityFilter: any = null;
  weekday: boolean = false;
  weekend: boolean = false;
  disableMonthlyBooking: boolean = true;
  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')
    this.fetchParkingDetail(slug);
    this.commonService.updateBookingData.subscribe(res => {
      this.updateBookingInfo(res);
    })
  }
  fetchParkingDetail(slug: any) {
    this.commonService.postJsonData("user/parking/view", { slug: slug }).subscribe(resp => {
      if (resp.status == 'success') {
        this.parkingDetail = resp.data
        this.weekday = this.parkingDetail?.parkingslots[0]?.weekday;
        this.weekend = this.parkingDetail?.parkingslots[0]?.weekend;
        this.center = { lat: +this.parkingDetail?.lat, lng: +this.parkingDetail?.lang }
        this.marker = {
          position: { lat: +this.parkingDetail?.lat, lng: +this.parkingDetail?.lang },
          title: this.parkingDetail?.title,
          image: this.parkingDetail.photos[0]
        }
      }
    })
  }
  openInfoWindow(marker: any) {
    this.infoWindow.open(marker) // opens the window
  }


  setTimeData(ev: any) {
    this.weekday = ev?.weekday;
    this.weekend = ev?.weekend;
    this.slotAvailabilityFilter = { ...this.slotAvailabilityFilter, ...{ slot: ev } }

  }
  setDateRange(ev: any) {
    const { start_date, end_date } = ev;
    this.slotAvailabilityFilter = { ...this.slotAvailabilityFilter, start_date, end_date }

  }

  updateBookingInfo(bookingData: any = {}) {
    this.bookingInfo.set(bookingData);
  }
  setSecondSlot(ev: any) {
    this.showSecondSlot = ev?.show;
    this.end_available_hours = ev?.end_available_hours;
  }
  onPanelExpanded(panelId: string) {
    console.log(`Panel with ID "${panelId}" was expanded.`);
    this.monthlyCalendar.setCalendarHeight();

  }
  onTabChange(newTabId: number) {
    this.slotAvailabilityFilter = null;
    this.updateBookingInfo();
    this.showSecondSlot = false;
    this.end_available_hours=[];
    if (newTabId == 2) {
      setTimeout(() => {
        this.monthlyCalendar.setCalendarHeight();

      }, 800);
    }
  }

  enableMonthlyBooking() {
    this.disableMonthlyBooking = false;
    this.accordion.toggle('payment')

  }


}
