import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonService } from '../../service/common.service';
import { CustomDateStrPipe } from "../../pipe/custom-date-str.pipe";
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, CustomDateStrPipe,NgbPaginationModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: any = [];
  page: any = 1;
  collectionSize: any = 0;
  totalItem: any = 0;
  per_page:any=10;
  markasreadids:any=[];
  private commonService = inject(CommonService);
  @ViewChildren('notificationCard') notificationCards!: QueryList<ElementRef>;

  ngOnInit(): void {
    if(this.commonService.isBrowser())
    {
      this.fetchAllNotifications();
    }
  }
  fetchAllNotifications() {
    const options = { page: this.page };
    this.commonService.postJsonData("parking-owner/notification", options).subscribe(res => {
      if (res?.status == "success") {
        this.notifications = res.data;
        this.collectionSize = res?.meta?.totalItems;
        this.totalItem = res?.meta?.totalItems;
        this.markasreadids=res?.meta?.markasreadids;
      }
    })

  }
  onPageChange(page: any) {
    this.page = page;
    this.fetchAllNotifications();
  }
  get notificationDates() {
  return Object.keys(this.notifications);
}
ngAfterViewInit() {
    // Fires when all @for (or *ngFor) DOMs are rendered

    // If data updates dynamically
    this.notificationCards.changes.subscribe(() => {
    this.commonService.markAsRead.next(this.markasreadids);
    });
  }
}
