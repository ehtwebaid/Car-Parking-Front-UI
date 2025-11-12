import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, inject, viewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { exhaustMap, tap, catchError, of } from 'rxjs';
import { CommonService } from '../../service/common.service';
import { setuserInfo, getuserInfo, setToken, getToken, setParkingSpaceID, passwordMatchValidator } from '../../../global/app.global';
import { RouterLink } from '@angular/router';
import { NumericDirective } from "../../directive/numeric.directive";
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, NumericDirective],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
 private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  public otpInfo: any;
  public error_type: any = null;
  @ViewChild('pwd', { static: false }) pwd!: ElementRef;
  @ViewChild('confirm_pwd', { static: false }) confirm_pwd!: ElementRef;
  @Input()redirectDashboard:any;
  @Input()user_id:any;
  @Output() onPwdReset=new EventEmitter();
  loginForm = this.fb.group({
    otp: [null, [Validators.required, Validators.maxLength(6),Validators.minLength(6)]],
    user_id: [null, Validators.required],
    password: ['', [Validators.required,Validators.minLength(6)]],
    confirm_password: ['', [Validators.required,Validators.minLength(6)]],
    otp_type:['F']
  },{validators: passwordMatchValidator('password', 'confirm_password')});
  submitting = false;
  onSubmit() {
    this.submitting = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // 🔥 Show validation errors
      return;
    }
    const otp_type='F';
    of(this.loginForm.value).pipe(
      exhaustMap(({ otp, user_id,password,confirm_password,otp_type}) =>
        this.commonService.postJsonData('auth/reset-password', { otp, user_id,password,confirm_password,otp_type}).pipe(

          catchError((err) => {
            this.commonService.showError('Reset Password failed');
            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      this.submitting = false;
      if (this.commonService.isBrowser()) {
        if (res.status == 'success') {

          this.commonService.showSuccess(res.message, "Reset Password");
          this.onPwdReset.emit(this.redirectDashboard);

        }


      }

    });
  }
  ngOnChanges(changes: SimpleChanges): void {
  this.loginForm.patchValue({user_id:this.user_id});

  }

  changeInputType() {
    if (this.pwd && this.pwd.nativeElement) {
    this.pwd.nativeElement.type = this.pwd.nativeElement.type=='password'?'text':'password'; // Change the input type to 'password'

    }
  }
   changeInputTypeConfirm() {
    if (this.confirm_pwd && this.confirm_pwd.nativeElement) {
    this.confirm_pwd.nativeElement.type = this.confirm_pwd.nativeElement.type=='password'?'text':'password'; // Change the input type to 'password'

    }
  }
  isPasswordHidden(): boolean {
    if (this.commonService.isBrowser()) {
      if(this.pwd?.nativeElement)
      {
      return this.pwd?.nativeElement?.type === 'password';

      }

    }
    return true;
  }
    isConfirmPasswordHidden(): boolean {
    if (this.commonService.isBrowser()) {
      if(this.confirm_pwd?.nativeElement)
      {
      return this.confirm_pwd?.nativeElement?.type === 'password';

      }

    }
    return true;
  }
    resendOTP() {
    this.otpInfo={user_id:this.user_id,otp_type:'F'};
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
