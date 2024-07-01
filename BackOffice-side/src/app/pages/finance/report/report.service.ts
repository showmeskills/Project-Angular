import { Component, EventEmitter, Injectable, Input, OnInit } from '@angular/core';
import { SelectApi } from 'src/app/shared/api/select.api';
import { filter, from, lastValueFrom, mergeWith, Observable, share, zip } from 'rxjs';
import { GameCategory } from 'src/app/shared/interfaces/game';
import { map, switchMap, tap } from 'rxjs/operators';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { SupplierApi } from 'src/app/shared/api/supplier';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { AppService } from 'src/app/app.service';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { ComponentType } from '@angular/cdk/portal';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { EventIdItem, WagerDetailComponent, WagerDetailUpdateConfig } from 'src/app/shared/interfaces/wager';
import { CommonModule } from '@angular/common';

import { StatusService } from 'src/app/shared/interfaces/status';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import {
  SupplierReportGameModule,
  SupplierReportPayoutModule,
  SupplierReportTransactionSummary,
} from 'src/app/shared/interfaces/supplier';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { ThemeTypeEnum } from 'src/app/shared/interfaces/base.interface';
import { WagerApi } from 'src/app/shared/api/wager.api';

@Injectable()
export class ReportDetailService {
  constructor(
    private selectApi: SelectApi,
    private subHeader: SubHeaderService,
    private api: SupplierApi,
    private modalService: MatModal,
    private appService: AppService,
    private lang: LangService,
    private wagerApi: WagerApi
  ) {}

  /**
   * 数据统计和币种统计
   */
  payoutModule?: SupplierReportPayoutModule | undefined;

  /**
   * 交易统计类目
   */
  transactionSummary?: SupplierReportTransactionSummary | undefined;

  /**
   * 供应商统计类目
   */
  gameModule: SupplierReportGameModule[] = [];

  /**
   * 当前tab 分类
   */
  category: GameCategory = 'SportsBook';

  /**
   * 供应商列表
   */
  providerList: any[] = [];

  /**
   * 当前供应商数据
   */
  get curProviderData() {
    return this.providerList.find((e) => e.id === this.data.provider);
  }

  /** 赛事ID */
  eventIdList: EventIdItem[] = [];

  /**
   * 提交事件
   */
  confirm = new EventEmitter<boolean>();

  /**
   * 数据统计
   */
  statItem = [
    {
      name: '累计交易',
      lang: 'game.provider.total_trans',
      icon: './assets/images/svg/info-up.svg',
      key: 'transactionAmount',
      class: ['color-purple', 'bg-purple'],
    },
    {
      name: '累计输赢',
      lang: 'game.provider.total_win',
      icon: './assets/images/svg/info-bag.svg',
      key: 'payoutAmount',
      class: ['color-blue', 'bg-skyblue'],
    },
    {
      name: '今日交易',
      lang: 'game.provider.day_trade',
      icon: './assets/images/svg/info-up.svg',
      key: 'todayTransactionAmount',
      class: ['color-purple', 'bg-purple'],
    },
    {
      name: '今日输赢',
      lang: 'game.provider.day_win',
      icon: './assets/images/svg/info-bag.svg',
      key: 'todayPayoutAmount',
      class: ['color-blue', 'bg-skybluee'],
    },
    {
      name: '当日反水金额',
      lang: 'game.provider.day_return',
      icon: './assets/images/svg/info-box.svg',
      key: 'todayBackWaterAmount',
      class: ['color-grass', 'bg-grass'],
    },
    {
      name: '今日取消单据',
      lang: 'game.provider.day_cancel',
      icon: './assets/images/svg/info-order.svg',
      key: 'todayCancelQuantity',
    },
    {
      name: '今天活跃用户人数',
      lang: 'game.provider.day_activeCount',
      icon: './assets/images/svg/info-box.svg',
      key: 'todayActiveCount',
      class: ['color-grass', 'bg-grass'],
    },
  ];

  /**
   * 筛选数据
   */
  EMPTY_DATA = {
    /** 交易记录 */
    uid: '', // uid
    principal: '', // 本金
    principalType: 'gt', // 本金类型(大于gt，小于lt)
    status: '', // 状态
    tradeTime: [] as Date[], // 日期
    currency: '', // 币种
    order: '', // 订单号
    gameName: '', // 赛事名称 / 赛事GameId
    eventId: '', // 赛事Id

    /** 交易统计 */
    tradeChartTime: [
      new Date(toDateStamp(moment().subtract(6, 'days').toDate())!),
      new Date(toDateStamp(new Date(), true)!),
    ], // 日期

    /** 交易记录 && 交易统计 */
    provider: '', // 游戏厂商
  };

  data = cloneDeep(this.EMPTY_DATA);

