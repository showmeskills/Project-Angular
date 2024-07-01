import { Component, EventEmitter, Input, OnInit, Output, SkipSelf } from '@angular/core';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Router } from '@angular/router';
import {
  AuditDetailCommon,
  NegativeClearCategoryEnum,
  NegativeClearCategoryObjEnum,
  OperationReviewCategoryEnum,
  OperationReviewCategoryObjEnum,
  ReviewBaseStatusObjEnum,
} from 'src/app/shared/interfaces/monitor';
import { CancelBetApply, CancelBetApplyData } from 'src/app/shared/interfaces/wager';
import { ActivityService } from 'src/app/pages/Bonus/bonus.service';
import { ActivityTypeEnum } from 'src/app/shared/interfaces/activity';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { CancelBetApplyComponent } from '../../../finance/report/report/report-opera/cancel-bet-apply/cancel-bet-apply.component';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { WinDirective } from 'src/app/shared/directive/common.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AddCouponComponent } from 'src/app/pages/Bonus/coupon-manage/add-coupon/add-coupon.component';
import { MonitorService } from 'src/app/pages/risk/monitor/monitor.service';
import { CouponTypeEnum } from 'src/app/shared/interfaces/coupon';
import { CouponService } from 'src/app/pages/Bonus/coupon.service';

