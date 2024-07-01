import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {
  //除了宿主元素，可以再特别指定一个点击不关闭的容器，传入这个容器的选择器
  @Input('clickOutsideExcludeSelector') excludeSelector?: string;

  @Output() clickOutside: EventEmitter<MouseEvent> = new EventEmitter();

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      const exclude = this.excludeSelector && document.querySelector(this.excludeSelector);
      if (!exclude || (exclude && !exclude.contains(event.target as Node))) {
        this.clickOutside.emit(event);
      }
    }
  }

  constructor(private elementRef: ElementRef) {}
}