  /**
   * 状态
   */
  readonly statusList: StatusService[] = [
    { name: '未结算', value: 'Unsettlement', type: ThemeTypeEnum.Warning, lang: ['game.unset'], langArgs: {} },
    { name: '已结算', value: 'Settlement', type: ThemeTypeEnum.Success, lang: ['game.alset'], langArgs: {} },
    { name: '重新结算', value: 'ReSettle', type: ThemeTypeEnum.Info, lang: ['game.reset'], langArgs: {} },
    { name: '错误', value: 'Error', type: ThemeTypeEnum.Danger, lang: ['game.error'], langArgs: {} },
    { name: '已取消', value: 'Cancel', type: ThemeTypeEnum.Primary, lang: ['game.canceled'], langArgs: {} },
    { name: '确认中', value: 'Confirm', type: ThemeTypeEnum.Default, lang: ['game.confirming'], langArgs: {} },
    { name: '待接收', value: 'NoAccept', type: ThemeTypeEnum.Yellow, lang: ['game.wait_receive'], langArgs: {} },
  ];

  getState = (status: string): StatusService | undefined => {
    const stateList = cloneDeep(this.statusList);

    return stateList.find((e) => e.value === status) || ({ langArgs: {} } as any);
  };

  async getStateText(status) {
    const item = this.getState(status);

    if (!item?.lang?.length) return Promise.resolve('');

    return this.lang.getOneArr(item.lang, item.langArgs);
  }

  async getStateLabel(status) {
    const item = this.getState(status);
    let text = '';

    if (item?.lang?.length) {
      text = (await this.lang.getOneArr(item.lang, item.langArgs)) || '';
    }

    return { ...item, text: text || '' };
  }

  /**
   * 配置
   */
  options = {
    graph: true, // 是否请求图表数据
  };

  /**
   * 获取供应商列表
   */
  pullProviderList$() {
    return this.selectApi.getProviderSelect(this.subHeader.merchantCurrentId, this.category).pipe(
      tap((provider) => {
        this.providerList = provider;
        this.data.provider = '';
      })
    );
  }

  /**
   * 交易记录 - 获取赛事ID列表
   */
  pullEventIdList$() {
    const params = {
      tenantId: this.subHeader.merchantCurrentId,
      gameCategory: this.category,
      gameProvider: this.data.provider,
    };

    return this.wagerApi.getEventIdList(params).pipe(
      tap((res) => {
        this.eventIdList = Array.isArray(res) ? res : [];
        this.data.gameName = '';
        this.data.eventId = '';
      })
    );
  }

  /**
   * 初始化
   */
  loadData$(category: GameCategory, options?: typeof this.options): Observable<boolean> {
    this.category = category;
    this.options = { ...this.options, ...options };

    return this.subHeader.merchantId$.pipe(
      switchMap(() => zip(this.pullProviderList$(), this.pullEventIdList$())),
      map(() => true),
      mergeWith(this.confirm)
    );
  }

  /**
   * 交易记录 - 时间是否超过90天
   */
  timeChecking() {
    const maxDay = 90;
    // 没有时间范围
    if (!(this.data.tradeTime?.[0] && this.data.tradeTime?.[1])) return false;
    const start = toDateStamp(this.data.tradeTime[0], false);
    const end = toDateStamp(this.data.tradeTime[1], true);
    if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return false;
    return true;
  }

  /**
   * 交易统计 - 获取图表数据流
   */
  getGraphData$() {
    return this.api
      .getSupPlierGamestat({
        TenantId: this.subHeader.merchantCurrentId,
        GameCategory: this.category,
        GameProvider: this.data.provider,
        startTime: moment(Number(toDateStamp(this.data.tradeChartTime[0], false))).format('YYYY-MM-DD'),
        endTime: moment(Number(toDateStamp(this.data.tradeChartTime[1], false))).format('YYYY-MM-DD'),
      })
      .pipe(
        tap((res) => {
          if (res) {
            // 翻转的数据
            this.payoutModule = res.payoutModule || undefined;
            // 交易统计
            this.transactionSummary = res.transactionSummary || undefined;
            // 供应商统计
            this.gameModule = res.gameModule || [];
          }
        })
      );
  }

  /**
   * 重置筛选数据
   */
  resetFilterData() {
    this.data = cloneDeep(this.EMPTY_DATA);
  }

  /**
   * 重置筛选数据并触发提交事件
   */
  resetFilter() {
    this.resetFilterData();
    this.confirm.emit(true);
  }

  /**
   * 交易记录 - 获取状态标签
   * @param status
   */
  getStatusLabel(status: string) {
    return this.statusList.find((item) => item.value === status)?.name || '';
  }

