import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, timer } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@UntilDestroy()
@Directive({
  selector: '[numberChangeAddClass]',
})
export class NumberChangeAddClassDirective implements OnInit, OnChanges {
  /**绑定的数值 */
  @Input() numberChangeAddClass?: number;
  /**数值升高时候样式 */
  @Input() incrementClass: string = 'increment';
  /**数值降低时候样式 */
  @Input() decrementClass: string = 'decrement';
  /**样式恢复时间 */
  @Input() recoverTime: number = 5000;

  _timer?: Subscription;

  constructor(private targetEl: ElementRef<HTMLElement>) {}

  ngOnInit() {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    const changes = simpleChanges.numberChangeAddClass;
    if (changes) {
      if (
        ![null, undefined, ''].includes(changes.currentValue) &&
        ![null, undefined, ''].includes(changes.previousValue)
      ) {
        const className =
          Number(changes.currentValue) > Number(changes.previousValue) ? this.incrementClass : this.decrementClass;
        if (className) {
          this._timer?.unsubscribe();
          this._timer = timer(0)
            .pipe(
              untilDestroyed(this),
              tap(_ => this.addClass(className)),
              delay(this.recoverTime)
            )
            .subscribe(_ => {
              this.removeClass();
            });
        }
      }
    }
  }

  addClass(className: string) {
    this.removeClass();
    this.targetEl.nativeElement.classList.add(className);
  }

  removeClass() {
    this.targetEl.nativeElement.classList.remove(this.incrementClass);
    this.targetEl.nativeElement.classList.remove(this.decrementClass);
  }
}
