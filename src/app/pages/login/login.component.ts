import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject, viewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { exhaustMap, tap, catchError, of } from 'rxjs';
import { CommonService } from '../../service/common.service';
import { setuserInfo, getuserInfo, setToken, getToken, setParkingSpaceID } from '../../../global/app.global';
import { RouterLink } from '@angular/router';
import { OtpVerficationComponent } from '../otp-verfication/otp-verfication.component';
import { ForgotPasswordComponent } from "../forgot-password/forgot-password.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, OtpVerficationComponent, ForgotPasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  public otpInfo: any;
  public error_type: any = null;
  @ViewChild('pwd', { static: false }) pwd!: ElementRef;
  @Input()redirectDashboard:boolean=true;
  @Output() loginSuccess=new EventEmitter();
  displayLoginBlock:boolean=true;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  submitting = false;
  onSubmit() {
    this.submitting = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // 🔥 Show validation errors
      return;
    }

    of(this.loginForm.value).pipe(
      exhaustMap(({ email, password }) =>
        this.commonService.postJsonData('auth/login', { email, password }).pipe(

          catchError((err) => {
            this.commonService.showError('Login failed');

            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      this.submitting = false;
      if (this.commonService.isBrowser()) {
        if (res.status == 'success') {
          setuserInfo(res.data.user);
          setToken(res.data.token);
          setParkingSpaceID(res.data.user.parking_space);
          this.commonService.showSuccess(res.message, "Signup");
          this.commonService.setUserInfo();
          if (this.redirectDashboard === undefined || this.redirectDashboard === null) {
            this.redirectDashboard = true;
          }
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
        else if (res.status == 'error' && res?.error_type == 'email_not_validated') {
          this.error_type = 'email_not_validated';
          this.otpInfo = { user_id: res.data.id, otp_type: 'E' }
        }

      }

    });
  }
  changeInputType() {
    if (this.pwd && this.pwd.nativeElement) {
    this.pwd.nativeElement.type = this.pwd.nativeElement.type=='password'?'text':'password'; // Change the input type to 'password'

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
  showForgetPassword()
  {
    this.displayLoginBlock=false;
  }
  displayLogin(ev:any)
  {
    this.displayLoginBlock=true;
    this.redirectDashboard=ev;
  }
}
