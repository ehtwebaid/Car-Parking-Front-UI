import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinal',
  standalone: true
})
export class OrdinalPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    const num = Number(value);

    if (isNaN(num)) {
      return String(value); // Return original value if not a number
    }

    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
  }

}
