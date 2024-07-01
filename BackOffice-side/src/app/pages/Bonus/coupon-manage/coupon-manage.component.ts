import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AddCouponComponent } from './add-coupon/add-coupon.component';
import { SendCouponComponent } from './send-coupon/send-coupon.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CouponTypeEnum } from 'src/app/shared/interfaces/coupon';
import { TimeUTCFormatLocalPipe } from 'src/app/shared/pipes/time.pipe';
import { CouponService } from 'src/app/pages/Bonus/coupon.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-coupon-manage',
  templateUrl: './coupon-manage.component.html',
  styleUrls: ['./coupon-manage.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgIf,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    FormatMoneyPipe,
    LangPipe,
    NgbTooltip,
    LabelComponent,
    TimeUTCFormatLocalPipe,
  ],
})
export class CouponManageComponent implements OnInit, OnDestroy {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  constructor(
    public subHeaderService: SubHeaderService,
    private modalService: MatModal,
    public router: Router,
    private appService: AppService,
    private api: BonusCouponApi,
    private selectApi: SelectApi,
    public lang: LangService,
    private confirmModalService: ConfirmModalService,
    public couponService: CouponService
  ) {}

  protected readonly CouponTypeEnum = CouponTypeEnum;

  isLoading = false;

  dataEmpty = {
    name: '', // 名称
    type: '', // 类型

    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  data = cloneDeep(this.dataEmpty);

  // 优惠券概览
  sumData: any = {};

  // 优惠券列表
  list: any = [];

  /** 优惠券类型数据 */
  get typeList() {
    return this.couponService.typeList;
  }

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  loadData() {
    this.getSumData();
    this.onReset();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取优惠卷概览
  getSumData() {
    this.api.getCouponSum({ tenantId: +this.subHeaderService.merchantCurrentId }).subscribe((res) => {
      if (res.code === '0000') this.sumData = res.data || {};
    });
  }

  // 获取优惠卷列表数据
  getList(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const parmas = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      voucherName: this.data.name,
      voucherType: this.data.type,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      ...(this.data.order
        ? {
            orderBy: this.data.order,
            sort: this.data.isAsc ? 'asc' : 'desc',
          }
        : {}),
    };
    this.api.getCouponList(parmas).subscribe((res) => {
      this.loading(false);
      if (res.code === '0000') {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      }
    });
  }

  // 重置
  onReset() {
    this.data = { ...this.dataEmpty };
    this.getList(true);
  }

  // 排序
  onSort(sortKey: any) {
    if (!this.list.length) return;

    if (this.data.isAsc === false && this.data.order === sortKey) {
      this.data.order = '';
      this.data.isAsc = true;
      this.getList(true);
      return;
    }

    if (!this.data.order || this.data.order !== sortKey) {
      this.data.order = sortKey;
      this.data.isAsc = false;
    }

    this.data.isAsc = !this.data.isAsc;
    this.getList(true);
  }

  // 审核/下架 弹窗操作
  async onOpenWarningPopup(type: string, id: any, code: any) {
    let msg: any;
    if (type === 'audit') {
      // 确认审核卡券
      const confirmAuditCard = await this.lang.getOne('member.coupon.confirmAuditCard');
      // 提交审核后卡券进入实时监控等待审核
      let coupWillTake = await this.lang.getOne('member.coupon.coupWillTake');

      msg = `${confirmAuditCard}：${code} ？${coupWillTake} `;
    }
    if (type === 'takeDown') {
      // 确认下架卡券
      const confirmRemoval = await this.lang.getOne('member.coupon.confirmRemoval');
      // 下架后用户不可兑换， 不可再次上架。
      let cannotExchange = await this.lang.getOne('member.coupon.cannotExchange');

      msg = `${confirmRemoval}：${code} ？${cannotExchange}`;
    }

    this.confirmModalService
      .open({ msg })
      .result.then(() => {
        this.loading(true);
        let parmas = {
          id,
          tmpState: type === 'audit' ? 1 : 4,
        };
        this.api.getCouponCos(parmas).subscribe((res) => {
          this.loading(false);
          if (res.code !== '0000') return this.appService.showToastSubject.next({ msg: res?.message });

          this.appService.toastOpera(res.code === '0000');
          if (res.code === '0000') setTimeout(() => this.getList(), 100);
        });
      })
      .catch(() => {});
  }

  /** 新增/编辑 优惠卷弹窗打开 */
  onAddCoupnPopup(item?, type?: string) {
    const modalRef = this.modalService.open(AddCouponComponent, { width: '800px', disableClose: true });
    modalRef.componentInstance['templateType'] = type;
    modalRef.componentInstance['data'] = item || null;
    modalRef.componentInstance.addEditSuccess.subscribe(() => setTimeout(() => this.getList(), 100));
    modalRef.result.then(() => {}).catch(() => {});
  }

  // 发券 弹窗打开
  onSendCoupnPopup(item: any) {
    const modalRef = this.modalService.open(SendCouponComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance['data'] = item;
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.componentInstance.sendSuccess.subscribe(() => {
      setTimeout(() => {
        this.getList();
        this.getSumData();
      }, 100);
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  /**
   * 发放记录
   */
  onRecord(item: any) {
    this.router.navigate(['bonus/coupon-manage/distribution-record', item.tenantId, item.id]);
  }

  /**
   * 跳转领取名单
   */
  toReceivePage(item) {
    switch (item.voucherType) {
      case CouponTypeEnum.NonStickyBonus:
        this.router.navigate(['bonus/coupon-manage/nonStickyBonus'], {
          queryParams: {
            prizeId: item?.id,
            tenantId: +this.subHeaderService.merchantCurrentId,
            type: 'couop',
            tmpCode: item.tmpCode,
          },
        });
        break;
      case CouponTypeEnum.FreeSpin:
        this.router.navigate(['bonus/coupon-manage/free-spin-query'], {
          queryParams: { tmpCode: item.tmpCode, tenantId: +this.subHeaderService.merchantCurrentId },
        });
        break;
    }
  }
}
