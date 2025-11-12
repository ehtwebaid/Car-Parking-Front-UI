import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerFooterComponent } from './owner-footer.component';

describe('OwnerFooterComponent', () => {
  let component: OwnerFooterComponent;
  let fixture: ComponentFixture<OwnerFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
