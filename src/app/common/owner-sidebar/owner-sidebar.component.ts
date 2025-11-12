import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-owner-sidebar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './owner-sidebar.component.html',
  styleUrl: './owner-sidebar.component.css'
})
export class OwnerSidebarComponent {
@Output() openLogoutPopup = new EventEmitter<boolean>();
openLogoutAlert()
{
  this.openLogoutPopup.emit(true);
}
}
