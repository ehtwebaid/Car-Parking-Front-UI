import { months_arr, quarters_arr } from './../../../../global/app.global';
import { CommonService } from './../../../service/common.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TitleService } from '../../../service/title.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map, Observable, of } from 'rxjs';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [BaseChartDirective, ReactiveFormsModule, CommonModule,NgbDropdownModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css',
})
export class OwnerDashboardComponent implements OnInit {
  public titleService = inject(TitleService);
  public commonService = inject(CommonService);
  stats$: Observable<any> = of({});
  private fb = inject(FormBuilder);
  @ViewChild('bookingChart') bookingChart?: BaseChartDirective;
  @ViewChild('collectionChart') collectionChart?: BaseChartDirective;
  bookingFilterForm = this.fb.group({
  data_type: ["monthly",Validators.required],

  });
  collectionFilterForm = this.fb.group({
    data_type: ["monthly",Validators.required],
  });
  changeBookingFilter(data_type:any)
  {
    this.bookingFilterForm.patchValue({data_type:data_type});
  }
   changeCollectionFilter(data_type:any)
  {
    this.collectionFilterForm.patchValue({data_type:data_type});
  }
  paymentChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#3b82f6',
      },
    ],
  };
  paymentChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
        titleAlign: 'center',
        callbacks: {
          label: (context) => 'Income: ' + context.raw,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#555',
          font: { size: 13 },
        },
      },
      y: {
        min: 0,
        max: 20000,
        ticks: {
          stepSize: 5000,
          callback: (value: any) => value / 1000 + 'K',
          color: '#888',
          font: { size: 13 },
        },
        grid: {
          color: '#f0f0f0',
          lineWidth: 1,
          // ✅ hides border
        },
        border: {
          // ✅ v4 way to control axis border
          display: false, // hides the border line
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  bookingchartData: ChartConfiguration<'line'>['data'] = {
    labels: [

    ],
    datasets: [
      {
        label: 'Booking',
        data: [],
        backgroundColor: 'rgba(0, 128, 0, 0.1)',
        borderColor: '#28a745',
        borderWidth: 1,
        fill: true,
        pointBackgroundColor: '#28a745',
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  };

  bookingchartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Booking: ${Math.round(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 60,
        ticks: {
          callback: (value) => value,
        },
        grid: {
          color: '#eee',
        },
        border: {
          // ✅ Chart.js v4 border API
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          // ✅ hides X-axis border too
          display: false,
        },
      },
    },
  };
  ngOnInit(): void {
    this.titleService.setPageTitle('Dashboard');
    if (this.commonService.isBrowser()) {
      this.fetchDashBoardSummary();
      this.bookingFilterForm.valueChanges.subscribe(resp=>{
      this.fetchBookingData();

      })
      this.collectionFilterForm.valueChanges.subscribe(resp=>{
      this.fetchCollectionData();

      })
      this.fetchBookingData();
      this.fetchCollectionData();
    }
  }
  fetchDashBoardSummary() {
    this.stats$ = this.commonService
      .postJsonData('parking-owner/dashboard-summary', {})
      .pipe(map((res: any) => (res.status === 'success' ? res.data : [])));
  }
  fetchBookingData()
  {
    this.commonService.postJsonData("parking-owner/chart-booking",this.bookingFilterForm.value).subscribe(resp=>{
    if(resp.status=='success')
      {
          let labels=[];
          const{data_type}=this.bookingFilterForm.value;
          if(data_type=='monthly')
          {
            labels=months_arr;
          }
          else if(data_type=='quarterly')
          {
            labels=quarters_arr;
          }
          else{
            labels=resp.data.map((item: {label: any;})=>item.label);
          }
          this.bookingchartData.labels = labels;
          this.bookingchartData.datasets[0].data = resp.data.map((item: { total_booking: any; })=>item?.total_booking);
          // Refresh chart
          this.bookingChart?.update();
      }
    });
  }
   fetchCollectionData()
  {
    this.commonService.postJsonData("parking-owner/chart-collection",this.collectionFilterForm.value).subscribe(resp=>{
    if(resp.status=='success')
      {
          let labels=[];
          const{data_type}=this.collectionFilterForm.value;
          if(data_type=='monthly')
          {
            labels=months_arr;
          }
          else if(data_type=='quarterly')
          {
            labels=quarters_arr;
          }
          else{
            labels=resp.data.map((item: {label: any;})=>item.label);
          }
          this.paymentChartData.labels = labels;
          this.paymentChartData.datasets[0].data = resp.data.map((item: { total_income: any; })=>item?.total_income);
          // Refresh chart
          this.collectionChart?.update();
      }
    });
  }
}
