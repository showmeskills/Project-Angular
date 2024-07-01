import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { WinDirective } from 'src/app/shared/directive/common.directive';
import { finalize, takeUntil } from 'rxjs';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { AppService } from 'src/app/app.service';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import { AuditPopupComponent } from 'src/app/pages/risk/monitor/audit-popup/audit-popup.component';
import { FormsModule } from '@angular/forms';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { ActivityService } from 'src/app/pages/Bonus/bonus.service';
import {
  TransactionReviewCategoryObjEnum,
  TransactionReviewItem,
  OperationReviewStatusObjEnum,
} from 'src/app/shared/interfaces/monitor';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { TransactionReviewDetailComponent } from './transaction-review-detail/transaction-review-detail.component';

@Component({
  selector: 'transaction-review',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyIconDirective,
    CurrencyValuePipe,
    IconSrcDirective,
    LabelComponent,
    LangPipe,
    TimeFormatPipe,
    WinDirective,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    FormsModule,
    LoadingDirective,
  ],
  templateUrl: './transaction-review.component.html',
  styleUrls: ['../../monitor.component.scss', './transaction-review.component.scss'],
  providers: [DestroyService],
})
export class TransactionReviewComponent implements OnInit {
  constructor(
    private destroy$: DestroyService,
    private api: MonitorApi,
    private appService: AppService,
    public service: MonitorService,
    private subHeaderService: SubHeaderService,
    private modalService: MatModal,
    private bonusapi: BonusCouponApi,
    public activityService: ActivityService,
    public lang: LangService,
    private drawer: DrawerService
  ) {}

  // PS: 导出的话，监听一个导出的流
  // PS: 自己管理内部的分页，如果是“全部”监听接收流数据为{ isAll: true, paginator }流，用当前传递的数据来接管，只展示item
  ngOnInit(): void {
    this.service
      .reload$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(([reset]) => {
        this.loadData(reset);
      });

    // 导出
    this.exportBind();
  }

  protected readonly TransactionReviewCategoryObjEnum = TransactionReviewCategoryObjEnum;
  protected readonly StatusEnum = OperationReviewStatusObjEnum;
  loading = false;

  /**
   * 页大小
   */
  pageSizes: number[] = PageSizes;

  /**
   * 分页
   */
  paginator: PaginatorState = new PaginatorState(); // 分页

  /**
   * 列表数据
   */
  list: TransactionReviewItem[] = [];

  /**
   * 是否全部类型
   */
  get isAllType() {
    return this.service.isAllType;
  }

  /**
   * 审核类型：操作审核 - 获取实时监控&历史记录数据
   */
  loadData(resetPage = false) {
    if (this.loading) return;

    this.loading = true;
    this.loadData$(resetPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendParams?: Partial<MonitorServiceParams>) {
    resetPage && (this.paginator.page = 1);

    const sendData = { ...this.service.getParams(this.paginator), ...sendParams };
    return this.api.getTransactionReview(sendData);
  }

  /**
   * 审核弹窗 - 根据不同审核进入流程
   */
  async onDetail(item: TransactionReviewItem) {
    this.loading = true;
    this.api
      .getTransactionReviewDetail({ orderId: item.orderId })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        if (!data || !data.status)
          return this.appService.showToastSubject.next({ msgLang: 'risk.failToGet', successed: false });
        this.openDetail(data);
      });
    // const category = item.category;

    // let detail: any;
    // // 获取不同审核类型的详情
    // this.loading = true;
    // try {
    //   switch (category) {
    //     case TransactionReviewCategoryObjEnum.Edit:
    //     case TransactionReviewCategoryObjEnum.Reversal: {
    //       const [order, detailData] = await lastValueFrom(
    //         forkJoin([
    //           this.api.getAuditOrder({ id: item.detail.auditId }),
    //           this.api.getReviewDetail({ orderId: item.orderId }),
    //         ])
    //       );
    //       detail = { ...order, ...detailData };
    //       break;
    //     }
    //     case TransactionReviewCategoryObjEnum.SendCoupon:
    //     case TransactionReviewCategoryObjEnum.Coupon: {
    //       const data = await lastValueFrom(
    //         this.bonusapi.getQueryOne({
    //           tmpCode: item.detail.tmpCode,
    //           tenantId: this.subHeaderService.merchantCurrentId,
    //         })
    //       );
    //       detail = { ...data?.data, ...item };
    //       break;
    //     }
    //     default:
    //       detail = await lastValueFrom(this.api.getReviewDetail({ orderId: item.orderId }));
    //       break;
    //   }
    // } finally {
    //   this.loading = false;
    // }

