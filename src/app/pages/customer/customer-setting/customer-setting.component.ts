import { Component, inject, OnInit } from '@angular/core';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { ProfileComponent } from '../../profile/profile.component';
import { TitleService } from '../../../service/title.service';

@Component({
  selector: 'app-customer-setting',
  standalone: true,
  imports: [ProfileComponent, ChangePasswordComponent],
  templateUrl: './customer-setting.component.html',
  styleUrl: './customer-setting.component.css'
})
export class CustomerSettingComponent implements OnInit {

public titleService = inject(TitleService);
ngOnInit(): void {
  this.titleService.setPageTitle("Settings");
}
}
