import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../../../service/title.service';
import { NotificationComponent } from '../../notification/notification.component';

@Component({
  selector: 'app-owner-notification',
  standalone: true,
  imports: [NotificationComponent],
  templateUrl: './owner-notification.component.html',
  styleUrl: './owner-notification.component.css'
})
export class OwnerNotificationComponent implements OnInit {

public titleService = inject(TitleService);
ngOnInit(): void {
  this.titleService.setPageTitle("Notification");
}

}
