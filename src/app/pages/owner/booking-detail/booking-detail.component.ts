import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { map, Observable, of } from 'rxjs';
import { OrdinalPipe } from "../../../pipe/ordinal.pipe";

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, OrdinalPipe],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css'
})
export class BookingDetailComponent {
  @Input() id: any = null;
  public commonService = inject(CommonService);

  bookingDetail$: Observable<any> = of({});

  ngOnChanges(changes: SimpleChanges): void {

   this.fetchDetail();

  }
  fetchDetail() {
    this.bookingDetail$ = this.commonService.postJsonData("parking-owner/booking/view", { id: this.id }).pipe(map((res: any) => (res.status === 'success' ? res.data : {})));
  }
}
