import { Injectable, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, filter, finalize, from, Observable, of, Subject, Subscription, switchMap } from 'rxjs';
import { Exchange, ExchangeConvertDetail } from 'src/app/shared/interfaces/exchange';
import { ExchangeApi } from 'src/app/shared/api/exchange.api';
import BigNumber from 'bignumber.js';
import { AppService } from 'src/app/app.service';
import { map, takeUntil } from 'rxjs/operators';
import { cloneDeep, get, isEqual } from 'lodash';

@Pipe({
  name: 'exchange',
  standalone: true,
  pure: false,
})
export class ExchangePipe implements PipeTransform, OnDestroy {
  constructor(private exchangeService: ExchangeService) {}

  value = '';
  private _destroy$ = new Subject<void>();

  transform(value: BigNumber.Value, valueCurrency: string, toCurrency = 'USDT'): any {
    this.exchangeService
      .transformString$(value, valueCurrency, toCurrency)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        this.value = res;
      });

    return this.value;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

@Pipe({
  name: 'exchangeReduceTotal',
  standalone: true,
  pure: false,
})
export class ReduceExchangeTotalPipe implements PipeTransform, OnDestroy {
  constructor(private exchangeService: ExchangeService) {}

  value = '0';

  private previousValue: any;
  clean: Subscription[] = [];

  transform<T = any>(value: T[], keyField: keyof T, currencyField: keyof T): string;
  transform<T = any>(value: T[], keyField: keyof T, currencyField: keyof T, targetCurrency = 'USDT'): string {
    // 先做记录，如果数据没有变化，就不再计算，否则后续调用会导致检查变化，如果传入getter的返回值会一直渲染触发导致死循环
    const procValue = cloneDeep(value);
    if (isEqual(procValue, this.previousValue)) return this.value;
    this.previousValue = cloneDeep(value);

    this.value = '0';
    if (!Array.isArray(value)) return this.value;

    this._dispose();

    const total = () => {
      return procValue.reduce((acc, cur) => {
        return acc.plus(cur?.['__value__'] || 0);
      }, new BigNumber(0));
    };

    procValue.forEach((v) => {
      if (get(v, keyField, undefined) === undefined) return;

      const curValue = get(v, keyField, undefined);
      if (!curValue) return;

      const curCurrency = get(v, currencyField, undefined);
      if (!curCurrency) return;

      this.clean.push(
        this.exchangeService.transform$(curValue, curCurrency, targetCurrency).subscribe((convertDetail) => {
          v['__value__'] = convertDetail.result.toString();

          // 每次拿到最新汇率后，重新计算总值
          this.value = total().toString();
        })
      );
    });

    return this.value;
  }

  private _dispose() {
    this.clean.forEach((e) => {
      e.unsubscribe();
    });
    this.clean = [];
    this.value = '0';
  }

  ngOnDestroy(): void {
    this._dispose();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ExchangeService {
  constructor(private api: ExchangeApi, private appService: AppService) {
    this.updateExchange();
  }

  private _list$ = new BehaviorSubject<Exchange[]>([]);
  private isLoading = false;

  get list$() {
    return this._list$.asObservable();
  }

  get list() {
    return this._list$.getValue();
  }

  /**
   * 更新汇率列表
   * @param exchange 更新的汇率列表，不传则从新拉取 默认为undefined
   */
  private updateExchange(exchange?: Exchange[]): Promise<Exchange[]> {
    return new Promise((resolve) => {
      if (exchange !== undefined) {
        this._list$.next(exchange);
        return resolve(exchange);
      }

      this.isLoading = true;
      this.api
        .getExchangeRates()
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((res) => {
          const list: Exchange[] = res;

          if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'walle.notRateList' });

          this._list$.next(list);

          resolve(list);
        });
    });
  }

  /**
   * 重加载汇率列表
   */
  flushExchange$(): Observable<Exchange[]> {
    return !this.isLoading ? from(this.updateExchange()) : of(this.list);
  }

