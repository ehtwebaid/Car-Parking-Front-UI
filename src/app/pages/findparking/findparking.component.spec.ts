import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindparkingComponent } from './findparking.component';

describe('FindparkingComponent', () => {
  let component: FindparkingComponent;
  let fixture: ComponentFixture<FindparkingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindparkingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FindparkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