  /** 交易记录 - 导出的时间检验 */
  private invalidExportTime() {
    const startTime: any = this.data.tradeTime[0] ? this.data.tradeTime[0].getTime() : 0;
    const endTime: any = this.data.tradeTime[1] ? this.data.tradeTime[1].getTime() : 0;
    const time = (endTime - startTime) / (1000 * 60 * 60 * 24);

    const invalid = time >= 7;

    if (invalid) this.appService.showToastSubject.next({ msgLang: 'game.exceedTime' });

    return invalid;
  }

  /**
   * 交易记录 - 生成导出的数据
   * @param isAll 是否导出全部
   * @param list 导出本页的列表
   * @param getAllList$ 获取全部列表的流
   */
  async generateExportExcel(isAll: boolean, list: any[], getAllList$: Observable<any>) {
    let exportList: any = [];

    // 导出全部
    if (isAll) {
      if (this.invalidExportTime()) return;

      this.appService.isContentLoadingSubject.next({ loading: true, msgLang: 'common.exporting' });
      exportList = (await lastValueFrom<any>(getAllList$))?.list || [];
      this.appService.isContentLoadingSubject.next(false);
    } else {
      // 导出本页
      exportList = list;
    }

    if (!exportList?.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.emptyText',
        successed: false,
      });
    }

    return exportList;
  }

  /**
   * 交易记录 - 获取请求参数
   */
  getParams() {
    return {
      WagerStatus: this.data.status,
      TenantId: this.subHeader.merchantCurrentId,
      UID: this.data.uid || undefined,
      GameProvider: this.data.provider || undefined,
      WagerNumber: this.data.order || undefined,
      CreateTimeStart: toDateStamp(this.data.tradeTime[0], false) || 0,
      CreateTimeEnd: toDateStamp(this.data.tradeTime[1], true) || 0,
      Currency: this.data.currency,
      AmtCompare: this.data.principalType, // 本金类型(大于gt，小于lt)
      Principal: this.data.principal,
      GameName:
        this.category === 'SportsBook'
          ? this.data.gameName
          : this.eventIdList.find((v) => v.id === this.data.eventId)?.gameId || '',
    };
  }

  /**
   * 交易记录 - 打开详情弹窗
   */
  async openDetail<T extends WagerDetailComponent, R = any, D = any>(
    detailRequest$: Observable<R>,
    detailComponent: ComponentType<T>,
    loading?: (v: boolean) => void
  ) {
    const data: {
      ref: MatModalRef<T, D>;
      detail: R;
      reload: Observable<WagerDetailUpdateConfig>;
    } = {} as any;

    const loadingFn = loading || ((v) => this.appService.isContentLoadingSubject.next(v));
    const fetchDetail = async () => {
      loadingFn(true);
      try {
        data.detail = await lastValueFrom(detailRequest$);

        if (!data.detail || data.detail?.['error']) {
          this.appService.showToastSubject.next({ msgLang: 'game.failedInformation' });
          throw new Error(data.detail?.['error'] || 'report detail error');
        }
      } finally {
        loadingFn(false);
      }
    };

    await fetchDetail();

    data.ref = this.modalService.open(detailComponent, {
      width: '800px',
    });
    data.ref.componentInstance.detailData = data.detail;

    // 接收返回值，重新更新一遍
    data.reload = data.ref.componentInstance.update.pipe(
      filter((v) => v.reload),
      switchMap((updateRes: WagerDetailUpdateConfig) => {
        return from(fetchDetail()).pipe(
          tap(() => {
            data.ref.componentInstance.detailData = data.detail;
          }),
          map(() => updateRes)
        );
      }),
      share() // 热流，防止多次订阅触发多次更新
    );

    // 内部订阅更新详情数据
    data.reload.subscribe();

    return data;
  }
}

@Component({
  selector: 'bet-status-label,[betStatusLabel]',
  template: `
    <app-label *ngIf="data.text; else tpl" [class.cursor-pointer]="pointer" [type]="data.type">{{
      data.text
    }}</app-label>
    <ng-template #tpl>
      <span [class.cursor-pointer]="pointer">{{ status }}</span>
    </ng-template>
  `,
  standalone: true,
  imports: [CommonModule, LabelComponent],
  providers: [ReportDetailService],
})
export class BetStatusLabel implements OnInit {
  constructor(public reportDetailService: ReportDetailService) {}

  @Input('pointer') pointer = false;

  @Input('betStatusLabel') set betStatusLabel(v) {
    this.status = v;
    this.reportDetailService.getStateLabel(v).then((item) => {
      this._data = item;
    });
  }

  status = '';
  @Input('status') set _status(v) {
    this.status = v;
    this.reportDetailService.getStateLabel(v).then((item) => {
      this._data = item;
    });
  }

  private _data: any = {};
  get data() {
    return this._data;
  }

  ngOnInit(): void {}
}
