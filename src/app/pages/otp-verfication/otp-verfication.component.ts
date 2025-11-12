import { CommonService } from './../../service/common.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { setToken, setuserInfo } from '../../../global/app.global';
import { catchError, exhaustMap, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp-verfication',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-verfication.component.html',
  styleUrl: './otp-verfication.component.css'
})
export class OtpVerficationComponent implements AfterViewInit {
  @Input() otpInfo: any;
  otpArray = Array(6).fill('');
  private commonService = inject(CommonService);
  private router = inject(Router);
  @ViewChildren('otpInput',) otpInputs!: QueryList<ElementRef>;
  @Input() redirectDashboard:any;
  @Output() loginSuccess=new EventEmitter();

  ngAfterViewInit() {
    // Auto-focus on first input after view initializes
    if (this.otpInputs?.first?.nativeElement) {
      this.otpInputs.first.nativeElement.focus();

    }
  }

  onInput(event: any, index: number) {
    const input = event.target.value;
    if (input.length === 1 && index < this.otpArray.length - 1) {
      // Move to next input
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
      this.otpInputs.toArray()[index + 1].nativeElement.select();
      this.isOtpComplete();

    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const inputElement = this.otpInputs.toArray()[index].nativeElement;
    if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && index > 0) {
      // Move to previous input
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
      this.otpInputs.toArray()[index - 1].nativeElement.select();
    }
    if ((event.key === 'ArrowRight') && index < this.otpArray.length - 1) {
      // Move to previous input
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
      this.otpInputs.toArray()[index + 1].nativeElement.select();
    }
    this.isOtpComplete();

  }
  isOtpComplete(): boolean {

    return this.getOtpValue().every(digit => digit && digit.trim() !== '');
  }
  getOtpValue() {

    return this.otpInputs.toArray().map(input => input.nativeElement.value) // get value of each input

  }
  verifyOTP() {
    if (!this.isOtpComplete()) {

      return;
    }
    const otp = this.getOtpValue().join("");
    of({ ...this.otpInfo, otp }).pipe(
      exhaustMap(({ email, password }) =>
        this.commonService.postJsonData('auth/verify-otp', { ...this.otpInfo, otp }).pipe(

          catchError((err) => {
            this.commonService.showError('OTP verification Failed');

            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      if (this.commonService.isBrowser()) {
        if (res.status == 'success') {
          setuserInfo(res.data.user);
          setToken(res.data.token);
          this.commonService.showSuccess(res.message, "Verify OTP");
          this.commonService.setUserInfo();
          if(!this.redirectDashboard)
          {
            this.loginSuccess.emit(true);
            return;
          }
          if (res.data.user?.role == 'O') {
            this.router.navigateByUrl("parking-owner/dashboard");
          }
          else if(res.data.user?.role == 'U')
          {
            this.router.navigateByUrl("customer/dashboard");
          }
        }


      }

    });

  }
  resendOTP() {

    of({ ...this.otpInfo }).pipe(
      exhaustMap(({ email, password }) =>
        this.commonService.postJsonData('auth/resend-otp', { ...this.otpInfo }).pipe(

          catchError((err) => {
            this.commonService.showError('Resend OTP Failed');

            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      if (this.commonService.isBrowser()) {
        if (res.status == 'success') {

          this.commonService.showSuccess(res.message, "Resend OTP");

        }


      }

    });

  }
}
