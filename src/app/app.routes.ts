import { DashboardComponent } from './pages/customer/dashboard/dashboard.component';
import { OwnerLayotComponent } from './owner-layot/owner-layot.component';
import { SignupComponent } from './pages/signup/signup.component';
import { CommonLayoutComponent } from './common-layout/common-layout.component';

import { Routes } from '@angular/router';
import { authGuard } from './service/auth.guard';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // 👈 Add this
  { path: 'signup',loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)}, // 👈 Add this
  { path: 'login',loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)}, // 👈 Add this

  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)},
      { path: 'share',loadComponent: () => import('./pages/share/share.component').then(m => m.ShareComponent)}, // 👈 Add this
      { path: 'find-parking',loadComponent: () => import('./pages/findparking/findparking.component').then(m => m.FindparkingComponent)}, // 👈 Add this
      { path: 'parking/view/:slug',loadComponent: () => import('./pages/book-parking/book-parking.component').then(m => m.BookParkingComponent)}, // 👈 Add this

    ]
  },
  {
  path: 'parking-owner',
  canActivateChild: [authGuard],
  data: { role:'O' },
  component: OwnerLayotComponent,
  children: [
  { path: 'dashboard', loadComponent: () => import('./pages/owner/owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent)},
  { path: 'payment', loadComponent: () => import('./pages/owner/owner-payments/owner-payments.component').then(m => m.OwnerPaymentsComponent)},
  { path: 'setting', loadComponent: () => import('./pages/owner/owner-settings/owner-settings.component').then(m => m.OwnerSettingsComponent)},
  { path: 'notification', loadComponent: () => import('./pages/owner/owner-notification/owner-notification.component').then(m => m.OwnerNotificationComponent)},
  { path: 'booking', loadComponent: () => import('./pages/owner/owner-booking/owner-booking.component').then(m => m.OwnerBookingComponent)},

  ]
},
{
  path:'customer',
  canActivateChild:[authGuard],
  data: { role:'U' },
  component:CustomerLayoutComponent,
  children:[
    {
      path: 'dashboard', loadComponent: () => import('./pages/customer/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
      path: 'notification', loadComponent: () => import('./pages/customer/customer-notification/customer-notification.component').then(m => m.CustomerNotificationComponent)
    },
     {
      path: 'setting', loadComponent: () => import('./pages/customer/customer-setting/customer-setting.component').then(m => m.CustomerSettingComponent)
    },
]
}

];
