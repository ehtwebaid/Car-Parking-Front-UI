import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../common/header/header.component';
import { FooterComponent } from '../common/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { StickyLayoutDirective } from '../directive/sticky-layout.directive';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-common-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet,StickyLayoutDirective],
  templateUrl: './common-layout.component.html',
  styleUrl: './common-layout.component.css'
})
export class CommonLayoutComponent {
public commonService = inject(CommonService);
is_browser:boolean=this.commonService.isBrowser();
}
