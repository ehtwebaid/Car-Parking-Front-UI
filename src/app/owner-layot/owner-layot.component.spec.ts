import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerLayotComponent } from './owner-layot.component';

describe('OwnerLayotComponent', () => {
  let component: OwnerLayotComponent;
  let fixture: ComponentFixture<OwnerLayotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerLayotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerLayotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
