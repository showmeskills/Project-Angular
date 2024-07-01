import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { DepositHistoryComponent } from './deposit-history/deposit-history.component';
import { WalletHistoryService } from './wallet-history.service';
import { WithdrawHistoryComponent } from './withdraw-history/withdraw-history.component';
@UntilDestroy()
@Component({
  selector: 'app-wallet-history',
  templateUrl: './wallet-history.component.html',
  styleUrls: ['./wallet-history.component.scss'],
})
export class WalletHistoryComponent implements OnInit, AfterViewInit {
  constructor(
    private walletHistoryService: WalletHistoryService,
    private layout: LayoutService,
    private activatedRoute: ActivatedRoute
  ) {}

  ready: boolean = false;

  @ViewChild('tabs') tabs!: ElementRef<HTMLDivElement>;

  menuData = [
    { page: './deposit', name: 'deposit' },
    { page: './withdrawal', name: 'withdrawl' },
    { page: './transfer', name: 'trans' },
    // { page: './exchange', name: '兑换' },
    // { page: './transaction', name: '交易' },
    { page: './promotion', name: 'bonus' },
    { page: './adjustment', name: 'trans_acc' },
    { page: './commission', name: 'commission' },
    { page: './prize', name: 'lucky_draw' },
  ];

  ngOnInit() {
    // 准备状态数据，准备好后显示下级页面
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(component => {
      switch (component) {
        case DepositHistoryComponent:
          this.walletHistoryService.getStatusList(true, () => {
            this.ready = true;
          });
          return;
        case WithdrawHistoryComponent:
          this.walletHistoryService.getStatusList(false, () => {
            this.ready = true;
          });
          return;
        default:
          this.ready = true;
          return;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const el = this.tabs.nativeElement.querySelector('.active') as HTMLDivElement | null;
      if (el) this.clickTab(el, this.tabs.nativeElement);
    });
  }

  //自动移动显示前后标签
  clickTab(el: HTMLDivElement, parentElement: HTMLDivElement) {
    const prevEl = el.previousElementSibling as HTMLDivElement | null;
    const nextEl = el.nextElementSibling as HTMLDivElement | null;
    if (prevEl) {
      if (prevEl.offsetLeft < parentElement.scrollLeft) {
        parentElement.scrollLeft -= prevEl.offsetWidth + 50;
        return;
      }
    } else {
      parentElement.scrollLeft = 0;
      return;
    }
    if (nextEl) {
      if (nextEl.offsetLeft + nextEl.offsetWidth > parentElement.offsetWidth + parentElement.scrollLeft) {
        parentElement.scrollLeft += nextEl.offsetWidth + 50;
        return;
      }
    } else {
      parentElement.scrollLeft = parentElement.scrollWidth;
    }
  }
}
