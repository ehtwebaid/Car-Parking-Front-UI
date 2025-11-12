import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotSettingComponent } from './slot-setting.component';

describe('SlotSettingComponent', () => {
  let component: SlotSettingComponent;
  let fixture: ComponentFixture<SlotSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SlotSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
