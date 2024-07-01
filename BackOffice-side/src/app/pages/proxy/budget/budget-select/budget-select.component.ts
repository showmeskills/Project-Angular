import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { filter, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CdkOverlayOrigin, CdkConnectedOverlay } from '@angular/cdk/overlay';

@Component({
  selector: 'budget-select',
  templateUrl: './budget-select.component.html',
  styleUrls: ['./budget-select.component.scss'],
  host: {
    '[class.form-control]': 'edit',
  },
  standalone: true,
  imports: [CdkOverlayOrigin, AngularSvgIconModule, CdkConnectedOverlay],
})
export class BudgetSelectComponent implements OnInit, OnDestroy {
  constructor() {}
  private _destroy = new Subject<void>();

  isOpen = false;
  @ViewChild('target') target!: ElementRef;
  @Input() edit = false;

  @Output() add = new EventEmitter<number>();

  /** lifeCycle */
  ngOnInit(): void {
    this.initEvent();
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  /** methods */
  initEvent(): void {
    // 检查 点击此组件以外元素关闭显示此组件 -> app-root 同级会有modal可能需要modal显示在这上面
    fromEvent(document.querySelector('app-root') as HTMLDivElement, 'click', {
      capture: true,
    })
      .pipe(
        filter(() => this.isOpen),
        takeUntil(this._destroy)
      )
      .subscribe((res) => (this.isOpen = this.target.nativeElement.contains(res.target as Node)));
  }

  // 叠加
  onAccumulate(v: number) {
    this.add.emit(v);
  }
}