@Component({
  templateUrl: './audit-popup.component.html',
  styleUrls: ['./audit-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgSwitch,
    NgSwitchCase,
    FormRowComponent,
    WinDirective,
    UploadComponent,
    FormsModule,
    NgIf,
    CancelBetApplyComponent,
    NgFor,
    ModalFooterComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    CurrencyIconDirective,
  ],
})
export class AuditPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AuditPopupComponent, boolean>,
    public appService: AppService,
    private api: MonitorApi,
    public router: Router,
    private lang: LangService,
    public activityService: ActivityService,
    public subHeaderService: SubHeaderService,
    private modalService: MatModal,
    public couponService: CouponService,
    @SkipSelf() private service: MonitorService
  ) {}

  protected readonly CouponTypeEnum = CouponTypeEnum;
  protected readonly OperationReviewCategoryObjEnum = OperationReviewCategoryObjEnum;

  /**
   * 是否是审核
   */
  public isReview = false;
  @Input('isReview') set _isReview(v: boolean) {
    this.isReview = v;
  }

  @Input() type: OperationReviewCategoryEnum | NegativeClearCategoryEnum; // 审核类型

  /**
   * 详情数据
   */
  private _data: any;
  get data() {
    return this._data;
  }

  set data(v) {
    if (v['status']) {
      this.isReview = v && v['status'] === ReviewBaseStatusObjEnum.Pending;
    }

    this._data = v;
  } // 审核&详情 内容

  /**
   * 当前tab
   */
  get tab() {
    return this.service.curTab;
  }

  @Output() auditSuccess = new EventEmitter();

  isLoading = false; // 是否处于加载
  audit: any = 'Finish';
  auditList: any[] = [
    { name: '通过', lang: 'risk.passing', value: 'Finish' },
    { name: '不通过', lang: 'risk.noPass', value: 'Rejected' },
  ];

  enableResult = '';
  remark: any = '';
  imageUrl: any = '';

  ngOnInit() {
    const imageList = this.data?.detail?.attachmentList || [];
    this.imageUrl = imageList && imageList.length > 0 ? imageList[0] : '';
    if (this.type === 'EnablePlayer') {
      this.enableResult = this.data.detail.enablePlayerList
        .map((d) => {
          if (d.enableItem.length > 0) {
            return `${d.enablePlayerTypeDesc}：${d.enableItem.join('，')}`;
          } else {
            return d.enablePlayerTypeDesc;
          }
        })
        .join('； ');
    }
  }

  /**
   * 取消注单展示组件传入的data
   */
  get cancelWagerData(): CancelBetApply {
    const res = this.data as AuditDetailCommon<CancelBetApplyData>;

    return {
      ...res.detail,
      orderNumber: res.detail.thirdPartOrderNumber,
      imgList: res.detail.attachmentList,
      remark: res.detail.remark,
    };
  }

  /**
   * 获取标题
   */
  get getTitle() {
    if (!this.isReview) return 'risk.detail';

    if (this.type === OperationReviewCategoryObjEnum.AdjustWallet) return 'risk.tz'; // 调账
    if (this.type === OperationReviewCategoryObjEnum.ResetBindMobile) return 'risk.pReset'; // 重置手机号码
    if (this.type === NegativeClearCategoryObjEnum.NegativeClear) return 'risk.pNegativeClear'; // 负值清零
    if (this.type === OperationReviewCategoryObjEnum.Activity) return 'risk.pActivityReview'; // 活动
    if (this.type === OperationReviewCategoryObjEnum.Edit) return 'risk.manualEdited'; // 人工编辑
    if (this.type === OperationReviewCategoryObjEnum.CancelWager) return 'game.detail.cancelBet'; // 取消注单
    if (this.type === OperationReviewCategoryObjEnum.Reversal) {
      if (this.data?.detail?.receiveAmount) return 'risk.reversePartOrder'; // 冲正撤单 - 部分
      return 'risk.reverseOrder'; // 冲正撤单
    }
    if (this.type === OperationReviewCategoryObjEnum.EnablePlayer) return 'risk.actionEnable'; // 操作：开启
    if (this.type === OperationReviewCategoryObjEnum.Coupon) return 'risk.couponReview'; // 优惠券审核
    if (this.type === OperationReviewCategoryObjEnum.SendCoupon) return 'member.coupon.sendCoupon'; // 发放优惠券
    if (this.type === OperationReviewCategoryObjEnum.MemberBasicInfo) return 'member.coupon.basicModify'; // 会员基本信息：修改

    return '';
  }

  confirm() {
    if (this.isReview) {
      this.loading(true);
      const params = {
        orderId: this.data?.orderId,
        status: this.audit,
        remark: this.remark,
      };
      this.getAudit$(this.type, params).subscribe((res: any) => {
        this.loading(false);
        const successed = res === true;

        if (successed) {
          this.modal.close(true);
          this.auditSuccess.emit();
        }

        this.appService.showToastSubject.next({ msgLang: successed ? 'risk.suc' : 'risk.fail', successed });
      });
    } else {
      this.modal.close(true);
    }
  }

  /** 获取详情审核流 */
  getAudit$(type: string, params?: any) {
    switch (type) {
      // 负值清零
      case 'NegativeClear':
        return this.api.updateAuditNegativeClearStatus(params);
      // 调账
      case 'AdjustWallet':
        return this.api.adjustWalletAudit(params);
      // 重置手机号码
      case 'ResetBindMobile':
        return this.api.resetBindMobileAudit(params);
      // 注单取消
      case 'CancelWager':
        return this.api.cancelWagerAudit({ ...params, auditId: this.data?.detail?.auditId });
      // 上架/下架 优惠券
      case OperationReviewCategoryObjEnum.Coupon:
        return this.api.couponUpDownAudit({ ...params, auditId: this.data?.detail?.auditId || undefined });
      // 发放优惠券
      case OperationReviewCategoryObjEnum.SendCoupon:
        return this.api.couponGrantAudit({ ...params, auditId: this.data?.detail?.auditId || undefined });
      // 操作审核: 活动、存提款订单操作审核，人工编辑、人工取消，会员基本信息：修改
      default:
        return this.api.getAuditUpdateStatus({ ...params, auditId: this.data?.detail?.auditId || undefined });
    }
  }

  // 存款类型
  getDepositType(value: any) {
    const typeList: any = new Map([
      ['Deposit', { name: '存款', lang: 'game.proxy.deposit' }],
      ['Withdraw', { name: '提款', lang: 'game.proxy.withdraw' }],
      ['Bonus', { name: '红利', lang: 'game.proxy.bonus' }],
      ['Payout', { name: '输赢', lang: 'dashboard.info.winLose' }],
      ['Other', { name: '其他', lang: 'system.merchants.other' }],
    ]);
    return typeList.get(value).lang || '-';
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 打开新标签页 跳转到活动页面
   * 此函数只能同步，异步：会导致window.open弹窗拦截无法打开新标签页
   */
  toActivity() {
    if (!this.data?.detail?.type) return;

    // VIP专属活动模板
    if (this.data?.detail?.type === ActivityTypeEnum[ActivityTypeEnum.VipExclusive]) {
      window.open(
        this.router
          .createUrlTree([`/bonus/activity-manage/${this.data?.detail?.type}/activity-view`], {
            queryParams: {
              tenantId: this.data?.tenantId || '',
              id: this.data?.detail?.infoList?.[0]?.activityId,
              code: this.data?.detail?.couponCode,
            },
          })
          .toString()
      );
      return;
    }

    window.open(
      this.router
        .createUrlTree(
          [
            `/bonus/activity-manage/${this.data?.detail?.type}/setting/${
              ActivityTypeEnum[this.data?.detail?.type]
            }/base-view`,
            this.data?.detail?.infoList?.[0]?.activityId || null,
            this.data?.detail?.couponCode || null,
          ],
          { queryParams: { tenantId: this.data?.tenantId || '', allowEdit: this.data?.detail?.status === 1 } }
        )
        .toString()
    );
  }

  /**
   * 打开优惠券详情
   */
  checkCoupnPopup() {
    const modalRef = this.modalService.open(AddCouponComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance['tenantId'] = +this.subHeaderService.merchantCurrentId;
    modalRef.componentInstance['data'] = this.data;
    modalRef.componentInstance['templateType'] = 'check';
    modalRef.result.then(() => {}).catch(() => {});
  }
}
