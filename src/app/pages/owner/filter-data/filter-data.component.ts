import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { CommonService } from '../../../service/common.service';
import { map, Observable, of } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import moment from 'moment';

@Component({
  selector: 'app-filter-data',
  standalone: true,
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule, ReactiveFormsModule, CommonModule,NgSelectModule],
  templateUrl: './filter-data.component.html',
  styleUrl: './filter-data.component.css'
})
export class FilterDataComponent implements OnInit {

  private fb = inject(FormBuilder);
  public commonService = inject(CommonService);
  vehicle_types$: Observable<any> = of([]);
  slot_masters$: Observable<any> = of([]);
  @Input() showSlot:boolean=true;
  @Output() changeFilter=new EventEmitter<any>();
  searchForm = this.fb.group({
    date_range: [null],
    car_type: [null],
    slot_id:[null]
  });

  ngOnInit(): void {
    if (this.commonService.isBrowser()) {
      this.fetchVehicleTypes();
      if(this.showSlot)
      {
      this.fetchSlotMaster();

      }
    }
  }
  fetchVehicleTypes() {
    this.vehicle_types$ = this.commonService.getData("master/car-type")
      .pipe(map((res: any) => (res.status === 'success' ? res.data : [])));
  }
   fetchSlotMaster() {
    this.slot_masters$ = this.commonService.postJsonData("parking-owner/parking-space/slot-master",{})
      .pipe(map((res: any) => (res.status === 'success' ? res.data : [])));
  }
  groupByFn = (item:any) => item.parking_space?.title;
  applyFilter()
  {
    let filter_data:any;
    const{date_range,car_type,slot_id}=this.searchForm.value;
    let [start_date, end_date] = [...(date_range ?? [])];
    filter_data={car_type,slot_id};
    if(start_date && end_date)
    {
      filter_data['start_date']=moment(start_date).format('YYYY-MM-DD');
      filter_data['end_date']=moment(end_date).format('YYYY-MM-DD');
    }
    this.changeFilter.emit(filter_data);
  }
  clearFilter()
  {
    this.searchForm.reset();
    this.changeFilter.emit({});

  }
    closeCalander(ev:any)
  {
    console.log(ev);
  }
}
