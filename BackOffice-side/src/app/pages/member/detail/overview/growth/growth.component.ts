import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MemberService } from '../../../member.service';
import { filter, finalize, lastValueFrom } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { VipApi } from 'src/app/shared/api/vip.api';
import { WinDirective } from 'src/app/shared/directive/common.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { cloneDeep } from 'lodash';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { VipPointsLevelsRecordItem, VipPointsRecordSum } from 'src/app/shared/interfaces/vip';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';

@Component({
  selector: 'growth',
  templateUrl: './growth.component.html',
  styleUrls: ['./growth.component.scss'],
  standalone: true,
  imports: [
    ProgressComponent,
    NgFor,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    WinDirective,
    FormRowComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    EmptyComponent,
    VipNamePipe,
    LabelComponent,
    LoadingDirective,
  ],
})
export class GrowthComponent implements OnInit {
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private memberService: MemberService,
    private vipApi: VipApi,
    public lang: LangService
  ) {
    const { uid, id, tenantId } = activatedRoute.snapshot.queryParams; // params参数;
    this.mid = id;
    this.uid = uid;
    this.tenantId = tenantId;
  }

  mid!: number;
  uid!: string;
  tenantId!: string;

  /** 页大小 */
  pageSizes: number[] = [...PageSizes];
  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 是否处于加载 */
  isLoading = false;

  /** VIPA保级进度 */
  processKeep = 0;

  /** 积分统计数据 */
  sumData: VipPointsRecordSum;

  /** 当前tab */
  curTabValue = 1;
  /** tab列表 */
  tabList = [
    {
      name: '积分记录',
      lang: 'member.list.pointsRecord',
      value: 1,
    },
    { name: '升级记录', lang: 'member.list.upgradeRecord', value: 2 },
  ];

  /** 筛选 - VIP等级列表 */
  vipList: { name: string; value: number }[] = [];

  /** 筛选 - 积分记录：类型列表 */
  typeList: Tabs[] = [
    { name: '存款', lang: 'member.list.deposit', value: 'deposit' },
    { name: '投注流水', lang: 'member.list.bet', value: 'bet' },
    { name: '体育投注流水', lang: 'member.list.sportsBettingTurnover', value: 'betSport' },
    { name: '登陆', lang: 'member.list.login', value: 'login' },
    { name: '设置头像', lang: 'member.list.setAvatar', value: 'avatar' },
    { name: '设置昵称', lang: 'member.list.setNickname', value: 'nickName' },
    { name: '绑定手机', lang: 'member.list.bindPhone', value: 'bindPhone' },
    { name: '绑定谷歌', lang: 'member.list.bindGoogle', value: 'bindGoogle' },
    { name: 'KYC中级', lang: 'member.list.kycIntermediate', value: 'kycMiddle' },
    { name: 'KYC高级', lang: 'member.list.kycAdvanced', value: 'kycHigh' },
    { name: '2fa验证', lang: 'member.list.twoFverification', value: '2fa' },
  ];

  dataEmpty = {
    vipLevelList: [], // 积分记录：VIP等级; 升级记录：之后VIP等级
    type: '', // 积分记录：类型
    status: '', // 升级记录：状态
    afterLevelList: [], // 升级记录：之后VIP等级
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  list: VipPointsLevelsRecordItem[] = [];

  /** 是否商户5 - SIT：28; PROD: 20 */
  get isFiveMerchant() {
    return ['20', '28'].includes(this.tenantId);
  }

  ngOnInit(): void {
    // 获取 积分统计
    this.getGrowUpPointsSum();

    // 获取 VIPA保级进度
    this.memberService.processKeep.pipe(filter((e) => e !== '')).subscribe((processKeep) => {
      this.processKeep = processKeep || 0;
    });

    // 获取 VIP等级
    this.getVipLevelList();

    this.onReset();
  }

  /** tab - 选择 */
  onSelectTab(value: number) {
    this.curTabValue = value;
    this.list = [];
    this.onReset();
  }

  /** 列表初始化请求 */
  loadData(resetPage = false) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadData$(resetPage)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.data?.records) ? res?.data?.records : [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const params = {
      tenantId: this.tenantId,
      uid: this.uid,
      queryStartTimestamp: toDateStamp(this.data.time[0]),
      queryEndTimestamp: toDateStamp(this.data.time[1], true),
      pageNum: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    const pointsParams = {
      sourcePoints: this.data.type,
      vipLevelList: this.data.vipLevelList,
    };

    const levelParams = {
      ...(this.data.vipLevelList.length ? { afterLevelList: this.data.vipLevelList } : {}),
      ...(this.data.status ? { remark: this.data.status } : {}),
    };

    // 积分记录
    if (this.curTabValue === 1) {
      return this.vipApi[this.isFiveMerchant ? 'vipc_manage_points_record_list' : 'vipa_manage_points_record_page']({
        ...params,
        ...pointsParams,
      });
    }
    // 升级记录
    else {
      return this.vipApi[this.isFiveMerchant ? 'vipc_manage_level_record_list' : 'getLevelRecordList']({
        ...params,
        ...levelParams,
      });
    }
  }

  /** 获取VIP等级列表 */
  getVipLevelList() {
    this.vipApi.vip_manage_level_simple_list(+this.tenantId).subscribe((res) => {
      if (res?.code === '0000' && Array.isArray(res?.data))
        this.vipList = res.data.map((v) => ({ name: v?.vipName, value: v?.vipLevel }));
    });
  }

  /** 积分统计 - 获取 */
  getGrowUpPointsSum() {
    this.appService.isContentLoadingSubject.next(true);
    this.vipApi[this.isFiveMerchant ? 'vipc_report_summarybypoints' : 'vipa_manage_points_record_sum'](
      this.uid,
      this.tenantId
    ).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res.code === '0000') this.sumData = res?.data;
    });
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 获取 积分记录：事项名称
   * @eventType
   * deposit:存款, bet:投注流水, betSport:体育投注流水, login:登陆, avatar:设置头像, nickName:设置昵称,
   * bindPhone:绑定手机, bindGoogle:绑定谷歌, kycMiddle:KYC中级, kycHigh:KYC高级, 2fa:2fa验证
   */
  getEventName(eventType: string) {
    return this.typeList.find((v) => v.value === eventType)?.lang || 'common.unknown';
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list = this.list;

    if (isAll) {
      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.data?.records) ? res?.data?.records : [];
        this.list = list;
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const growthTime = await this.lang.getOne('member.list.growthTime'); // 时间
    const growthOrder = await this.lang.getOne('member.list.growthOrder'); // 单号
    const currentGrowthValue = await this.lang.getOne('member.list.currentGrowthValue'); // 现在成长值

    const type = await this.lang.getOne('common.type'); // 积分记录：类型
    const level = await this.lang.getOne('member.list.level'); // 积分记录：等级
    const variationOfPoints = await this.lang.getOne('member.list.variationOfPoints'); // 积分记录：成长值变化

    const beforeLevel = await this.lang.getOne('member.list.beforeLevel'); // 升级记录：之前等级
    const afterLevel = await this.lang.getOne('member.list.afterLevel'); // 升级记录：之后等级
    const status = await this.lang.getOne('common.status'); // 升级记录：状态

    const typeDesc = {
      ['deposit']: await this.lang.getOne('member.list.deposit'),
      ['bet']: await this.lang.getOne('member.list.bet'),
      ['betSport']: await this.lang.getOne('member.list.sportsBettingTurnover'),
      ['login']: await this.lang.getOne('member.list.login'),
      ['avatar']: await this.lang.getOne('member.list.setAvatar'),
      ['nickName']: await this.lang.getOne('member.list.setNickname'),
      ['bindPhone']: await this.lang.getOne('member.list.bindPhone'),
      ['bindGoogle']: await this.lang.getOne('member.list.bindGoogle'),
      ['kycMiddle']: await this.lang.getOne('member.list.kycIntermediate'),
      ['kycHigh']: await this.lang.getOne('member.list.kycAdvanced'),
      ['2fa']: await this.lang.getOne('member.list.twoFverification'),
    };

    const statusDesc = {
      ['downgrade']: await this.lang.getOne('member.list.downgrade'),
      ['downgrade30']: await this.lang.getOne('member.list.downgrade'),
      ['downgrade90']: await this.lang.getOne('member.list.downgrade'),
      ['upgrade']: await this.lang.getOne('member.list.upgrade'),
      ['keep']: await this.lang.getOne('member.list.keep'),
    };

    JSONToExcelDownload(
      list.map((e: VipPointsLevelsRecordItem) => ({
        [growthTime]: timeFormat(e.createTimeTimestamp),
        [growthOrder]: ExcelFormat.str(e.sourceId || e.id),
        ...(this.curTabValue === 1
          ? {
              [type]: typeDesc[e.sourcePoints],
              [level]: e.currentVipLevel,
              [variationOfPoints]: e.points,
            }
          : {
              [beforeLevel]: e.beforeLevel,
              [afterLevel]: e.afterLevel,
              [status]: statusDesc[e.remark],
            }),
        [currentGrowthValue]: e.currentTotalPoints || e.totalPoints || '-',
      })),

      'growth-list ' + Date.now()
    );
  }
}
