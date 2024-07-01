import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMouseScroll]',
})
export class MouseScrollDirective {
  constructor(private targetEl: ElementRef) {}
  scrollStep = 50;
  isMove = false;
  @HostListener('mousewheel', ['$event'])
  mousewheel(e: any) {
    e.preventDefault && e.preventDefault();
    const scrollDom: any = this.targetEl.nativeElement;
    const contentDom = this.targetEl.nativeElement.children[0];
    const isDirection: boolean = e.wheelDelta > 0;
    if (isDirection) {
      // 左
      if (scrollDom.scrollLeft >= 0) {
        scrollDom.scrollLeft -= this.scrollStep;
      }
    } else {
      // 右
      if (scrollDom.scrollLeft <= contentDom.clientWidth - scrollDom.clientWidth) {
        scrollDom.scrollLeft += this.scrollStep;
      }
    }
  }
}
