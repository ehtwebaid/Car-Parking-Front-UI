import { CommonService } from './../service/common.service';
import { Component, inject } from '@angular/core';
import { OwnerSidebarComponent } from '../common/owner-sidebar/owner-sidebar.component';
import { OwnerFooterComponent } from '../common/owner-footer/owner-footer.component';
import { OwnerHeaderComponent } from '../common/owner-header/owner-header.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { clearToken, clearUserInfo } from '../../global/app.global';
import { CommonModule } from '@angular/common';
import { CustomerSidebarComponent } from '../common/customer-sidebar/customer-sidebar.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [OwnerFooterComponent,CustomerSidebarComponent, RouterOutlet, OwnerHeaderComponent, OwnerHeaderComponent, RouterLink],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.css'
})
export class CustomerLayoutComponent {
 public commonService=inject(CommonService);
  public router=inject(Router);
  confirmLogout(ev: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to log out your account ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Log Out',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary tm-btn me-1 logout_dtn',
        cancelButton: 'btn btn-secondary tm-btn2'
      },
      buttonsStyling: false // important to make customClass take effect
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Perform logout logic here
        if (this.commonService.isBrowser()) {
          this.commonService.setUserInfo();
          clearUserInfo();
          clearToken();
          this.router.navigate(['/']);
        }
      }
    });

  }
}
