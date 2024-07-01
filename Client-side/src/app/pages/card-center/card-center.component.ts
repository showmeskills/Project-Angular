import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from './../../shared/service/locale.service';

@Component({
  selector: 'app-card-center',
  templateUrl: './card-center.component.html',
  styleUrls: ['./card-center.component.scss'],
})
export class CardCenterComponent implements OnInit {
  constructor(
    private localeService: LocaleService,
    private layoutService: LayoutService,
    private destroyRef: DestroyRef
  ) {}

  /** 是否是 H5模式 */
  isH5!: boolean;

  /** 当前激活下标 */
  activeIndex: number = 0;

  /** 切换按钮 */
  switchBtns = [
    {
      text: this.localeService.getValue('cashable_bonus'),
    },
    {
      text: this.localeService.getValue('coupon_center'),
    },
  ];

  ngOnInit() {
    this.layoutService.isH5$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => (this.isH5 = v));
  }
}
