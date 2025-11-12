import { Inject, Injectable, Optional } from '@angular/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { CommonOptions } from 'node:child_process';
import { CommonService } from './common.service';
@Injectable({ providedIn: 'root' })
export class TokenService {
  
  constructor(private cookieService: SsrCookieService,private commonService: CommonService,@Optional() @Inject('REQUEST') private request: any) {}

  setCookie(token: string) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30); // Set expiry to 30 days from now
  
    this.cookieService.set(
      'bullet-inventory-token', // cookie name
      token,                    // cookie value
      expireDate,               // expiration date
      '/',                      // path
      undefined,                // domain (optional)
      true,                     // secure (true for HTTPS only)
      'Lax'                     // SameSite policy
    );  

  }

  getCookie(): string | null {
    return this.cookieService.get('bullet-inventory-token') || null;
  }

  clearCookie() {
    this.cookieService.set('bullet-inventory-token', "");
    ;
  }
}
