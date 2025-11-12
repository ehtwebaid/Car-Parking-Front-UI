import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slot-lists',
  standalone: true,
  imports: [],
  templateUrl: './slot-lists.component.html',
  styleUrl: './slot-lists.component.css'
})
export class SlotListsComponent {
@Input() slots:any=[];
@Output() changeSlot=new EventEmitter();
slot_id:any;
setSlotID(ev:any)
{
  this.slot_id=ev?.id;
  this.changeSlot.emit(ev);
}
}
