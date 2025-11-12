import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './customer-sidebar.component.html',
  styleUrl: './customer-sidebar.component.css'
})
export class CustomerSidebarComponent {
@Output() openLogoutPopup = new EventEmitter<boolean>();
openLogoutAlert()
{
  this.openLogoutPopup.emit(true);
}
}
