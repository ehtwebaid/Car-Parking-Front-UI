import { Component, inject, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { TitleService } from '../../../service/title.service';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { CommonService } from '../../../service/common.service';
import { NgbModal, NgbModalModule, NgbPagination, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AddParkingComponent } from '../add-parking/add-parking.component';
import { ReactiveFormsModule } from '@angular/forms';
import { getParkingSpaceID, setParkingSpaceID } from '../../../../global/app.global';
import { CreateSlotComponent } from '../create-slot/create-slot.component';
import { FilterDataComponent } from '../filter-data/filter-data.component';
import { Observable, of } from 'rxjs';
import { BookingCalenderComponent } from '../booking-calender/booking-calender.component';
import { CommonModule } from '@angular/common';
import { BookingDetailComponent } from '../booking-detail/booking-detail.component';

@Component({
  selector: 'app-owner-booking',
  standalone: true,
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule, NgbModalModule, AddParkingComponent,
    CreateSlotComponent, FilterDataComponent, NgbPagination, BookingCalenderComponent, CommonModule, NgbTooltipModule,
    BookingDetailComponent],
  templateUrl: './owner-booking.component.html',
  styleUrl: './owner-booking.component.css',
  // encapsulation: ViewEncapsulation.None // Disables view encapsulation

})
export class OwnerBookingComponent implements OnInit {

  public titleService = inject(TitleService);
  public commonService = inject(CommonService);
  private modalService = inject(NgbModal);
  modalRef: any;
  modalRefBookng: any;
  slotmodalRef: any;
  @ViewChild('content') content!: TemplateRef<any>;
  @ViewChild('slot_content') slot_content!: TemplateRef<any>;
  @ViewChild('booking_detail') booking_detail!: TemplateRef<any>;
  @ViewChild('calendar',{static:false}) calendar!: BookingCalenderComponent;
  ParkingSpaceID: any;
  parkingData: any = null;
  calHeading:any=null;
  bookings: any = [];
  page = 1;
  collectionSize = 0;
  totalItem: any = 0;
  per_page: any = 20;
  filterPayment: any = {};
  bookingID:any=null;
  ngOnInit(): void {
    this.titleService.setPageTitle("View Bookings");
    if (this.commonService.isBrowser()) {
      this.ParkingSpaceID = getParkingSpaceID();
      if (this.ParkingSpaceID) {
        this.fechParkingDetail();
      }
      this.fetchAllBookings();
    }

  }
  openAddParking() {
    this.modalRef = this.modalService.open(this.content, { scrollable: true, size: 'xl', backdrop: 'static', keyboard: false });// Disable outside click
  }
  openAddSlot() {
    if (!this.ParkingSpaceID) {
      this.commonService.showError("Please Add Parking Space First");
      this.openAddParking();
      return;
    }
    this.slotmodalRef = this.modalService.open(this.slot_content, { scrollable: true, size: 'lg', backdrop: 'static', keyboard: false });// Disable outside click
  }
  closeModal(data: any) {
    this.modalRef.close();
    this.parkingData = data;
    setParkingSpaceID(this.parkingData.id);
    this.ParkingSpaceID = this.parkingData.id;

  }
  closelotModal(data: any) {
    this.slotmodalRef.close();
    this.ParkingSpaceID = this.parkingData.id;

  }
  fechParkingDetail() {
    this.commonService.postJsonData("parking-owner/parking-space/detail", { id: this.ParkingSpaceID }).subscribe(resp => {
      if (resp.status == 'success') {
        this.parkingData = resp.data;


      }
    });
  }
  fetchAllBookings() {
    const filterPayment = { page: this.page, ...this.filterPayment };
    this.commonService.postJsonData("parking-owner/bookings", filterPayment).subscribe(res => {
      if (res.status == "success") {
        this.bookings = res.data;
        this.collectionSize = res?.meta?.totalItems;
        this.totalItem = res?.meta?.totalItems;
      }
    })

  }
  onPageChange(page: any) {
    this.page = page;
    this.fetchAllBookings();
  }
  changeFilter(ev: any) {
    this.page = 1;
    this.filterPayment = ev;
    this.fetchAllBookings();

  }
  viewBooking(id:any)
  {
    this.bookingID=id;
    this.modalRefBookng = this.modalService.open(this.booking_detail, { scrollable: true, size: 'lg', backdrop: 'static', keyboard: false });// Disable outside click

  }
   previousBooking()
  {
    this.calendar.previousBooking();
  }
   nextBooking()
  {
    this.calendar.nextBooking();
  }
  changeCalHeading(heading:any)
  {
    this.calHeading=heading;
  }

}
