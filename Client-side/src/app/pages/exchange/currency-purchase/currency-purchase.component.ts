import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, combineLatest } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { CurrencyPurchaseInferface } from 'src/app/shared/interfaces/deposit.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-currency-purchase',
  templateUrl: './currency-purchase.component.html',
  styleUrls: ['./currency-purchase.component.scss'],
})
export class CurrencyPurchaseComponent implements OnInit {
  constructor(
    private sanitizer: DomSanitizer,
    private depositApi: DepositApi,
    private toast: ToastService,
    private route: ActivatedRoute,
    private appService: AppService,
    private dataCollectionService: DataCollectionService
  ) {}

  @ViewChild('purchaseIframe') iframeElementRef!: ElementRef;
  walletSub!: Subscription; //订阅钱包数据
  callbackSub!: Subscription; //订阅绑定HTML网银信息
  isLoading: boolean = true;
  url: SafeResourceUrl = '';
  notFound: boolean = false; //url获取失败
  show: boolean = false;
  currency: string = 'USD'; //默认法币
  token: string = 'USDT'; //默认数字货币

  queryCurrency: string | null = null;

  ngOnInit() {
    this.dataCollectionService.addPoint({ eventId: 30011, actionValue1: 2 });

    // 响应传入币种
    combineLatest([this.route.queryParams])
      .pipe(untilDestroyed(this))
      .subscribe(([query]) => {
        if (query.currency) this.queryCurrency = query.currency;
        this.getCurrencies();
      });
  }

  getCurrencies() {
    this.appService.currencies$
      .pipe(
        untilDestroyed(this),
        first(v => !!(v.length > 0))
      )
      .subscribe(v => {
        //如果存在带入的币种且有效 则使用带入的币种
        if (this.queryCurrency) {
          const matched = v.find(e => e.currency == this.queryCurrency && e.isVisible);
          if (matched) this.token = this.queryCurrency;
        }

        this.getPurchase();
      });
  }

  getPurchase() {
    const param: CurrencyPurchaseInferface = {
      currency: this.currency,
      token: this.token,
      amount: 100,
    };
    this.depositApi
      .getCurrencyPurchase(param)
      .pipe(finalize(() => {}))
      .subscribe(res => {
        if (res?.data) {
          this.url = this.sanitizer.bypassSecurityTrustResourceUrl(res.data);
          this.isLoading = false;
          this.show = true;
        } else {
          this.notFound = true;
          if (res.code === '2097') {
            // 禁止存款
            this.appService.showForbidTip('income', res.message);
          } else {
            this.toast.show({ message: res.message, type: 'fail' });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.walletSub?.unsubscribe();
  }
}
