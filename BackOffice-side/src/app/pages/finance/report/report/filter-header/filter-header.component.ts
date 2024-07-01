import { Component, Input, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { ReportDetailService } from 'src/app/pages/finance/report/report.service';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AsyncPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AppService } from 'src/app/app.service';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatSelectNoSpaceDirective } from 'src/app/shared/directive/matselect-no-space.directive';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { Currency } from 'src/app/shared/interfaces/currency';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'filter-header',
  templateUrl: './filter-header.component.html',
  styleUrls: ['./filter-header.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    CurrencyIconDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    LangPipe,
    NgIf,
    AsyncPipe,
    SearchDirective,
    SearchInpDirective,
    MatSelectNoSpaceDirective,
    NgTemplateOutlet,
  ],
})
export class FilterHeaderComponent implements OnInit {
  constructor(
    public appService: AppService,
    public currencyService: CurrencyService,
    public reportDetail: ReportDetailService,
    private destroy$: DestroyService,
    private route: ActivatedRoute
  ) {
    const { routeConfig } = this.route.snapshot;
    this.routeConfigPath = routeConfig?.path;
  }

  /** 路由路径 */
  routeConfigPath;

  /**
   * 当前类型
   * @type sport=体育，casino=游戏城，real=真人娱乐城，lottery=彩票，chess=棋牌
   */
  @Input() type: string;

  /** 本金列表 */
  principalTypeList: Tabs[] = [
    { lang: 'game.transactionRecord.gt', name: '大于', value: 'gt' },
    { lang: 'game.transactionRecord.lt', name: '小于', value: 'lt' },
  ];

  /** 币种列表 */
  currencyList: Currency[] = [];

  /** 是否统计列表页面 */
  get isListPage() {
    return this.routeConfigPath === 'transaction-report-list';
  }

  ngOnInit() {
    // 获取币种
    this.currencyService.list$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.currencyList = Array.isArray(res)
        ? [
            { code: 'CNY' },
            { code: 'USDT' },
            { code: 'EUR' },
            { code: 'VND' },
            ...res.filter((v) => !['CNY', 'USDT', 'EUR', 'VND'].includes(v.code)),
          ]
        : [];
    });
  }

  /** 选择游戏厂商 */
  onSelectProvider() {
    this.reportDetail.confirm.emit(true);

    // 统计列表页面下且不是体育，其他类型在选择厂商后，获取对应赛事ID列表
    this.isListPage && this.type !== 'sport' && this.reportDetail.pullEventIdList$().subscribe();
  }
}
