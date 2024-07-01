import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { InputFloatDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { PrizeAmountType, PrizeType } from 'src/app/shared/interfaces/activity';
import { tournamentInstance } from 'src/app/pages/Bonus/bonus-routing';
import { TournamentPreviewPopupComponent } from './preview-popup/preview-popup.component';
import { takeUntil, zip } from 'rxjs';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';

@Component({
  selector: 'tournament-edit',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    FormsModule,
    LangPipe,
    AngularSvgIconModule,
    IconSrcDirective,
    FormWrapComponent,
    InputFloatDirective,
    CurrencyIconDirective,
    NgbTooltip,
    PrizeConfigPipe,
    InputNumberDirective,
    InputFloatDirective,
  ],
})
export class TournamentEditComponent implements OnInit {
  constructor(
    public appService: AppService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    public lang: LangService,
    private api: ActivityAPI,
    private destroy$: DestroyService,
    private settingService: ActivityStepService
  ) {
    const { id, code } = activatedRoute.snapshot.params;
    const { tenantId } = activatedRoute.snapshot.queryParams;

    this.id = +id || 0;
    this.tmpCode = code;
    this.tenantId = +tenantId;

    this.settingService.backList.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate([tournamentInstance.link]);
    });
  }

  protected readonly PrizeAmountType = PrizeAmountType;

  /** 是否只读查看 */
  @Input() isView = false;

  /**
   * 活动ID
   */
  id = 0;

  /** 商户ID */
  tenantId;

  /** 模板code - goGaming */
  tmpCode;

  /** 奖品数据 */
  prizeList = [];

  /** 奖池 - 列表数据 */
  prizePoolList: any = [
    { rankNumStart: 1, rankNumEnd: 2, prizeData: {} },
    { rankNumStart: 3, rankNumEnd: 4, prizeData: {} },
    { rankNumStart: 5, rankNumEnd: 6, prizeData: {} },
    { rankNumStart: 7, rankNumEnd: 8, prizeData: {} },
  ];

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  ngOnInit() {
    // 获取详情
    this.tmpCode && this.getDetail();
  }

  /** 获取详情 */
  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.newrank_get_stepthree(this.tmpCode, this.tenantId),
      this.api.prize_getprizes({
        merchantId: this.tenantId,
        lang: this.lang.isLocal ? 'zh-cn' : 'en-us',
        pageIndex: 1,
        pageSize: 999,
      })
    ).subscribe(([bonusRes, prizeData]) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!bonusRes || bonusRes.code !== '0000') {
        this.appService.showToastSubject.next(
          bonusRes?.message ? { msg: bonusRes.message } : { msgLang: 'common.fail' }
        );
      }

      const list = bonusRes.data?.prizes || [];
      const prizes = prizeData.data?.prizes || [];

      if (!list.length || !prizes.length) return;

      this.prizePoolList = list.map((v) => ({
        rankNumStart: v?.rankNumStart,
        rankNumEnd: v?.rankNumEnd,
        prizeData: prizes.find((j) => j?.id === +v?.prizeId),
      }));
    });
  }

  /** 打开奖品选择弹窗 */
  onOpenSelectPrize(index) {
    const modal = this.modalService.open(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });
    modal.result
      .then((v) => {
        if (
          (v?.prizeType === PrizeType.Cash && v?.amountType === PrizeAmountType.Fixed) ||
          v?.prizeType === PrizeType.RealItem
        ) {
          this.prizePoolList[index]['prizeData'] = { ...v };
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'member.activity.sencli12.errorTips.tips16',
          });
        }
      })
      .catch(() => {});
  }

  /** 获取奖品的审核状态 */
  getPrizeSatus(status) {
    const list: any = new Map([
      [1, 'member.coupon.pendingReview'], // 待审核
      [3, 'member.coupon.beenRemoved'], // 已下架
      [4, 'member.coupon.pendingReview'], // 待审核
    ]);
    return list.get(status) || '-';
  }

  /** 新增名次 */
  onAddRank() {
    this.prizePoolList.push({ rankNumStart: '', rankNumEnd: '', prizeData: {} });
  }

  /** 预览 */
  onOpenPreviewPopup() {
    const modalRef = this.modalService.open(TournamentPreviewPopupComponent, { width: '900px' });

    modalRef.componentInstance['tmpCode'] = this.tmpCode;
    modalRef.componentInstance['tenantId'] = this.tenantId;
    modalRef.componentInstance['prizePoolList'] = this.prizePoolList;
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 提交 */
  onSubmit() {
    if (this.submitInvalid()) return;

    let params = {
      tmpCode: this.tmpCode,
      tenantId: this.tenantId,
      prizes: this.prizePoolList.map((v) => ({
        rankNumStart: +v?.rankNumStart,
        rankNumEnd: +v?.rankNumEnd,
        prizeId: String(v?.prizeData?.id),
      })),
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.newrank_addorupdate_stepthree(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0000')
        return this.appService.showToastSubject.next(
          res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.router.navigate([tournamentInstance.link]);
    });
  }

  /** 提交 - 字段校验 */
  submitInvalid() {
    if (this.prizePoolList.some((v) => !v.rankNumStart || !v.rankNumEnd)) {
      // 请输入正确的名次！
      this.errorToast('member.activity.sencli12.errorTips.tips15');
      return true;
    }

    if (this.prizePoolList.some((v) => !v?.prizeData?.id)) {
      // 请选择现金券的固定金额类型奖品或者实物奖品
      this.errorToast('member.activity.sencli12.errorTips.tips16');
      return true;
    }

    return false;
  }

  /** 跳转 */
  jump(lastPath: string) {
    return this.router.navigate([`${tournamentInstance.stepPath}/${lastPath}`, this.id, this.tmpCode], {
      queryParamsHandling: 'merge',
      queryParams: {},
    });
  }

  errorToast(msgLang) {
    this.appService.showToastSubject.next({
      msgLang,
    });
  }
}

@Component({
  selector: 'tournament-edit-view',
  standalone: true,
  imports: [TournamentEditComponent],
  template: '<tournament-edit [isView]="true"></tournament-edit>',
})
export class TournamentEditViewComponent {}
