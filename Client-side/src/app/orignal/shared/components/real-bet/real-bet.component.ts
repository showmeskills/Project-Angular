import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OrignalService } from 'src/app/orignal/orignal.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { environment } from 'src/environments/environment';
import { LocaleService } from '../../services/locale.service';
@UntilDestroy()
@Component({
  selector: 'orignal-real-bet',
  templateUrl: './real-bet.component.html',
  styleUrls: ['./real-bet.component.scss'],
})
export class RealBetComponent implements OnInit {
  /** 当前选择币种信息 */
  @Input() currentCurrencyData?: CurrenciesInterface;
  realHistoryList: any = [];
  currencies!: CurrenciesInterface[];
  /** 赔率-计算可赢金额 */
  @Input() type!: string;
  constructor(
    private orignalService: OrignalService,
    private appService: AppService,
    private localeService: LocaleService,
  ) {
    // this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
    //   console.log(x)
    //   if (x.length > 0) {
    //     this.currencies = x.filter(v => v.isVisible);
    //   }
    // });
    // this.orignalService.realHistoryList$.pipe(untilDestroyed(this)).subscribe(v => {
    //   console.log(v)
    //   if (v.length) {
    //     v.forEach((e: any) => {
    //       if (e.stop) {
    //         e.stop = Number(e.stop).toDecimal(2);
    //       }
    //       e.BetAmount = Number(e.BetAmount).toDecimal(8);
    //       let data = this.currencies.filter((j: any) => j.currency == e.currency)
    //       if (data.length > 0) {
    //         e.icon = data[0].icon
    //       }
    //     })
    //     this.realHistoryList = v;
    //   } else {
    //     this.realHistoryList = []
    //   }
    // });
    const tenant = environment.common.tenant; //商户Id
    combineLatest([this.appService.currencies$, this.orignalService.realHistoryList$])
      .pipe(untilDestroyed(this))
      .subscribe(([currencies, v]) => {
        if (currencies && v.length) {
          console.log(v);
          v.forEach((e: any) => {
            if (e.stop) {
              e.stop = Number(e.stop).toDecimal(2);
            }
            e.BetAmount = Number(e.BetAmount).toDecimal(8);
            const data = currencies.filter((j: any) => j.currency == e.currency);
            if (data.length > 0) {
              e.icon = data[0].icon;
            }
            let max_chars = 9;
            const rep = /[.]/;
            if (rep.test(e.BetAmount)) {
              max_chars = 10;
            }
            e.BetAmount = e.BetAmount.substr(0, max_chars);
            e.userName = e.userName ? e.userName : this.localeService.getValue('invisible');
          });

          this.realHistoryList = v.filter((e: any) => Number(tenant) == Number(e.mainAccountId.substring(0, 2)));
          // this.realHistoryList = v;
        } else {
          this.realHistoryList = [];
        }
      });
  }
  ngOnInit() {}
}
