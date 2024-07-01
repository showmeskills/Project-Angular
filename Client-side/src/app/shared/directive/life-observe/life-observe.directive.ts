import {
  AfterContentInit,
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appLifeObserve]',
})
export class LifeObserveDirective implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  /**宿主元素创建、销毁时候触发，可用于检测变化、表达式监控等*/
  @Output() lifeChange: EventEmitter<boolean> = new EventEmitter();

  /**ngOnInit 钩子 */
  @Output() lifeInit: EventEmitter<HTMLElement> = new EventEmitter();

  /**ngAfterViewInit 钩子 */
  @Output() lifeViewInit: EventEmitter<HTMLElement> = new EventEmitter();

  /**ngAfterContentInit 钩子 */
  @Output() lifeContentInit: EventEmitter<HTMLElement> = new EventEmitter();

  /**销毁 */
  @Output() lifeDestroy: EventEmitter<HTMLElement> = new EventEmitter();

  ngOnInit(): void {
    this.lifeInit.emit(this.elementRef.nativeElement);
    this.lifeChange.emit(true);
  }

  ngAfterViewInit(): void {
    this.lifeViewInit.emit(this.elementRef.nativeElement);
  }

  ngAfterContentInit(): void {
    this.lifeContentInit.emit(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.lifeDestroy.emit(this.elementRef.nativeElement);
    this.lifeChange.emit(false);
  }
}
