import { Component, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { Exchange, ExchangeItem } from 'src/app/shared/interfaces/exchange';
import { AppService } from 'src/app/app.service';
import { ExchangeApi } from 'src/app/shared/api/exchange.api';
import { DestroyService } from 'src/app/shared/models/tools.model';
import BigNumber from 'bignumber.js';
import { cloneDeep } from 'lodash';
import { catchError } from 'rxjs/operators';
import { of, zip } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModalClose } from 'src/app/shared/components/dialogs/modal/modal-content-directives';

@Component({
  selector: 'exchange-edit-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    MatModalClose,
    AngularSvgIconModule,
    FormRowComponent,
    MatFormFieldModule,
    SearchDirective,
    MatSelectModule,
    FormsModule,
    SearchInpDirective,
    NgFor,
    MatOptionModule,
    NgIf,
    InputFloatDirective,
    AsyncPipe,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class EditComponent implements OnInit {
  propsData: ExchangeItem;
  sell = '';
  buy = '';
  convertData = {
    convertCurrency: '',
    result: undefined as Exchange | undefined,
  };

  isLoading = false;

  constructor(
    private appService: AppService,
    private api: ExchangeApi,
    private ref: MatModalRef<EditComponent, boolean>
  ) {}

  /**
   * 币种列表
   */
  currencyList: Exchange[] = [];

  /**
   * 汇率列表  PS：法币为USD基准汇率 数字币为USDT基准汇率
   */
  rateList: Exchange[] = [];

  /**
   * 是否同比币种
   */
  get isSameCurrency() {
    return this.convertData.convertCurrency === this.propsData.currency;
  }

  /**
   * 兑换的汇率 - 买入
   */
  get buyRateSpread(): string {
    // return BigNumber(this.propsData.rate)
    //   .times(BigNumber(+this.buy || 0).div(100))
    //   .plus(this.propsData.rate)
    //   .toString();
    // 两和值
    const twoSum = BigNumber(+this.buy)
      .div(100)
      .plus(BigNumber(this.convertData.result?.buyRateSpread || 0).div(100))
      .plus(1);

    if (this.propsData.isDigital) {
      // 虚拟币 → 法币：1 / (中间价 / (1+两和值))
      return BigNumber(1)
        .div(BigNumber(this.convertData.result?.rate || 0).div(twoSum))
        .toString();
    } else {
      // 法币 → 虚拟币：中间价 * (1+两和值)
      return BigNumber(this.convertData.result?.rate || 0)
        .multipliedBy(twoSum)
        .toString();
    }

    // return this.isSameCurrency
    //   ? BigNumber(this.propsData.rate)
    //       .times(BigNumber(+this.buy || 0).div(100))
    //       .plus(this.propsData.rate)
    //       .toString()
    //   : BigNumber(this.convertData.result).multipliedBy(
    //       BigNumber(this.convertItem?.buyRateSpread || 0)
    //         .div(100)
    //         .plus(1)
    //         .plus(BigNumber(this.buy).div(100))
    //     );
  }

  /**
   * 兑换的汇率 - 卖出
   */
  get sellRateSpread() {
    // return BigNumber(this.propsData.rate)
    //   .times(BigNumber(+this.sell || 0).div(100))
    //   .plus(this.propsData.rate)
    //   .toString();
    // 两和值
    const twoSum = BigNumber(+this.sell)
      .div(100)
      .plus(BigNumber(this.convertData.result?.sellRateSpread || 0).div(100))
      .plus(1);

    if (this.propsData.isDigital) {
      // 虚拟币 → 法币：1 / (中间价 / (1+两和值))
      return BigNumber(1)
        .div(BigNumber(this.convertData.result?.rate || 0).div(twoSum))
        .toString();
    } else {
      // 法币 → 虚拟币：中间价 * (1+两和值)
      return BigNumber(this.convertData.result?.rate || 0)
        .multipliedBy(twoSum)
        .toString();
    }
    // return this.isSameCurrency
    //   ? BigNumber(this.propsData.rate)
    //       .times(BigNumber(+this.sell || 0).div(100))
    //       .plus(this.propsData.rate)
    //       .toString()
    //   : BigNumber(this.convertData.result).multipliedBy(
    //       BigNumber(this.convertItem?.sellRateSpread || 0)
    //         .div(100)
    //         .plus(1)
    //         .plus(BigNumber(this.sell).div(100))
    //     );
  }

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip([this.api.getExchangeRates({ target: this.propsData.currency }).pipe(catchError(() => of([])))]).subscribe(
      ([rateList]) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!rateList.length) this.appService.showToastSubject.next({ msgLang: 'walle.notRateList' });
        let currency = Array.isArray(rateList) ? rateList : [];
        currency = currency.filter((e) => e.isDigital !== this.propsData.isDigital);
        this.currencyList = this.rateList = currency;
        this.onConvert();
      }
    );
  }

  /**
   * 提交
   */
  onSubmit() {
    this.loading(true);
    this.api
      .updateExchange({
        currency: this.propsData.currency,
        buyRateSpread: +this.buy,
        sellRateSpread: +this.sell,
      })
      .subscribe(async (result) => {
        this.loading(false);
        const success = result === true;

        this.appService.toastOpera(success);
        this.ref.close(success);
      });
  }

  /**
   * 是否加载中
   * @param v
   * @private
   */
  private loading(v: boolean) {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 汇率转换
   */
  onConvert() {
    const convert = this.convertData; // 未选择转换币种，用当前的

    if (!convert) {
      return this.appService.showToastSubject.next({ msgLang: 'payment.currency.notFindRate' });
    }

    this.convertData.result = this.rateList.find((e) => e.currency === convert.convertCurrency);
  }

  /**
   * 设置数据
   * @param currentItem 当前编辑的item
   */
  setData(currentItem: ExchangeItem) {
    this.propsData = cloneDeep(currentItem);
    this.sell = String(currentItem.sellRateSpread) || '0.00';
    this.buy = String(currentItem.buyRateSpread) || '0.00';
    this.convertData.convertCurrency = currentItem.isDigital ? 'CNY' : 'USDT';
  }
}
