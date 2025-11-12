import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/service/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { importProvidersFrom, inject } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {

  ...appConfig,
  providers: [
    ...appConfig.providers,

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    importProvidersFrom(NgHttpLoaderModule.forRoot()),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(NgHttpLoaderModule.forRoot())
  ]
}) .catch((err) => console.error(err));;
