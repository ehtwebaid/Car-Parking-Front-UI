import { TitleService } from './../../../service/title.service';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { BookingDetailComponent } from '../../owner/booking-detail/booking-detail.component';
import { FilterDataComponent } from '../../owner/filter-data/filter-data.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NgbPaginationModule,NgbTooltipModule,BookingDetailComponent,FilterDataComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  page:any=1;
  bookings:any=[];
  collectionSize:any=0;
  filterPayment:any={};
  totalItem:any=0;
  bookingID:any;
  per_page: any = 20;
  modalRefBookng: any;
  @ViewChild('booking_detail') booking_detail!: TemplateRef<any>;

  public commonService = inject(CommonService);
  private modalService = inject(NgbModal);
  private titleService = inject(TitleService);

   ngOnInit(): void {
   this.titleService.setPageTitle("Dashboard");
   if(this.commonService.isBrowser())
   {
   this.fetchAllBookings();
   }
  }
    fetchAllBookings() {
    const filterPayment = { page: this.page, ...this.filterPayment };
    this.commonService.postJsonData("user/dashboard", filterPayment).subscribe(res => {
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
}
