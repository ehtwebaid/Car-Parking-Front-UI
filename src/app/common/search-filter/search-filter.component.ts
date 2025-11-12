import { Component, EventEmitter, inject, Input, input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../service/common.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.css'
})
export class SearchFilterComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private commonService = inject(CommonService);
  parking_types$: Observable<any[]> = of([]); // <-- initialize to empty array observable
  @Output() onSearchFilter = new EventEmitter<any>(); // Declares an output property named 'dataEmitted'
  @Input() is_ev_charing:any;

  lower: any = 10;
  upper: any = 1000;
  searchForm = this.fb.group({
    lower: [this.lower],
    upper: [this.upper],
    parking_type_id: [[]],
    is_ev_charing: [0],
    twenty_four_service: [0],
    weekday_slot: [0],
    weekend_slot: [0],
    is_cc_tv: [0],
  },


  );
  ngOnInit(): void {
    this.fetchAllParkingTypes();
    this.searchForm.valueChanges
      .pipe(debounceTime(300)) // wait 300ms after last change
      .subscribe(formValue => {
        this.onSearchFilter.emit(formValue)
      });
      setTimeout(()=>{
      this.searchForm.patchValue({is_ev_charing:this.is_ev_charing});
      })
  }
  fetchAllParkingTypes() {
    return this.parking_types$ = this.commonService.getData("master/parking-type").pipe(
      map((res: any) => res.status === 'success' ? res.data : [])
    );
  }
  setParkingType(ev: any) {
    let selected: any = this.searchForm.value.parking_type_id || [];
    if (ev.target.checked) {
      selected = [...selected, ev.target.value];
    }
    else {
      selected = selected.filter((v: any) => v !== ev.target.value);

    }
    this.searchForm.patchValue({ parking_type_id: selected });
  }
  resetFilter() {
    this.searchForm.reset({
      lower: this.lower,
      upper: this.upper,
      parking_type_id: null,
      twenty_four_service: 0,
      weekday_slot: 0,
      weekend_slot: 0,
      is_cc_tv: 0,
      is_ev_charing:this.is_ev_charing ?? 0

    });
  }


}
