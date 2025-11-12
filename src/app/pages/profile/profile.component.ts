import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../service/common.service';
import { getuserInfo, requiredNoWhitespace, setuserInfo } from '../../../global/app.global';
import { catchError, exhaustMap, of } from 'rxjs';
import { NumericDirective } from '../../directive/numeric.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NumericDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

private fb = inject(FormBuilder);
private router = inject(Router);
private commonService = inject(CommonService);
profile_photo:any;
 profileForm = this.fb.group({

  files: [''],
  name: [null,requiredNoWhitespace],
  phone_no: [null, [requiredNoWhitespace, Validators.minLength(10), Validators.maxLength(10)]],
  email: ['', [requiredNoWhitespace, Validators.email]],
  address: ['',requiredNoWhitespace],

  });
  submitting = false;
  ngOnInit(): void {
  if(this.commonService.isBrowser())
  {
    this.profileForm.patchValue(getuserInfo());
    this.profile_photo=getuserInfo()?.profile_photo;
  }

  }
    onSubmit() {
      this.submitting = true;
      if (this.profileForm.invalid) {
        this.profileForm.markAllAsTouched(); // 🔥 Show validation errors
        return;
      }
      const {name,email,phone_no,address,files}=this.profileForm.value;
      of(this.profileForm.value).pipe(
        exhaustMap(({  }) =>
          this.commonService.postFormData('parking-owner/edit-profile', { name,email,phone_no,address,...{files:files} }).pipe(

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
             setuserInfo(res.data);
             this.commonService.setUserInfo();
             this.profile_photo=res.data?.profile_photo;
            this.commonService.showSuccess(res.message, "Profile");
          }

        }

      });
    }
    setFilePath(ev:any)
    {
      let files:any=[];
      files.push(ev.target.files[0])
      this.profileForm.patchValue({files:files});
    }
}
