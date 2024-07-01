import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { finalize, lastValueFrom } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { MemberApi } from 'src/app/shared/api/member.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { DestroyService, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SelectApi } from 'src/app/shared/api/select.api';
import { BadDataDetailItem, BadDataItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'bad-data-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LabelComponent,
  ],
})
export class BadDataDetailComponent implements OnInit {
  constructor(
    public appService: AppService,
    public lang: LangService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private api: MemberApi,
    public subHeaderService: SubHeaderService,
    private selectAPI: SelectApi
  ) {
    const { id, tenantId } = activatedRoute.snapshot.queryParams; // params参数;

    this.id = +id;
    this.tenantId = tenantId;
  }

  id;
  tenantId;

  /** 不良数据信息 */
  badDatainfo: BadDataItem;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 类型 */
  categoryList = [
    { name: 'IP', lang: 'allPop.ip', value: 'IP' },
    { name: '邮箱', lang: 'auManage.sys.email', value: 'Email' },
    { name: '设备指纹', lang: 'risk.deviceFingerprint', value: 'Fingerprint' },
  ];

  /** 商户列表 */
  merchantList: { name: string; value: string }[] = [];

  dataEmpty = {
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: BadDataDetailItem[] = [];

  ngOnInit() {
    // 拉取商户资源
    this.getMerchantList();
    // 初始化
    this.onReset();
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        // 赋值详情
        if (res?.badDataConfig && !this.badDatainfo) this.badDatainfo = res.badDataConfig;
        // 赋值列表
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      BadDataId: this.id,
      ...(this.data.time[0]
        ? {
            startTime: toDateStamp(this.data.time[0]),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            endTime: toDateStamp(this.data.time[1], true),
          }
        : {}),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.querymemberbaddatadetail(parmas);
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 获取 商户列表 */
  getMerchantList() {
    this.appService.isContentLoadingSubject.next(true);
    this.selectAPI.getMerchantList().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.merchantList = Array.isArray(res) ? res : [];
    });
  }

  /** 获取 详情 - 类型 */
  getCategoryLang(value) {
    return this.categoryList.find((v) => v.value === value)?.lang || 'common.unknown';
  }

  /** 获取 详情/列表 - 品牌名称 */
  getMerchantName(tenantId) {
    return this.merchantList.find((v) => +v.value === tenantId)?.name || '-';
  }

  /** 获取 详情/列表 - 品牌名称 */
  getMerchantNameList(tenantIdList: number[] = []) {
    if (!tenantIdList?.length) return [];
    return this.merchantList.filter((v) => tenantIdList.includes(+v.value)) || [];
  }

  /**
   * 导出
   */
  async onExport() {
    let list: BadDataDetailItem[] = [];

    try {
      this.appService.isContentLoadingSubject.next(true);
      const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
      this.appService.isContentLoadingSubject.next(false);
      list = Array.isArray(res?.list) ? res.list : [];
    } finally {
      this.appService.isContentLoadingSubject.next(false);
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const value = await this.lang.getOne('risk.badData.value'); //  不良数据值
    const brand = await this.lang.getOne('risk.badData.brand'); //  品牌
    const addPerson = await this.lang.getOne('risk.badData.addPerson'); //  添加人
    const addTime = await this.lang.getOne('risk.badData.addTime'); //  添加时间

    JSONToExcelDownload(
      list.map((e, i) => ({
        ['ID']: i + 1,
        ['Bad_ID']: String(this.id),
        ['UID']: e.uid || '-',
        [value]: this.badDatainfo?.value,
        [brand]: this.getMerchantName(e.tenantId),
        [addPerson]: this.badDatainfo?.createdUserName,
        [addTime]: timeFormat(+e.createdTime),
      })),
      'bad-data-details-list ' + Date.now()
    );
  }
}
