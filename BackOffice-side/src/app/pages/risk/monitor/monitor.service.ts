import { Injectable } from '@angular/core';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { cloneDeep } from 'lodash';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import {
  AllRiskStatusObjEnum,
  ReviewBaseStatusEnum,
  ReviewBaseStatusObjEnum,
  RiskReviewParams,
} from 'src/app/shared/interfaces/monitor';
import { JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { CodeDescription, ThemeType, ThemeTypeEnum } from 'src/app/shared/interfaces/base.interface';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { BehaviorSubject, combineLatestWith, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import moment from 'moment';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { DepositAppealComponent } from 'src/app/pages/risk/monitor/monitor-item/deposit-appeal/deposit-appeal.component';
import { RiskReviewComponent } from 'src/app/pages/risk/monitor/monitor-item/risk-review/risk-review.component';
import { OperationReviewComponent } from 'src/app/pages/risk/monitor/monitor-item/operation-review/operation-review.component';
import { NegativeClearComponent } from 'src/app/pages/risk/monitor/monitor-item/negative-clear/negative-clear.component';
import { AbnormalMembersComponent } from 'src/app/pages/risk/monitor/monitor-item/abnormal-members/abnormal-members.component';
import { KycReviewComponent } from 'src/app/pages/risk/monitor/monitor-item/kyc-review/kyc-review.component';
import { BatchReviewComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-review.component';
import { TransactionReviewComponent } from 'src/app/pages/risk/monitor/monitor-item/transaction-review/transaction-review.component';

/**
 * 监控类型枚举
 */
export const MonitorType = {
  All: '', // 全部
  Deposit: 'deposit', // 存款申诉
  RiskReview: 'riskReview', // 风控审核
  AdjustWallet: 'AdjustWallet', // 操作审核
  NegativeClear: 'NegativeClear', // 负值清零
  AbnormalMember: 'AbnormalMember', // 异常会员
  KycAudit: 'kycAudit', // KYC审核
  BatchReview: 'batchReview', // 批量审核
  Transaction: 'transaction', // 批量审核
} as const;

type MonitorTypeKey = keyof typeof MonitorType;
type MonitorTypeValue = (typeof MonitorType)[MonitorTypeKey];

/**
 * 服务返回的参数类型
 */
export interface MonitorServiceParams {
  tenantId: string; // 商户ID
  type: number; // tab切换值 1=实时监控 2=历史监控
  countryCode?: string; // 国家
  uid?: string; // 用户ID
  batchId?: string; // 批量ID
  formType?: RiskReviewParams['formType']; // 审核的文件类型
  status?: ReviewBaseStatusEnum; // 状态
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  page: number; // 当前页
  pageSize: number; // 每页条数
}

/**
 * 判断当前所选类型的对象
 */
type IsTypeFinal = Readonly<Record<MonitorTypeKey, boolean>>;

/**
 * 根据当前类型进行导出
 */
type ExportByType = Readonly<Record<MonitorTypeKey, <T extends Array<D>, D>(list: T) => void>>;

@Injectable({
  providedIn: 'root',
})
export class MonitorService {
  constructor(
    private langService: LangService,
    public subHeaderService: SubHeaderService,
    private appService: AppService,
    private riskApi: RiskApi
  ) {
    // 翻译类型语言
    const translateFn = async () => {
      const typeList = cloneDeep(this.monitorTypeList);
      for (const item of typeList) {
        item.langText = (await langService.getOne(item.lang, { $default: '' })) || '';
      }
      this.monitorTypeList = typeList;

      // 翻译状态语言
      for (let key of Object.keys(this.statusLang)) {
        this.statusLang[key].langText = (await langService.getOne(this.statusLang[key].lang, { $default: '' })) || '';
      }
    };
    translateFn();

    // 请求 审核文件类型下拉列表
    this.riskApi.getReviewFileSelect().subscribe((res) => {
      this.formTypeList = res;
    });
  }

  // PS: 自己管理内部的分页，如果是“全部”监听接收流数据为{ isAll: true, paginator }流，用当前传递的数据来接管，只展示item
  // PS: 以下待办事项
  // TODO: 导出：组件监听本服务导出的流根据流数据取决导出类型，调用本service的导出方法进行导出。本服务导出格式为：service.export.[type](list as any);
  //        ## 导出按钮事件
  //          - 清空上一次的导出数据。
  //          - 导出流发射的对象值{ excelExport(type, list[]), isExportAllByTime, params: { time: [], pageData: {page=1，pageSize=9e6 | 当前总分页数据} } }：
  //                - 导出回调函数：（必须调用，初始一个空数组变量，请求完赋值，在请求的final里执行导出的回调函数）
  //                    导出参数1：当前组件的类型
  //                    导出参数2：导出的列表数据
  //                - 导出类型：当页、按时间导出 isExportAllByTime: 是否根据时间导出
  //                - params：{ 时间数据、监控全局的分页数据（导出全部为：page=1，pageSize=9e6）}
  //        ## 组件内部：
  //          - 监听服务的导出流动作，拿到导出类型、时间数据、导出请求参数进行请求，
  //          - 初始一个空数组变量，开始loading，请求完赋值到空数组变量，finalize操作符执行导出的回调函数，结束loading
  //        ## 服务导出的回调函数：
  //          - 判断 isAll === false 时，直接调用当前自己类型下的导出：type为excel名
  //          - 判断 isAll === true 时，用一个原型为null的对象存储 { [type]: [] }，每调用一次回调就判断对象下的所有类型是否满足is显示的所有类型：大于等于表示全部导出完成，否则继续等待其他导出直到全部导出调用完成
  //          - 导出回调判断完成后，调用导出excel方法，根据对象key生成导出的excel表名，value为导出的数组数据
  // TODO 全部时空数据占位展示：准备一个对象，key分类 value为列表数组，在父级判断为全部类型时再判断这个对象所有值是否都有，没有就显示无数据组件
  // TODO 全部时分页管理：准备一个对象，key分类 value为分页对象，总total始终取每个分页对象最大的total

  /**
   * 监控类型翻译
   */
  statusLang: { [key: string]: { langText: string; lang: string; type: ThemeType } } = {
    [AllRiskStatusObjEnum.Normal]: { lang: 'risk.toSubmit', langText: '', type: ThemeTypeEnum.Primary },
    [AllRiskStatusObjEnum.Pending]: { lang: 'risk.pending', langText: '', type: ThemeTypeEnum.Warning },
    [AllRiskStatusObjEnum.Finish]: { lang: 'risk.pass', langText: '', type: ThemeTypeEnum.Success },
    [AllRiskStatusObjEnum.Rejected]: { lang: 'risk.reject', langText: '', type: ThemeTypeEnum.Danger },
    [AllRiskStatusObjEnum.Supplement]: { lang: 'risk.addWait', langText: '', type: ThemeTypeEnum.Info },
    [AllRiskStatusObjEnum.Processing]: { lang: 'risk.processing', langText: '', type: ThemeTypeEnum.Warning },
    [AllRiskStatusObjEnum.Cancel]: { lang: 'common.cancel', langText: '', type: ThemeTypeEnum.Danger },
    [AllRiskStatusObjEnum.TimeOut]: { lang: 'risk.expired', langText: '', type: ThemeTypeEnum.Warning },
  };

  /**
   * 页大小
   */
  pageSizes: number[] = PageSizes;

  /**
   * 分页
   */
  paginator: PaginatorState = new PaginatorState(); // 分页

  /**
   * 筛选 - 审核类型列表
   * @UsageNotes
   * > 初始化会自动翻译lang字段的结果保存到langText字段
   */
  public monitorTypeList = [
    // { name: '全部', langText: '', lang: 'common.all', value: MonitorType.All },
    {
      name: '存款申诉',
      langText: '',
      lang: 'risk.depositApply',
      value: MonitorType.Deposit,
      component: DepositAppealComponent,
    },
    {
      name: '风控审核',
      langText: '',
      lang: 'risk.riskReview',
      value: MonitorType.RiskReview,
      component: RiskReviewComponent,
    },
    {
      name: '操作审核',
      langText: '',
      lang: 'risk.actCheck',
      value: MonitorType.AdjustWallet,
      component: OperationReviewComponent,
    },
    {
      name: '负值清零',
      langText: '',
      lang: 'risk.negativeClear',
      value: MonitorType.NegativeClear,
      component: NegativeClearComponent,
    },
    {
      name: '异常会员',
      langText: '',
      lang: 'risk.unnormal',
      value: MonitorType.AbnormalMember,
      component: AbnormalMembersComponent,
    },
    {
      name: 'KYC审核',
      langText: '',
      lang: 'risk.kycAudit',
      value: MonitorType.KycAudit,
      component: KycReviewComponent,
    },
    {
      name: '返水审核',
      langText: '',
      lang: 'risk.transaction',
      value: MonitorType.Transaction,
      component: TransactionReviewComponent,
    },
    {
      name: '批量审核',
      langText: '',
      lang: 'risk.batchReview',
      value: MonitorType.BatchReview,
      component: BatchReviewComponent,
    },
  ];

  // TODO 公开一个函数去更新最大total数，然后比较更新到 page.total里

  /**
   * 监控类型对象枚举
   * @protected
   */
  public readonly type = MonitorType;

  /**
   * 筛选 - 当前选中的审核类型
   */
  private _curType: MonitorTypeValue = MonitorType.Deposit;

  get curType() {
    return this._curType;
  }

  set curType(value: MonitorTypeValue) {
    this._curType = value;
    this.computeCurrentType();
  }

  private _curType$ = new BehaviorSubject(this._curType).pipe(
    tap(() => {
      this.change$['_value'] = true;
    })
  );

  /**
   * 当前审核类型，外部仅订阅
   */
  get curType$() {
    return this._curType$;
  }

  /**
   * 审核的文件类型下拉列表
   */
  public formTypeList: CodeDescription[] = [];

  /**
   * 导出触发流
   */
  public exportExcel$ = new Subject<{ isAll: boolean; params: MonitorServiceParams; exportExcel: ExportByType }>();

  /**
   * 是否全部类型
   */
  get isAllType() {
    return this.curType === MonitorType.All;
  }

  /**
   * 实时监控和历史记录
   * > 部分请求参数：1=待审核 2=历史记录
   */
  tabList = [
    { name: '实时监控', lang: 'dashboard.monitor', value: 1 },
    { name: '历史记录', lang: 'risk.history', value: 2 },
  ];

  /**
   * 实时监控和历史记录的tab切换
   */
  private _curTab = 1;
  get curTab() {
    return this._curTab;
  }

  set curTab(val) {
    this._curTab = val;
    this._curTab$.next(val);
  }

  /**
   * tab切换
   * @param val
   */
  onTab(val: number) {
    this.paginator.page = 1;
    this.data = cloneDeep(this.dataEmpty);
    this.curTab = val;
  }

  /**
   * 实时监控和历史记录的tab切换
   * @private
   */
  private _curTab$ = new BehaviorSubject(1);

  /**
   * 实时监控和历史记录的tab切换，外部仅订阅
   */
  get curTab$() {
    return this._curTab$.asObservable();
  }

  /**
   * 初始化筛选条件
   */
  private dataEmpty = {
    batchId: '', // 批量ID

    // 实时监控
    uid: '',
    formType: '' as RiskReviewParams['formType'], // 审核文件的类型
    time: [moment().subtract(3, 'day').add(1, 'days').toDate(), new Date()] as Date[], // 初始化默认3天
    countryCode: '', // 国家

    // 历史记录
    status: '' as '' | ReviewBaseStatusEnum, // 状态
  };

  /**
   * 筛选条件的对象
   */
  data = cloneDeep(this.dataEmpty);

  /**
   * 获取筛选参数
   * ps: 如果是全部这里不合page进去
   */
  getParams<T extends Object>(sendData?: T): T & MonitorServiceParams {
    const params: MonitorServiceParams = {
      tenantId: this.subHeaderService.merchantCurrentId,
      type: this._curTab, // tab切换
      countryCode: this.data.countryCode || undefined,
      uid: this.data.uid.trim() || undefined,
      formType: this.data.formType,
      status: ((this._curTab === 1 ? ReviewBaseStatusObjEnum.Pending : this.data.status) || undefined) as
        | undefined
        | ReviewBaseStatusEnum,
      startTime: toDateStamp(this.data.time[0], false) || undefined,
      batchId: this.data.batchId.trim() || undefined,
      endTime: toDateStamp(this.data.time[1], true) || undefined,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    const res = Object.assign(params, sendData);

    // 如果是 “全部类型” 用服务自己内部的分页
    if (this.isAllType) {
      res.page = this.paginator.page;
      res.pageSize = this.paginator.pageSize;
    }

    return res;
  }

  /**
   * 当前审核类型数据
   */
  get currentTypeItem() {
    return this.monitorTypeList.find((e) => e.value === this.curType);
  }

  /**
   * 是否当前审核类型
   */
  public isType(type: MonitorTypeValue) {
    return this.curType === type;
  }

  /**
   * 计算当前审核类型 结果设置到is对象中
   */
  private computeCurrentType() {
    Object.keys(this.is).forEach((key) => {
      this.is[key] = this.isType(MonitorType[key]);
    });
  }

  /**
   * 判断当前所选类型的对象
   */
  public readonly is: IsTypeFinal = (() => {
    const OriginObj = { ...MonitorType };
    const obj: IsTypeFinal = Object.create(null); // 创建一个空对象（原型是null的空对象）

    Object.keys(OriginObj).forEach((key) => {
      obj[key] = this.isType(OriginObj[key]);
    });

    return obj;
  })();

  /**
   * 重置筛选
   */
  reset() {
    this.data = cloneDeep(this.dataEmpty);
    this.reload(true);
  }

  /**
   * 刷新数据
   */
  reload(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.change$.next(resetPage);
  }

  /**
   * 手动触发重新请求数据
   * - 参数 {boolean} 参数为是否重置分页
   */
  public change$ = new BehaviorSubject<boolean>(true);

  /**
   * 监控tab、商户、和参数变动手动触发
   */
  public reload$() {
    return this.change$.pipe(
      combineLatestWith(
        // PS: 如果类似商户变动修改当前所选分类，在这里的商户pipe里去做下划线无触发的方式修改（_curType='all'），外部修改的话会触发流的值导致请求多次
        this.subHeaderService.merchantId$.pipe(tap(() => (this.change$['_value'] = true))),
        this._curTab$.pipe(tap(() => (this.change$['_value'] = true))) // tab分类切换
      )
    );
  }

  /**
   * 生成根据类型导出
   * @param isAll
   */
  public readonly exportExcel: ExportByType = (() => {
    const OriginObj = { ...MonitorType };
    const obj: ExportByType = Object.create(null); // 创建一个空对象（原型是null的空对象）

    Object.keys(OriginObj).forEach((key) => {
      obj[key] = this._exportExcel.bind(this, OriginObj[key]);
    });

    return obj;
  })();

  /**
   * 导出
   */
  private _exportExcel(key: MonitorTypeKey, list: any[]) {
    if (!list || !list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    // TODO Freeze: 如果是 "全部" 的类型这里做收集除了 all，其他的类型的数据往里面塞，然后做判断如果都调用了导出，最后再统一做所有导出
    JSONToExcelDownload(
      list,
      `${key}-${this.curTab === 1 ? 'pending' : 'history'} ${moment().format('YYYY-MM-DD HH:mm:ss')}`
    );
  }

  /**
   * 触发导出
   * @param isAll
   */
  triggerExport(isAll: boolean) {
    // TODO Freeze: 这里导出前 先清空之前保存数据，然后再调用导出流进行收集
    // TODO Freeze: 封装一个按钮菊花loading的方法，调用的时候使用加载样式，再禁止按钮。避免多次导出

    // 全选校验导出的时间范围
    if (isAll) {
      const maxDay = 7;
      const thrErr = () =>
        this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });
      // 没有时间范围
      if (!(this.data.time?.[0] && this.data.time?.[1])) return thrErr();

      const start = toDateStamp(this.data.time[0], false);
      const end = toDateStamp(this.data.time[1], true);
      if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();
    }

    this.exportExcel$.next({ isAll, params: this.getParams(), exportExcel: this.exportExcel });
  }
}
