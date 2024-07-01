import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-carousel-item',
  templateUrl: './carousel-item.component.html',
  styleUrls: ['./carousel-item.component.scss'],
  host: {
    '[style.width]': 'width()',
    '[style.margin-right]': 'marginRight()',
    '[class]': 'className()',
  },
})
export class CarouselItemComponent implements OnInit {
  constructor(public elementRef: ElementRef) {}

  /** Item宽度 */
  width = signal('100%');
  /** Item间距 */
  marginRight = signal('0');
  /** 特别的样式 */
  className = signal('');

  /**点击左边半个 */
  @Output() clickOnHalfLeft: EventEmitter<unknown> = new EventEmitter();
  /**点击右边边半个 */
  @Output() clickOnHalfRight: EventEmitter<unknown> = new EventEmitter();

  @HostListener('click') click() {
    const className = this.className();
    if (className) {
      const eventMap: {
        [key: string]: EventEmitter<unknown>;
      } = {
        // 'img-carousel-item-half-left': this.clickOnHalfLeft,
        'img-carousel-item-half-right': this.clickOnHalfRight,
      };
      eventMap[this.className()]?.emit();
    }
  }

  ngOnInit() {}
}