  /**
   * 转换汇率 - 返回Observable<ExchangeConvertDetail>
   * @param value {BigNumber.Value} 被转换的值
   * @param valueCurrency {string} 被转换的币种
   * @param toCurrency {string} 目标汇率的币种，默认为USDT
   * @returns {Observable<BigNumber>}
   */
  transform$(value: BigNumber.Value, valueCurrency: string, toCurrency = 'USDT'): Observable<ExchangeConvertDetail> {
    return ((value, valueCurrency, toCurrency) => {
      const res: ExchangeConvertDetail = {
        value: value,
        sourceCurrency: valueCurrency,
        convertCurrency: toCurrency,
        result: new BigNumber(+value || 0),
      };
      if (!+value || !valueCurrency || valueCurrency === toCurrency) return of(res);

      // 从汇率列表中找到当前币种的汇率并计算当前汇率（USDT汇率的结果）
      const mapSource = (source) => {
        res.source = source;
        return new BigNumber(source?.rate || 0).multipliedBy(value);
      };

      // 如果目标币种是USDT，直接返回结果，否则继续计算最终需要兑换的汇率
      const mapTarget = (result) => {
        return this.getRate$(toCurrency).pipe(
          map((convert) => {
            res.convert = convert; // 记录目标币种的汇率

            // 继续计算最终需要兑换的汇率
            if (toCurrency !== 'USDT') {
              result = result.dividedBy(convert?.rate || 0);
            }

            // 如果目标币种是USDT，直接返回结果
            res.result = result;
            return result;
          })
        );
      };

      return this.getRate$(valueCurrency).pipe(
        map(mapSource),
        switchMap(mapTarget),
        map(() => res)
      );
    })(value, valueCurrency, toCurrency);
  }

  /**
   * 根据当前币种兑换成目标币种的汇率数值
   *  转换汇率 - 返回Observable<BigNumber>
   * @param value {BigNumber.Value} 被转换的值
   * @param valueCurrency {string} 被转换的币种
   * @param toCurrency {string} 目标汇率的币种，默认为USDT
   * @returns {Observable<BigNumber>}
   */
  transformValue$(value: BigNumber.Value, valueCurrency: string, toCurrency = 'USDT'): Observable<BigNumber> {
    return this.transform$(value, valueCurrency, toCurrency).pipe(map((e) => e.result));
  }

  /**
   * 转换汇率 - 返回number
   * @param value {BigNumber.Value} 被转换的值
   * @param valueCurrency {string} 被转换的币种
   * @param toCurrency {string} 目标汇率的币种，默认为USDT
   * @returns {Observable<number>}
   */
  transformNumber$(value: BigNumber.Value, valueCurrency: string, toCurrency = 'USDT'): Observable<number> {
    return this.transformValue$(value, valueCurrency, toCurrency).pipe(map((e) => e.toNumber()));
  }

  /**
   * 转换汇率 - 返回string
   * @param value {BigNumber.Value} 被转换的值
   * @param valueCurrency {string} 被转换的币种
   * @param toCurrency {string} 目标汇率的币种，默认为USDT
   * @returns {Observable<string>}
   */
  transformString$(value: BigNumber.Value, valueCurrency: string, toCurrency = 'USDT'): Observable<string> {
    return this.transformValue$(value, valueCurrency, toCurrency).pipe(map((e) => e.toString()));
  }

  /**
   * 获取汇率
   * @param currency
   * @returns {number}
   */
  getRate$(currency: string): Observable<Exchange | undefined> {
    return this._list$.pipe(
      filter((list) => !!list.length),
      map((list) => {
        const curRateItem = list.find((e) => e.currency === currency);

        if (!curRateItem) {
          this.appService.showToastSubject.next({
            msgLang: 'walle.notRate',
            msgArgs: { coin: currency },
            key: `walle.notRate.` + currency,
          });
        }

        return curRateItem;
      })
    );
  }
}
