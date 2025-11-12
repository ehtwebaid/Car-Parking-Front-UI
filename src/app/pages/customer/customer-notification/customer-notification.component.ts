import { Component, inject, OnInit } from '@angular/core';
import { NotificationComponent } from '../../notification/notification.component';
import { TitleService } from '../../../service/title.service';

@Component({
  selector: 'app-customer-notification',
  standalone: true,
  imports: [NotificationComponent],
  templateUrl: './customer-notification.component.html',
  styleUrl: './customer-notification.component.css'
})
export class CustomerNotificationComponent implements OnInit {

public titleService = inject(TitleService);
ngOnInit(): void {
    this.titleService.setPageTitle("Notification");

}
}
