import { Directive, ElementRef, HostListener, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[appStickyLayout]',
  standalone: true
})
export class StickyLayoutDirective implements AfterViewInit {
  @Input() headerSelector = '.page-header';
  @Input() sidebarSelector = '#sidebar';
  @Input() footerSelector = '#footer';
  @Input() stickyClass = 'is-sticky';
  @Input() sidebarFixedClass = 'fixed';

  private header!: HTMLElement;
  private sidebar!: HTMLElement;
  private footer!: HTMLElement;
  private top = 0;
  private maxY = 0;
  constructor(private el: ElementRef) { }
  ngAfterViewInit(): void {
    const root = this.el.nativeElement;

    this.header = document.querySelector(this.headerSelector)!;
    this.sidebar = document.querySelector(this.sidebarSelector)!;
    this.footer = document.querySelector(this.footerSelector)!;

    if (this.sidebar && this.footer) {
      this.calculateSidebarLimits();
    }
  }
  @HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY;

    // Sticky header
    if (this.header) {
      if (y > 150) {
        this.header.classList.add(this.stickyClass);
      } else {
        this.header.classList.remove(this.stickyClass);
      }
    }

    // Sidebar fix until footer
    if (this.sidebar && this.footer) {
      if (y > this.top) {
        if (y < this.maxY) {
          this.sidebar.classList.add(this.sidebarFixedClass);
          this.sidebar.style.position = '';
          this.sidebar.style.top = '';
        } else {
          this.sidebar.classList.remove(this.sidebarFixedClass);
          this.sidebar.style.position = 'absolute';
          this.sidebar.style.top = `${this.maxY - this.top - 100}px`;
        }
      } else {
        this.sidebar.classList.remove(this.sidebarFixedClass);
      }
    }
  }

  private calculateSidebarLimits() {
    this.top = this.sidebar.offsetTop;
    const footTop = this.footer.offsetTop;
    this.maxY = footTop - this.sidebar.offsetHeight;
  }

}