    // this.openAuditPopup(category, detail);
  }

  /**
   * 异常会员 - 审核/详情弹窗
   */
  openDetail(data: TransactionReviewItem) {
    const modal = this.drawer.open(TransactionReviewDetailComponent, { width: '950px' });
    modal.componentInstance['uid'] = data.uid;
    modal.componentInstance['memberId'] = data.mid;
    modal.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modal.componentInstance['tab'] = this.service.curTab;
    modal.componentInstance['status'] = data.status;
    modal.componentInstance['data'] = data || {};
    modal.componentInstance.auditSuccess.subscribe(() =>
      setTimeout(() => {
        this.loadData();
      }, 100)
    );
  }

  /**
   * 通用 - 审核/详情弹窗
   */
  openAuditPopup(category: any, data: any) {
    this.loading = false;
    if (data) {
      const modalRef = this.modalService.open(AuditPopupComponent, { width: '788px', disableClose: true });
      modalRef.componentInstance['type'] = category;
      modalRef.componentInstance['data'] = data || {};

      modalRef.componentInstance.auditSuccess.subscribe(() =>
        setTimeout(() => {
          this.loadData();
        }, 100)
      );
    } else {
      this.appService.showToastSubject.next({ msgLang: 'risk.failToGet', successed: false });
    }
  }

  /**
   * 导出绑定
   * @private
   */
  private async exportBind() {
    const content = await this.lang.getOne('member.model.content'); // 内容
    const name = await this.lang.getOne('common.name');
    const type = await this.lang.getOne('common.type');
    const typeValue = await this.lang.getOne('risk.actCheck'); // 操作审核
    const amount = await this.lang.getOne('common.amount');
    const currency = await this.lang.getOne('common.currency');
    const createTime = await this.lang.getOne('risk.auto.applyTime');
    const status = await this.lang.getOne('common.status');
    const withdrawlLimit = await this.lang.getOne('bonus.activity.depositLimit'); // 提现限额

    const resetPhone = await this.lang.getOne('risk.resetMobileNumber'); // 重置手机号码
    const createdUserName = await this.lang.getOne('auManage.role.creater'); // 创建人
    const adjustment = await this.lang.getOne('marketing.commissionList.bill.adjustment'); // 调账
    const enabledActivity = await this.lang.getOne('risk.openEvent'); // 启用活动
    const disabledActivity = await this.lang.getOne('risk.closeEvent'); // 关闭活动
    const cancelBet = await this.lang.getOne('game.detail.cancelBet'); // 取消注单
    const couponOn = await this.lang.getOne('member.coupon.listCoupons'); // 上架优惠券
    const couponOff = await this.lang.getOne('member.coupon.removeCoupons'); // 下架优惠券
    const reversePartOrder = await this.lang.getOne('risk.reversePartOrder'); // 部分冲正
    const reverseOrder = await this.lang.getOne('risk.reverseOrder'); // 全部冲正
    const manualEdited = await this.lang.getOne('risk.manualEdited'); // 人工编辑
    const sendCoupon = await this.lang.getOne('member.coupon.sendCoupon'); // 发放优惠券
    const basicModify = await this.lang.getOne('member.coupon.basicModify'); // 会员基本信息：修改
    const reviewer = await this.lang.getOne('risk.viewr'); // 审核人
    const reviewedTime = await this.lang.getOne('risk.checkTime'); // 审核时间

    // 获取内容
    const getContent = (e: TransactionReviewItem) => {
      const contentList = {
        // 调账
        [TransactionReviewCategoryObjEnum.AdjustWallet]: adjustment,
        // 重置手机号码
        [TransactionReviewCategoryObjEnum.ResetBindMobile]: resetPhone,
        // 活动审核
        [TransactionReviewCategoryObjEnum.Activity]:
          e.detail.status === 1
            ? enabledActivity
            : disabledActivity + ': ' + this.activityService.getLangText(e?.detail?.type),

        // 取消注单
        [TransactionReviewCategoryObjEnum.CancelWager]: cancelBet + ':' + e.detail?.wagerNumber,
        // 人工编辑
        [TransactionReviewCategoryObjEnum.Edit]: manualEdited + ':' + e.detail?.orderNum,
        // 冲正撤单
        [TransactionReviewCategoryObjEnum.Reversal]:
          (e?.detail?.receiveAmount ? reversePartOrder : reverseOrder) + ':' + e.detail?.orderNum,
        // 开启玩家
        [TransactionReviewCategoryObjEnum.EnablePlayer]: e.detail?.enableInfo,
        // 优惠劵
        [TransactionReviewCategoryObjEnum.Coupon]: e.detail?.status === 1 ? couponOn : couponOff,
        // 发放优惠券
        [TransactionReviewCategoryObjEnum.SendCoupon]: sendCoupon,
        // 会员基本信息：修改
        [TransactionReviewCategoryObjEnum.MemberBasicInfo]: basicModify,
      };

      return contentList[e.category] || '';
    };

    const getName = (e: TransactionReviewItem) => {
      if (['Activity', 'Coupon'].includes(e.category)) {
        return e.detail?.name;
      } else if (e.category === 'SendCoupon') {
        return e.detail?.info?.find((e) => e.languageCode === this.lang.currentLang?.toLowerCase())?.title;
      }

      return e.uid;
    };

    // 导出监听
    this.service.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(({ isAll, exportExcel }) => {
      this.loadData$(false, isAll ? { page: 1, pageSize: 9e4 } : undefined).subscribe((res) => {
        exportExcel.AdjustWallet(
          res.list.map((e) => ({
            [type]: typeValue,
            UID: e.uid,
            [content]: getContent(e), // 内容 预留位置，下面赋值
            [name]: getName(e),

            [amount]: e.detail?.amount, // 调账金额
            [withdrawlLimit]: e.detail?.withdrawLimit, // 提现限额
            [currency]: e.detail?.currency, // 调账币种
            [createdUserName]: e.createdUserName, // 创建人
            [createTime]: timeFormat(e.createdTime), // 创建时间
            [reviewer]: e.modifiedUserName || '-', // 审核人
            [reviewedTime]: (this.service.curTab === 2 && timeFormat(e.modifiedTime)) || '-', // 审核时间
            [status]: this.service.statusLang[e.status]?.langText,
          }))
        );
      });
    });
  }
}
