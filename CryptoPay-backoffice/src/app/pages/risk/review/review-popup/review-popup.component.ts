import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { ReviewApi } from 'src/app/shared/api/review.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Router } from '@angular/router';
import { ReviewItem, ReviewStatus, ReviewType } from 'src/app/shared/interfaces/review';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ReviewContentOrderComponent } from './review-content-component/review-content-order/review-content-order.component';
import { NgSwitch, NgSwitchCase, NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { ReviewContentOrderManualDepositComponent } from 'src/app/pages/risk/review/review-popup/review-content-component/review-content-order-manual-deposit/review-content-order-manual-deposit.component';

@Component({
  templateUrl: './review-popup.component.html',
  styleUrls: ['./review-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgSwitch,
    NgSwitchCase,
    ReviewContentOrderComponent,
    NgIf,
    FormRowComponent,
    NgFor,
    FormsModule,
    ModalFooterComponent,
    TimeFormatPipe,
    LangPipe,
    ReviewContentOrderManualDepositComponent,
  ],
})
export class ReviewPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ReviewPopupComponent, boolean>,
    public appService: AppService,
    private api: ReviewApi,
    public router: Router,
    private lang: LangService
  ) {}

  @Input() title: any; // 状态：审核audit，审核详情detail
  @Input() data: ReviewItem; // 审核&详情 内容

  @Output() reviewedAfter = new EventEmitter();

  isLoading = false; // 是否处于加载

  ReviewType = ReviewType;
  ReviewStatus = ReviewStatus;
  audit = ReviewStatus.Success; // 默认通过的单选
  auditList: any[] = [
    { name: '通过', lang: 'risk.passing', value: ReviewStatus.Success },
    { name: '不通过', lang: 'risk.noPass', value: ReviewStatus.Fail },
  ];

  remark = '';

  get type() {
    return this.data.auditType;
  }

  /**
   * 是否可审核
   */
  get allowReview() {
    return this.data?.auditStatus === ReviewStatus.Processing;
  }

  ngOnInit() {}

  confirm() {
    if (!this.allowReview) return this.modal.close();

    this.loading(true);
    this.getAudit$(this.type).subscribe((res: any) => {
      this.loading(false);
      const successed = res === true;

      if (successed) {
        this.modal.close(true);
        this.reviewedAfter.emit();
      }

      this.appService.showToastSubject.next({ msgLang: successed ? 'risk.suc' : 'risk.fail', successed });
    });
  }

  /** 获取详情审核流 */
  getAudit$(type: string) {
    const params = {
      id: this.data.id,
      status: this.audit as any,
      remark: this.remark,
    };

    switch (type) {
      // // 负值清零
      // case 'NegativeClear':
      //   return this.api.updateAuditNegativeClearStatus(params);
      // // 异常会员
      // case 'AbnormalMember':
      //   return this.api.updateAbnormalMemberStatus(params);
      // // 调账
      // case 'AdjustWallet':
      //   return this.api.adjustWalletAudit(params);
      // // 重置手机号码
      // case 'ResetBindMobile':
      //   return this.api.resetBindMobileAudit(params);
      // // 注单取消
      // case 'CancelWager':
      //   return this.api.cancelWagerAudit({ ...params, auditId: this.data?.detail?.auditId });
      // 操作审核: 活动、存提款订单操作审核，人工编辑、人工取消
      default:
        return this.api.reviewUpdate(params as any);
    }
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
