import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { CreateSlotComponent } from '../create-slot/create-slot.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-slot-setting',
  standalone: true,
  imports: [CommonModule, CreateSlotComponent],
  templateUrl: './slot-setting.component.html',
  styleUrl: './slot-setting.component.css'
})
export class SlotSettingComponent implements OnInit {

  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  slot_data: any = [];
  @Input() ParkingSpaceID: any;
  @Output() OpenSlotModal = new EventEmitter<any>();
  ngOnInit(): void {
    if (this.ParkingSpaceID) {
      this.fetchViewSlot();
    }
  }
  fetchViewSlot(ParkingSpaceID: any = null) {
    let id;
    if (ParkingSpaceID) {
      id = ParkingSpaceID;
    }
    else {
      id = this.ParkingSpaceID;
    }
    this.commonService.postJsonData("parking-owner/parking-space/slot", { id: id })
      .subscribe(resp => {
        if (resp.status == 'success') {
          this.slot_data = resp.data;
        }
      })
  }
  openAddSlot() {
    this.OpenSlotModal.emit(true)
  }

}
