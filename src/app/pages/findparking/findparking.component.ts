import { Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { NgbTimepickerConfig, NgbTimepickerModule, NgbTimeStruct, NgbCarouselModule, NgbAccordionItem } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, exhaustMap, find, scan, finalize, tap, Subject, concat } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { SearchFilterComponent } from '../../common/search-filter/search-filter.component';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { limit } from '../../../global/app.global';
@Component({
  selector: 'app-findparking',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, SearchFilterComponent, RouterLink, ScrollingModule, NgbCarouselModule, NgbAccordionItem],
  templateUrl: './findparking.component.html',
  styleUrl: './findparking.component.css'
})
export class FindparkingComponent implements OnInit {

  private commonService = inject(CommonService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  state_id: any = null;
  states$: Observable<any[]> = of([]); // <-- initialize to empty array observable
  parkings: any = [] // <-- initialize to empty array observable
  serachOptions: any = {};
  limit: number = limit;
  page: number = 1;
  loading = false;
  selectedCity: any;
  selectedZip: any;
  totalPages: number = 0;
  private initialized = false;

  ngOnInit(): void {
    this.fetchAllStates();

    this.route.queryParams.subscribe(params => {
      const state = params['state'] || '';
      const city = params['city'] || '';
      const zip = params['zip'] || '';
      const lat = params['lat'] || '';
      const lang = params['lang'] || '';
      const is_ev_charing = params['is_ev_charing'] || '';
      this.serachOptions = { state, city, zip, lat, lang, is_ev_charing };
      this.selectedCity = city;
      this.selectedZip = zip;
      if (state) {
        this.states$
          .pipe(
            map((states: any[]) => states.find(s => s.code === state))
          )
          .subscribe(resp => {
            this.state_id = resp.id;
          });

      }

    });
  }
  fetchAllStates() {
    return this.states$ = this.commonService.getData("master/state").pipe(
      map((res: any) => res.status === 'success' ? res.data : []),

    );
  }
  fetchAllParkings() {
    const options = { ...this.serachOptions };
    options.page = this.page;
    options.limit = this.limit;
    this.loading = true;

    this.commonService.postJsonData("user/parking/list", options).pipe(
      finalize(() => {
        // ✅ always executed (success or error)
        this.loading = false;
      })
    ).subscribe({
      next: (resp: any) => {
        if (resp.status === 'success' && resp.data.length > 0) {
          this.parkings = [...this.parkings, ...resp.data];
          this.totalPages = resp?.meta?.totalPages;
        }
      },
      error: (err) => {
        console.error('API error:', err);
        // no need to set loading=false here because finalize already handles it
      }
    });




  }
  fetchParkingAPI(options: any) {

  }
  changeFilter(ev: any) {
    this.page = 1;                          // reset pagination
    this.parkings = [];
    if (this.viewport) {
      this.viewport.scrollToIndex(0);

    }                 // clear data
    this.serachOptions = { ...this.serachOptions, ...ev };
    this.fetchAllParkings();
  }
  setState(ev: any) {
    const state = ev.code;
    this.serachOptions.state = state;
    this.fetchAllParkings();

  }
  scrolledIndexChange(index: number) {
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    const buffer = Math.floor(this.limit / 2);

    // Skip trigger on first init
    if (!this.initialized) {
      this.initialized = true;
      return;
    }

    if (
      end >= total - buffer &&
      !this.loading &&
      this.page < this.totalPages
    ) {
      this.page++;
      this.fetchAllParkings();
    }

  }
}
