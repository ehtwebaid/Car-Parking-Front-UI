import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'customDateStr',
  standalone: true
})
export class CustomDateStrPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    const[yy,mm,dd]=value.split("-");
    const dateStr=new Date(yy,(mm-1),dd);
    if(moment().format('YYYY-MM-DD')==moment(dateStr).format('YYYY-MM-DD'))
    {
      return 'Today'
    }
    return moment(dateStr).format('DD MMMM YYYY');
  }

}
