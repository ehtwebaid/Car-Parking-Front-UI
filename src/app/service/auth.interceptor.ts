import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from './common.service';
import { getToken } from '../../global/app.global';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request to add auth headers
     let token:any;
     const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if(this.commonService.isBrowser())
    {
      token = getToken();

    }
    const authReq = token
      ? req.clone({ setHeaders: { 'x-access-token': token,'x-timezone':timeZone } })
      : req;

    // Only cache GET requests
    if (req.method === 'GET') {
      const cachedResponse = this.cache.get(req.urlWithParams);
      if (cachedResponse) {
        return of(cachedResponse.clone());
      }
    }

    // Pass request through and handle response/errors
    return next.handle(authReq).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            // Cache GET requests
            if (req.method === 'GET') {
              this.cache.set(req.urlWithParams, event.clone());
            }

            const body = event.body;
            if (body?.status === 'val_error') {
              this.commonService.showValidationErrors(body.data?.errors);
            } else if (body?.status && body?.status !== 'success') {
              this.commonService.showError(body.message || 'Something went wrong', 'Error');
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.router.navigate(['/login']);
          } else if (error.status === 404) {
            this.commonService.showError('Page Not Found', 'Error');
          } else if (error.error?.status === 'val_error') {
            this.commonService.showValidationErrors(error.error.data?.errors);
          } else if (error.error?.message) {
            this.commonService.showError(error.error.message, 'Error');
          } else {
            this.commonService.showError('Unexpected error occurred', 'Error');
          }
        }
      }),
      finalize(() => {
        // Optional logging
        // console.log(`⏱️ ${req.method} ${req.urlWithParams} finished`);
      })
    );
  }

  private addAuthHeader(req: HttpRequest<any>): HttpRequest<any> {
    if (this.commonService.isBrowser()) {
      const token = getToken();
      if (token) {
        return req.clone({
          setHeaders: {
            Authorization: `x-access-token ${token}`
          }
        });
      }
    }

    return req;
  }
}
