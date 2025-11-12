import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerNotificationComponent } from './customer-notification.component';

describe('CustomerNotificationComponent', () => {
  let component: CustomerNotificationComponent;
  let fixture: ComponentFixture<CustomerNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerNotificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
