import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrivalComponent } from './arrival.component';

describe('ArrivalComponent', () => {
  let component: ArrivalComponent;
  let fixture: ComponentFixture<ArrivalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrivalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArrivalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
