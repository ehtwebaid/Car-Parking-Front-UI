import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { TitleService } from '../../service/title.service';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../service/common.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-owner-header',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, RouterLink],
  templateUrl: './owner-header.component.html',
  styleUrl: './owner-header.component.css'
})
export class OwnerHeaderComponent implements OnInit {

  public titleService = inject(TitleService);
  public commonService = inject(CommonService);
  public total_unread_noti: any = 0;

  @Output() openLogoutPopup = new EventEmitter<any>();

  openLogoutAlert() {
    this.openLogoutPopup.emit(true);
  }
  async fetchUnread() {
    return new Promise((resolve, reject) => {
      this.commonService.postJsonData("parking-owner/total-unread-notification", {}).subscribe(resp => {
        if (resp.status == 'success') {
          resolve(resp?.data?.total_unread);  // success
        }
        else {
          reject(0); // failure
        }
      })

    });
  }
  async ngOnInit() {
    if(this.commonService.isBrowser())
    {
    this.total_unread_noti = await this.fetchUnread();

    }
    this.commonService.markAsRead.subscribe((res:any)=>{
    if(res.length>0)
    {
      this.markAllAsRead(res);
    }
    })
  }
  markAllAsRead(ids:any=[])
  {
    if(ids.length>0)
    {
      this.commonService.postJsonData("parking-owner/mark-all-as-read",{ids:ids}).subscribe(res=>{
        if(res.status='success')
        {
          this.total_unread_noti=this.total_unread_noti-ids.length;
        }
      })
    }
  }
}
