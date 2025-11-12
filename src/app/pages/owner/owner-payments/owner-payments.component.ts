import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { TitleService } from '../../../service/title.service';
import { CommonService } from '../../../service/common.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map, Observable, of } from 'rxjs';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FilterDataComponent } from '../filter-data/filter-data.component';

@Component({
  selector: 'app-owner-payments',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgbPagination, FilterDataComponent],
  templateUrl: './owner-payments.component.html',
  styleUrl: './owner-payments.component.css',
  encapsulation: ViewEncapsulation.None
})
export class OwnerPaymentsComponent implements OnInit {

  public titleService = inject(TitleService);
  public commonService = inject(CommonService);
  private fb = inject(FormBuilder);
  payment$: Observable<any> = of({});
  revenues: any = [];
  page = 1;
  collectionSize = 0;
  totalItem: any = 0;
  per_page: any = 20;
  filterPayment: any = {}
  ngOnInit(): void {
    this.titleService.setPageTitle("My Payments");
    if (this.commonService.isBrowser()) {
      this.fetchPaymentSummary();
      this.fetchAllPayments();
    }
  }
  fetchPaymentSummary() {
    this.payment$ = this.commonService
      .postJsonData('parking-owner/dashboard-summary',{})
      .pipe(map((res: any) => (res.status === 'success' ? res.data : {})));
  }
  onPageChange(page: any) {
    this.page = page;
    this.fetchAllPayments();
  }

  fetchAllPayments() {
    const filterPayment={page: this.page,...this.filterPayment};
    this.commonService
      .postJsonData("parking-owner/booking/payments", filterPayment)
      .subscribe((res) => {
        if (res.status == "success") {
          this.revenues = res.data;
          this.collectionSize = res?.meta?.totalItems;
          this.totalItem = res?.meta?.totalItems;
        }
      });
  }
  changeFilter(ev: any) {
    this.page = 1;
    this.filterPayment = ev;
    this.fetchAllPayments();

  }
}
