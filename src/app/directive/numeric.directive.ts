import { Directive,HostListener  } from '@angular/core';

@Directive({
  selector: '[appNumeric]',
  standalone: true
})
export class NumericDirective {

  constructor() { }
  private regex: RegExp = new RegExp(/^[0-9]*$/);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow: Backspace, Tab, End, Home, Arrow keys, Delete
    const allowedKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow Ctrl+A/C/V/X (copy/paste etc.)
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }

    // Block non-numeric
    if (!this.regex.test(event.key)) {
      event.preventDefault();
    }
  }
}
