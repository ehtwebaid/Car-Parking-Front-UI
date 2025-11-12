;

import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { CommonService } from './common.service';
import { getToken, getuserInfo } from '../../global/app.global';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const commonService = inject(CommonService);
  if (commonService.isBrowser()) {
    const token = getToken();
    const user = getuserInfo();
    if (!token) {
      return router.createUrlTree(['/login']);
    }
    else {

      if (route?.parent?.data['role'] != user.role) {
        return router.createUrlTree(['/login']);
      }
      else {
        return true;
      }
    }
    return token ? true : router.createUrlTree(['/login']);
  }

  // Fallback for non-browser environments (e.g., SSR)
  return true;
};

