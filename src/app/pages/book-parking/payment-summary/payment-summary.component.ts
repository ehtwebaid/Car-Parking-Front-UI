import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import moment from 'moment';
import { StripePaymentComponent } from '../../stripe-payment/stripe-payment.component';
import { LoginComponent } from '../../login/login.component';
import { getToken } from '../../../../global/app.global';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { catchError, exhaustMap, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-summary',
  standalone: true,
  imports: [CommonModule, StripePaymentComponent, LoginComponent, NgbModalModule],
  templateUrl: './payment-summary.component.html',
  styleUrl: './payment-summary.component.css',
})
export class PaymentSummaryComponent implements OnInit {
  private commonService = inject(CommonService);
  private router = inject(Router);
  bookingData: any = null;
  duration = signal(0);
  per_hour_price = signal(0);
  service_fee = signal(0);
  ev_charge_duration = signal(0);
  per_hour_ev_price = signal(0);
  monthly_price = signal(0);
  total = computed(() => {
    if(this.bookingType=='hourly')
    {
       return (
              this.duration() * this.per_hour_price() +
              this.service_fee() +
              this.ev_charge_duration() * this.per_hour_ev_price()
            );
    }
   return (
              this.monthly_price()  +
              this.service_fee() +
              this.ev_charge_duration() * this.per_hour_ev_price()
            );
  });
  @ViewChild('payment_modal') payment_modal!: TemplateRef<any>;
  @ViewChild('login_modal') login_modal!: TemplateRef<any>;
  paymentmodalRef: any;
  loginmodalRef: any;
  private modalService = inject(NgbModal)
  clientSecret!: string;
  @Input() bookingType:any;
  @Input() slotAvailabilityFilter:any;
  ngOnInit(): void {
    this.commonService.updateBookingData.subscribe((res) => {
      if (res) {
        this.bookingData = res;
        const start = moment(res?.start_date, 'YYYY-MM-DD HH:mm:ss');
        const end = moment(res?.end_date, 'YYYY-MM-DD HH:mm:ss');
        const duration = moment.duration(end.diff(start));
        this.duration.set(duration.asHours());
        this.per_hour_price.set(this.bookingData?.slot?.per_hour_price);
        this.per_hour_ev_price.set(this.bookingData?.slot?.ev_charging_price);
        this.ev_charge_duration.set(this.bookingData?.ev_charing_duration);

      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.monthly_price.set(this.slotAvailabilityFilter?.slot?.per_month_price);

  }
  openPaymentModal() {
    const token = getToken();
    if (!token) {
      this.openLoginModal();
      return;
    }
    if (this.loginmodalRef) {
      this.commonService.refetchToken.next(token);
      this.loginmodalRef.close();
    }

    this.paymentmodalRef = this.modalService.open(this.payment_modal, { scrollable: true, size: 'lg', backdrop: 'static', keyboard: false })// Disable outside click

  }
  openLoginModal() {
    this.loginmodalRef = this.modalService.open(this.login_modal, { scrollable: true, size: 'lg', backdrop: 'static', keyboard: false })// Disable outside click
  }
  submitBookingData(token: any) {
    let { slot: { id }, car_type, is_ev_charing, ev_charing_duration, vehicle_number, start_date, end_date,booking_type,access_hours } = this.bookingData;
    start_date = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    end_date = moment(end_date).format('YYYY-MM-DD HH:mm:ss');
    const bookingData = { id, car_type, is_ev_charing, ev_charing_duration, vehicle_number, start_date, end_date, token,booking_type,access_hours };
    of(bookingData).pipe(
      exhaustMap(({ ...bookingData }) =>
        this.commonService.postJsonData('user/create-boking', { ...bookingData }).pipe(
          catchError((err) => {
            this.commonService.showError('Payment Failed');

            return of(null);
          })
        )
      )
    ).subscribe({
      next: (res) => {
        if (this.commonService.isBrowser()) {
          if (res?.status === 'success') {
            this.commonService.showSuccess(res.message, "Payment");
            this.paymentmodalRef.close();
            this.router.navigateByUrl("customer/dashboard");
          }
        }
      },
      error: (err) => {
        this.commonService.showError('Unexpected Error');
      },
      complete: () => {
        this.commonService.enablePymentButton.next(true)
      }
    });

  }
}
