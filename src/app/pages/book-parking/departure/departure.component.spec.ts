import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartureComponent } from './departure.component';

describe('DepartureComponent', () => {
  let component: DepartureComponent;
  let fixture: ComponentFixture<DepartureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepartureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
