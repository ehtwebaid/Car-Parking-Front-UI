import { environment } from './../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, share, shareReplay, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser, isPlatformServer, Location } from '@angular/common';
import { getuserInfo } from '../../global/app.global';
import { Router } from '@angular/router';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public toastr: ToastrService | null = null;
  private router = inject(Router);
  public userInfoSource = new BehaviorSubject<any>(this.isBrowser() ? getuserInfo() : null);
  public setArrivalTime = new BehaviorSubject<any>(null);
  public setDepartureTime = new BehaviorSubject<any>(null);
  public resetTime = new BehaviorSubject<any>(null);
  public arrivalDeptRequired = new BehaviorSubject<any>(false);
  public updateBookingData = new BehaviorSubject<any>(null);
  public refetchToken = new BehaviorSubject<any>(null);
  public enablePymentButton = new BehaviorSubject<any>(false);
  public markAsRead = new BehaviorSubject([]);
  public monthlyBookingData = new BehaviorSubject(null);
  public focusContactUs = new BehaviorSubject<any>(null);

  userInfo$ = this.userInfoSource.asObservable();
  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object, private transferState: TransferState, private injector: Injector) {
    if (this.isBrowser()) {
      this.toastr = this.injector.get(ToastrService);
    }
  }

  postFormData(url: any, body: any): Observable<any> {

    let form_data = new FormData();

    const appendFormData = (formData: FormData, data: any, parentKey: string | null = null) => {
      if (Array.isArray(data)) {
        // Handle arrays -> append using "key[]"
        data.forEach(item => {
          formData.append(`${parentKey}`, item);
        });
      }
      else if (data && typeof data === 'object' && !(data instanceof File)) {
        // Handle nested objects
        Object.keys(data).forEach(key => {
          const fullKey = parentKey ? `${parentKey}[${key}]` : key;
          appendFormData(formData, data[key], fullKey);
        });
      }
      else {
        // Primitive values & Files
        if (parentKey) {
          formData.append(parentKey, data?data:'');
        }
      }
    };


    appendFormData(form_data, body);
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
      })
    }
    return this.http.post(`${environment.apiBaseUrl}/${url}`, form_data, httpOptions)
  }

  postJsonData(url: any, body: any): Observable<any> {

    const key = makeStateKey<any>(`post-${url}-${JSON.stringify(body)}`);

    // On browser, use cache if exists
    if (this.isBrowser() && this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, null);
      this.transferState.remove(key); // remove after reading
      return of(cached);
    }

    const httpOptions = {

      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post(`${environment.apiBaseUrl}/${url}`, body, httpOptions).pipe(
      tap((res) => {
        // On server, save result to transfer state
        if (this.isServer()) {
          console.log('Setting transfer state for', key); // Add this
          this.transferState.set(key, res);
        }
      }),
      catchError(err => {
        console.error('❌ HTTP error on server:', err);
        return of({ status: 'error', data: [] }); // fallback
      }),
      share()

    );

  }
  getData(url: any): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
      })
    }
    return this.http.get(`${environment.apiBaseUrl}/${url}`, httpOptions).pipe(
      tap((res) => {
      }),
      catchError(err => {
        console.error('❌ HTTP error on server:', err);
        return of({ status: 'error', data: [] });
      }),
      shareReplay(1) // ✅ keeps last value for future subscribers
    );


  }
  showSuccess(message: any, title: any = '') {
    if (this.toastr) {
      this.toastr.success(message, title)
    }
  }

  showError(message: any, title: any = '') {
    if (this.toastr) {
      this.toastr.error(message, title)

    }
  }
  showValidationErrors(errors: any) {
    if (this.toastr) {
      for (const err in errors) {
        this.toastr.error(errors[err].message, "")

      }
    }
  }
  showInfo(message: any, title: any = '') {
    if (this.toastr) {
      this.toastr.info(message, title);
    }
  }

  showWarning(message: any, title: any = '') {
    if (this.toastr) {
      this.toastr.warning(message, title);
    }
  }
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isServer(): boolean {
    return isPlatformServer(this.platformId);
  }
  navigateBack() {
    if (this.isBrowser()) {
      this.router.navigate(['admin/dashboard']);
    }

  }
  get isAdmin(): boolean {
    if (this.isBrowser()) {
      const user = getuserInfo();
      return user?.role === 'admin';
    }
    return false; // fallback to avoid error
  }
  setUserInfo() {
    this.userInfoSource.next(getuserInfo());
  }


}
