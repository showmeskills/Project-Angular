import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { takeUntil, finalize } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { Router } from '@angular/router';
import { BadDataAddPopupComponent } from './add-popup/add-popup.component';
import { MemberApi } from 'src/app/shared/api/member.api';
import { BadDataItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'bad-data',
  templateUrl: './bad-data.component.html',
  styleUrls: ['./bad-data.component.scss'],
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
export class BadDataComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    private confirmModalService: ConfirmModalService,
    public lang: LangService,
    private modalService: MatModal,
    public router: Router,
    private api: MemberApi
  ) {}

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

  dataEmpty = {
    badValue: '', // 不良数据值
    category: '', // 类型
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: BadDataItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      type: this.data.category,
      value: this.data.badValue,
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

    return this.api.querybaddataconfig(parmas);
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 获取 列表 - 类型名称 */
  getCategoryLang(value) {
    return this.categoryList.find((v) => v.value === value)?.lang || 'common.unknown';
  }

  /** 获取 列表 - 品牌名称 */
  getMerchantNameList(tenantIdList: number[] = []) {
    if (!tenantIdList.length) return [];
    return this.subHeaderService.merchantListAll.filter((v) => tenantIdList.includes(+v.value)) || [];
  }

  /** 新增不良数据 - 弹窗操作 */
  onAddPopup() {
    const modalRef = this.modalService.open(BadDataAddPopupComponent, {
      width: '744px',
      disableClose: true,
    });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;

    modalRef.result
      .then((res) => {
        res && setTimeout(() => this.loadData(true), 100);
      })
      .catch(() => {});
  }

  /** 跳转详情 */
  toDetail(id) {
    this.router.navigate(['risk/bad-data-detail'], {
      queryParams: {
        id,
        tenantId: this.subHeaderService.merchantCurrentId,
      },
    });
  }

  /** 删除 */
  onDeletion(badDataId) {
    if (!badDataId && !this.list.length)
      return this.appService.showToastSubject.next({ msgLang: 'bonus.activity.noData' });

    this.confirmModalService
      .open({ msgLang: 'risk.badData.isDeletionTips' }) // 是否确认删除该不良数据？
      .result.then(() => {
        let parmas = {
          badDataId,
          tenantId: this.subHeaderService.merchantCurrentId,
        };
        this.appService.isContentLoadingSubject.next(true);
        this.api.deletebaddataconfig(parmas).subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);
          if (!res)
            return this.appService.showToastSubject.next(
              res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
            );

          this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
          if (res) setTimeout(() => this.loadData(), 100);
        });
      })
      .catch(() => {});
  }
}
