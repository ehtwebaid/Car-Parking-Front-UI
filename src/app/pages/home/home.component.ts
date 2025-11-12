import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from '../../service/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, exhaustMap, map, Observable, of } from 'rxjs';
import { NumericDirective } from '../../directive/numeric.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, ReactiveFormsModule, NgSelectModule,NumericDirective],
  providers: [provideAnimations()],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  accordianTab: any = 1;
  @ViewChild('addressInput', { static: true }) addressInput!: ElementRef;
  @ViewChild('contactUS',{static:false}) contactUS!:ElementRef
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activeroute=inject(ActivatedRoute);
  private commonService = inject(CommonService);
  submitting:boolean=false;
  states$: Observable<any[]> = of([]); // <-- initialize to empty array observable
  searchForm = this.fb.group({
    state: [null],
    city: [null],
    zip: [null],
    lat: [null],
    lang: [null],

  });
  contactForm = this.fb.group({
    name: [null,Validators.required],
    email: [null,[Validators.required,Validators.email]],
    phone_no: [null,[Validators.required,Validators.minLength(10),Validators.maxLength(10)]],
    message: [null,Validators.required],

  });
  constructor() { }
  ngOnInit(): void {

    const interval = setInterval(() => {
      if ((window as any).google && (window as any).google.maps) {
        clearInterval(interval);
        this.initAutocomplete();
      }
    }, 300);
    this.fetchAllStates();



  }

  setaccordianTab(tab_index: any) {
    this.accordianTab = tab_index;
  }
  fetchAllStates() {
    return this.states$ = this.commonService.getData("master/state").pipe(
      map((res: any) => res.status === 'success' ? res.data : [])
    );
  }
  initAutocomplete() {
    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      {
        types: ['geocode'], // Or 'address'
        fields: ['formatted_address', 'geometry', 'address_components'],
        componentRestrictions: { country: 'us' }, // Optional: Restrict to India
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        const lat = place.geometry.location.lat();
        const lang = place.geometry.location.lng();
        const city = place.address_components.find((c: any) => c.types.includes('locality'))?.long_name
          || place.address_components.find((c: any) => c.types.includes('sublocality'))?.long_name
          || '';
        const zip = place.address_components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';
        const state = place.address_components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';

        this.searchForm.patchValue({ lat, lang, city, state });



      }
    });
  }
  findParking() {
    const { state, city, zip, lat, lang } = this.searchForm.value;
    this.router.navigate(['/find-parking'], {
      queryParams: { state, city, zip, lat, lang }
    });
  }
  findEV() {
    const is_ev_charing = 1;
    const { state, city, zip, lat, lang } = this.searchForm.value;
    this.router.navigate(['/find-parking'], {
      queryParams: { state, city, zip, lat, lang, is_ev_charing }
    });
  }
  selectState(ev: any) {
    this.searchForm.patchValue({ state: ev.code });
  }
  opencontactUS()
  {
    this.contactUS.nativeElement.focus();

  }
  ngAfterViewInit(): void {
   this.activeroute.fragment.subscribe(fragment => {
      if (fragment) {
       this.opencontactUS();
        // Perform actions based on the fragment value
      } else {

      }
    });

  }
  submitContactForm()
  {
    this.submitting=true;
    if (this.contactForm.invalid) {
          this.contactForm.markAllAsTouched(); // 🔥 Show validation errors
          return;
        }
        of(this.contactForm.value).pipe(
          exhaustMap(({ name,email,phone_no,message}) =>
            this.commonService.postJsonData('user/submit-customer-query', { name,email,phone_no,message}).pipe(

              catchError((err) => {
                this.commonService.showError('Requested failed');
                return of(null);
              })
            )
          )
        ).subscribe((res) => {
          this.submitting = false;
          if (this.commonService.isBrowser()) {
            if (res.status == 'success') {

              this.commonService.showSuccess(res.message);
              this.contactForm.reset();

            }


          }

        });
  }

}
