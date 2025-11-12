import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonService } from '../../service/common.service';
import { clearToken, clearUserInfo, getToken } from '../../../global/app.global';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  public commonService = inject(CommonService);
  public router = inject(Router);
  public token=getToken();
   public total_unread_noti:any=0;
  constructor(){
  this.commonService.refetchToken.subscribe(res=>{
  if(res)
  {
    this.token=res;
  }
  })
  }

  confirmLogout() {
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
          this.token=null;
          this.router.navigate(['/']);
        }
      }
    });

  }

   async ngOnInit() {
  }
  focusContactUS()
  {
    this.commonService.focusContactUs.next('move');
  }
}
