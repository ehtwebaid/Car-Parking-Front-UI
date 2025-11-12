import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotListsComponent } from './slot-lists.component';

describe('SlotListsComponent', () => {
  let component: SlotListsComponent;
  let fixture: ComponentFixture<SlotListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotListsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SlotListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
