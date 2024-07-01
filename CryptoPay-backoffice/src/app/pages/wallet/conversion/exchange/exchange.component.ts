import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import { AppService } from 'src/app/app.service';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { catchError, map, retry, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { delay, filter, finalize, Subject, Subscription, timer } from 'rxjs';
import { toFormatMoney } from 'src/app/shared/models/tools.model';
import { TradePreview } from 'src/app/shared/interfaces/conversion';
import { LangPipe, PreLangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    NgIf,
    InputFloatDirective,
    NgTemplateOutlet,
    AngularSvgIconModule,
    ModalFooterComponent,
    CurrencyValuePipe,
    LangPipe,
    PreLangPipe,
  ],
})
export class ExchangeComponent implements OnInit, OnDestroy {
  constructor(
    public modal: MatModalRef<ExchangeComponent>,
    private appService: AppService,
    private modalService: MatModal,
    private api: WalletApi,
    private fb: FormBuilder,
    private langService: LangService
  ) {}

  countDown = 15; // 倒计时更新
  currentTime = 0; // 更新反馈
  hotList: any[] = [];
  from = this.generateForm('from');
  to = this.generateForm('to');
  isPreview = false;
  isEnough = false; // 2023-05-23 17:00:00 之后的接口没有余额不足这一说了 -> Roger
  previewData?: TradePreview;

  stopRefresh$ = new Subject<void>();
  loadSubscription: Subscription;

  /** getters */
  get fromCurItem(): any {
    return this.hotList.find((e) => e.address === this.from.value.address) || {};
  }

  get fromCoinList(): any[] {
    return (this.fromCurItem?.['tokens'] || []).filter((e) => e.status === 'Normal');
  }

  get fromCurCoin(): any {
    return this.fromCoinList.find((e) => e.coin === this.from.value.currency) || {};
  }

  get toCurItem(): any {
    return this.hotList.find((e) => e.address === this.to.value.address) || {};
  }

  get toCoinList(): any[] {
    return (this.toCurItem?.['tokens'] || []).filter((e) => e.status === 'Normal');
  }

