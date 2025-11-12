import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../service/common.service';
import { passwordMatchValidator, requiredNoWhitespace } from '../../../global/app.global';
import { catchError, exhaustMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  passwordForm = this.fb.group({
    password: [null, [requiredNoWhitespace, Validators.minLength(6)]],
    confirm_password: ['', [requiredNoWhitespace, Validators.minLength(6)]],
  }, {
    validators: passwordMatchValidator('password', 'confirm_password')
  }

  );
  submitting = false;
  onSubmit() {
    this.submitting = true;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched(); // 🔥 Show validation errors
      return;
    }
    of(this.passwordForm.value).pipe(
      exhaustMap(({ }) =>
        this.commonService.postFormData('parking-owner/change-password', { ...this.passwordForm.value }).pipe(

          catchError((err) => {
            this.commonService.showError(err);

            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      this.submitting = false;
      if (this.commonService.isBrowser()) {
        if (res.status == 'success') {

          this.commonService.showSuccess(res.message, "Password");
        }

      }

    });
  }
}
