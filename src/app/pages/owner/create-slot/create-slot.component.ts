import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { catchError, exhaustMap, of } from 'rxjs';
import { NumericDirective } from '../../../directive/numeric.directive';

@Component({
  selector: 'app-create-slot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,NumericDirective],
  templateUrl: './create-slot.component.html',
  styleUrl: './create-slot.component.css'
})
export class CreateSlotComponent implements OnInit {

  @Input() is_ev_charing: any = false
  @Input() id: any;

  @Output() onSlotCreate = new EventEmitter<any>(); // Declares an output property named 'dataEmitted'
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  parkingForm = this.fb.group({
    id: [null],
    total_slot: [null, [Validators.required, Validators.min(1)]],
    ev_charging_price: [null],
    is_ev_charing: [0],
    ev_charing_slot: [0],
  }
  );
  submitting = false;
  ngOnInit(): void {
    this.parkingForm.patchValue({ id: this.id });
    this.parkingForm.get('is_ev_charing')?.valueChanges.subscribe((resp: any) => {
      if (resp) {
        this.parkingForm.get('ev_charing_slot')?.addValidators([Validators.required, Validators.min(1)]);
        if (!this.is_ev_charing) {
          this.parkingForm.get('ev_charging_price')?.addValidators([Validators.required, Validators.min(1)]);
        }

      }
      else {
        this.parkingForm.get('ev_charing_slot')?.clearValidators();
        this.parkingForm.get('ev_charging_price')?.clearValidators();
        this.parkingForm.patchValue({ ev_charing_slot: null, ev_charging_price: null });

      }



    });
  }
  onSubmit() {
    this.submitting = true;
    if (this.parkingForm.invalid) {
      this.parkingForm.markAllAsTouched(); // 🔥 Show validation errors
      return;
    }

    of(this.parkingForm.value).pipe(
      exhaustMap(({ }) =>
        this.commonService.postFormData('parking-owner/parking-space/add-slot', {
          ...this.parkingForm.value
        }).pipe(

          catchError((err) => {
            return of(null);
          })
        )
      )
    ).subscribe((res) => {
      this.submitting = false;
      if (res.status == 'success') {
        this.commonService.showSuccess(res.message);
        this.onSlotCreate.emit(res?.data);
      }




    });

  }
}
