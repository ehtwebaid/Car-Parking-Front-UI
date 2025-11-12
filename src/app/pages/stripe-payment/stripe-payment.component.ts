import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import {
  StripeCardNumberComponent,
  StripeCardExpiryComponent,
  StripeCardCvcComponent,
  StripeElementsDirective,
  StripeService
} from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { CommonService } from '../../service/common.service';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [
    StripeCardNumberComponent,
    StripeCardExpiryComponent,
    StripeCardCvcComponent,
    StripeElementsDirective,CommonModule
  ],
  templateUrl: './stripe-payment.component.html',
  styleUrl: './stripe-payment.component.css'
})
export class StripePaymentComponent {
  private commonService = inject(CommonService);
  @Input() clientSecret!: string;
  @Output() generateStripeToken=new EventEmitter();
  cardBrand:any;
  // Needed references
  @ViewChild(StripeCardNumberComponent) cardNumber!: StripeCardNumberComponent;
  btnDisabled:boolean=false;
  @ViewChild('paymentBtn',{static:false})paymentBtn!:ElementRef

  cardNumberOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      '::placeholder': {
        color: '#6c757d',   // Bootstrap-like placeholder color
      }
    },
    invalid: {
      color: '#fa755a'
    }
  }
};

cardExpiryOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      '::placeholder': {
        color: '#6c757d',
      }
    },
    invalid: {
      color: '#fa755a'
    }
  }
};

cardCvcOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      '::placeholder': {
        color: '#6c757d',
      }
    },
    invalid: {
      color: '#fa755a'
    }
  }
};

  constructor(private stripeService: StripeService) {
  this.commonService.enablePymentButton.subscribe(res=>{
    if(res)
    {
      this.btnDisabled=false;
      this.paymentBtn.nativeElement.classList.remove('btn-loading');
    }
  })
  }

  createToken() {
    if (!this.cardNumber) {
      this.commonService.showError('CardNumber element not ready');
      return;
    }

    this.stripeService.createToken(this.cardNumber.element).subscribe((result) => {
      if (result.token) {
        this.btnDisabled=true;
        this.generateStripeToken.emit(result.token.id);
        this.paymentBtn.nativeElement.classList.add('btn-loading');
      } else if (result.error) {
         this.commonService.showError(result.error.message);
      }
    });
  }
  onCardChange(ev:any)
  {
    if (ev.brand) {
      this.cardBrand = ev.brand; // e.g. visa, mastercard
    }
  }
}