  get confirmKey(): string {
    const prev = 'wallet.conversion.exchange.';

    if (this.isEnough) return prev + 'retry';

    return prev + (this.isPreview ? 'confirm' : 'previewExchange');
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.hotwallet().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.hotList = res;
    });
  }

  ngOnDestroy(): void {
    this.stopRefresh();
  }

  /** methods */
  generateForm(type, data?: any) {
    return this.fb.group({
      address: [data?.address || '', Validators.required],
      network: [data?.network || '', Validators.required],
      currency: [data?.currency || '', Validators.required],
      number: [data?.number || '', type === 'from' ? validatorNumberRequired : undefined],
    });
  }

  onSelect(type, field?) {
    if (field === 'address') {
      const form = type === 'from' ? this.from : this.to;
      const curItem = type === 'from' ? this.fromCurItem : this.toCurItem;

      // TODO Arision: from和to不显示这个RIPPLE链暂时不给兑其他
      form.get('network')?.setValue(curItem['network']?.toUpperCase() === 'RIPPLE' ? null : curItem['network']);
      form.get('currency')?.setValue(curItem.tokens?.[0]?.coin || '');
    }

    type === 'from' && this.resetTo();
  }

  resetTo() {
    this.to = this.generateForm('to');
  }

  async onSubmit(tpl) {
    if (this.isEnough) {
      this.isPreview = false;
      this.isEnough = false;
      return;
    }

    if (this.isPreview && !this.isEnough) {
      this.confirm(tpl);
      return;
    }

    this.from.markAllAsTouched();
    this.to.markAllAsTouched();

    if (this.from.invalid || this.to.invalid) return;
    if (await this.checkValue()) return;

    this.previewData = undefined;
    this.stopRefresh$ = new Subject<void>();
    this.stopRefresh$.subscribe(() => {
      this.currentTime = 0;
    });
    this.loadSubscription = this.loadPreview$().subscribe();
  }

  loadPreviewOrigin$(isLoop = false) {
    return this.api
      .conversion_preview({
        fromAddress: this.from.value.address, // 源钱包地址
        fromNetwork: this.from.value.network,
        fromCoin: this.from.value.currency,
        fromAmount: this.from.value.number, // 源兑换数量

        toAddress: this.to.value.address, // 目标钱包地址
        toNetwork: this.to.value.network,
        toCoin: this.to.value.currency,
        // quoteId: 0,
      })
      .pipe(
        catchError((error) => {
          if (!isLoop) throw error; // 如果不是轮训请求，这里中断不执行，后续retry不会进行重试
          return this.loadPreviewOrigin$().pipe(delay(1000)); // 延迟1s 继续轮训心跳包接口

          // 判断后台是否有返回报价的ID
          // if (this.previewData.quoteId) {
          //   this.previewData.quoteId = 0; // 清空报价ID重新轮训请求
          //   return this.loadPreviewOrigin$().pipe(delay(1000)); // 延迟1s 继续轮训心跳包接口
          // } else {
          //   return throwError(error); // 没有报价ID通过throwError操作符抛出错误、通过后续的retry操作符进行重试
          // }
        }),
        retry({ count: isLoop ? 3 : 0, delay: 1e3 }) // 重试
      );
  }

  loadPreview$(isLoop = false) {
    !isLoop && this.appService.isContentLoadingSubject.next(true);
    return this.loadPreviewOrigin$(isLoop).pipe(
      tap((res: TradePreview) => {
        !isLoop && this.appService.isContentLoadingSubject.next(false);
        this.isPreview = true;
        this.currentTime = 0;

        // 余额不足
        // this.isEnough = res?.code === 5011;
        this.previewData = res;

        if (res?.finalPrice) {
          this.to.get('number')?.setValue(toFormatMoney(res?.finalPrice, { maximumDecimalPlaces: 8 }));
        }
      }),
      switchMap(() =>
        // 每6秒请求一次更新
        timer(0, 1000).pipe(
          map((i) => this.countDown - i),
          take(this.countDown + 1),
          takeUntil(this.stopRefresh$),
          tap((i) => (this.currentTime = i)) // 或许可以改用mapTo或scan
        )
      ),
      filter((i) => i === 0),
      switchMap(() => this.loadPreview$(true)),
      takeUntil(this.stopRefresh$) // 取消轮训
    );
  }

  stopRefresh() {
    this.stopRefresh$.next();
    this.stopRefresh$.complete();
  }

  private _isSubmit = false;
  confirm(tpl) {
    if (this._isSubmit) return;
    this._isSubmit = true;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .conversion_add({
        fromAddress: this.from.value.address!, // 源钱包地址
        fromNetwork: this.from.value.network!,
        fromCoin: this.from.value.currency!,
        fromAmount: this.from.value.number!, // 源兑换数量

        toAddress: this.to.value.address!, // 目标钱包地址
        toNetwork: this.to.value.network!,
        toCoin: this.to.value.currency!,
        previewRate: this.previewData?.positivePrice || 0,
        finalPrice: this.previewData?.finalPrice || 0,
        // quoteId: this.previewData.quoteId, // 报价Id
      })
      .pipe(
        finalize(() => {
          this._isSubmit = false;
          this.appService.isContentLoadingSubject.next(false);
        })
      )
      .subscribe((res) => {
        if (res === true) {
          this.stopRefresh();
          this.modalService.open(tpl, { width: '540px' });
          this.modal.close(true);
        } else {
          this.appService.toastOpera(false);
        }
      });
  }

  async checkValue() {
    const { address: fromAddress, network: fromNetwork, currency: fromCurrency } = this.from.value;
    const { address: toAddress, network: toNetwork, currency: toCurrency } = this.to.value;

    if (fromAddress === toAddress && fromNetwork === toNetwork && fromCurrency === toCurrency) {
      const msg = await this.langService.getOne('wallet.conversion.exchange.exchangeSame');
      this.appService.showToastSubject.next({ msg });
      return true;
    }

    return false;
  }

  onBack() {
    if (this.isPreview) {
      this.isPreview = false;
      this.isEnough = false;
      this.stopRefresh();
      this.loadSubscription?.unsubscribe();
      return;
    }

    this.modal.dismiss();
  }
}
