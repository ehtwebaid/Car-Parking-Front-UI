import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, inject, viewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { exhaustMap, tap, catchError, of } from 'rxjs';
import { CommonService } from '../../service/common.service';
import { setuserInfo, getuserInfo, setToken, getToken, setParkingSpaceID } from '../../../global/app.global';
import { RouterLink } from '@angular/router';
import { ResetPasswordComponent } from "../reset-password/reset-password.component";
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ResetPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
 private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  public otpInfo: any;
  @Output() displayLogin=new EventEmitter();
  @Input()redirectDashboard:any;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  submitting = false;
  displayEmail:boolean=true;
  user_id:any;
  onSubmit() {
    this.submitting = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // 🔥 Show validation errors
      return;
    }

    of(this.loginForm.value).pipe(
      exhaustMap(({ email }) =>
        this.commonService.postJsonData('auth/forget-password', { email }).pipe(

          catchError((err) => {
            this.commonService.showError('Forget Password failed');

            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      this.submitting = false;
      if (this.commonService.isBrowser()) {
        if (res.status == 'success') {
          this.commonService.showSuccess(res.message, "Forget Password");
          this.displayEmail=false;
          this.user_id=res?.data?.id;

        }
      }
    });
  }

  displayLoginBlock()
  {
    this.displayLogin.emit(this.redirectDashboard);
  }
  pwdReset(ev:any)
  {
     this.displayLogin.emit(ev);
  }
  ngOnChanges(changes: SimpleChanges): void {

  }
}
