import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { takeUntil } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { FingerprintItem, FingerprintDetialItem } from 'src/app/shared/interfaces/risk';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'device-fingerprint',
  templateUrl: './device-fingerprint.component.html',
  styleUrls: ['./device-fingerprint.component.scss'],
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
    LoadingDirective,
    LabelComponent,
    AngularSvgIconModule,
    CurrencyValuePipe,
    CurrencyIconDirective,
  ],
})
export class DeviceFingerprintComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    private riskApi: RiskApi,
    public router: Router
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();
  /** 详情分页 */
  detailPaginator: PaginatorState = new PaginatorState();

  dataEmpty = {
    uid: '', // UID
    device: '', // 设备指纹
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: FingerprintItem[] = [];

  /** 获取详情loading */
  detailLoading = false;
  /** 详情列表数据 */
  detailList: FingerprintDetialItem[] = [];

  /** 列表操作 - 是否有展开 */
  get isExpand() {
    return this.list.some((v) => v['expand']);
  }

  ngOnInit() {
    // 详情页码默认为10
    this.detailPaginator.pageSize = 10;

    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uid: this.data.uid,
      fingerprint: this.data.device,
      startTime: toDateStamp(this.data.time[0]),
      endTime: toDateStamp(this.data.time[1], true),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.riskApi.getdevicefingerprintlist(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = Array.isArray(res?.list) ? res.list : [];
      this.paginator.total = res?.total || 0;
    });
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  onExpand(item, index) {
    item.expand = !item.expand;

    // 开启
    if (item.expand) {
      // 除了正在打开的，其他操作全部关闭
      this.list.forEach((v: any, j) => {
        if (index !== j) v.expand = false;
      });

      // 获取当前详情列表
      this.detailList = [];
      this.getDetailList(item.fingerprint, true);
    }
  }

  /** 获取详情列表 */
  getDetailList(fingerprint, resetPage = false) {
    resetPage && (this.detailPaginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      fingerprint,
      page: this.detailPaginator.page,
      pageSize: this.detailPaginator.pageSize,
    };
    this.detailLoading = true;
    this.riskApi.getdevicefingerprintdetail(parmas).subscribe((res) => {
      this.detailLoading = false;
      this.detailList = Array.isArray(res?.list) ? res.list : [];
      this.detailPaginator.total = res?.total || 0;
    });
  }
}
