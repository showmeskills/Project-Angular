import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { takeUntil, zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { InputFloatDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { LoginCheckInstance } from 'src/app/pages/Bonus/bonus-routing';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { Prize, PrizeAmountType, PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { Tabs } from 'src/app/shared/interfaces/base.interface';

@Component({
  selector: 'login-check-in-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
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
export class LoginCheckInEditComponent implements OnInit {
  constructor(
    public appService: AppService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    public lang: LangService,
    private api: ActivityAPI,
    private destroy$: DestroyService,
    private settingService: ActivityStepService,
    public prizeService: PrizeService
  ) {
    const { id, code } = activatedRoute.snapshot.params;
    const { tenantId } = activatedRoute.snapshot.queryParams;

    this.id = +id || 0;
    this.tmpCode = code;
    this.tenantId = +tenantId;

    this.settingService.backList.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate([LoginCheckInstance.link]);
    });
  }

  instance = LoginCheckInstance;

  /** 是否只读查看 */
  @Input() isView = false;

  /** 活动ID */
  id = 0;

  /** 商户ID */
  tenantId;

  /** 模板code - goGaming */
  tmpCode = '';

  /** 活动时间区间 */
  timeRange: number[] = [];

  /** 奖品数据合集 */
  prizeTypeList: PrizeTypeItem[] = [];

  /** 当前签到类型 */
  typeValue = 1;
  /** 签到类型 */
  typeList: Tabs[] = [
    { name: '注册签到', lang: 'member.activity.sencli15.registerSignIn', value: 1 },
    { name: '每日签到', lang: 'member.activity.sencli15.loginSignIn', value: 2 },
  ];

  /** 选择的奖品 */
  prizeInfo: Prize | null;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.getVipSignInStep3(this.tenantId, this.tmpCode), this.api.prize_getprizetypes(this.tenantId)).subscribe(
      ([threeInfo, prizeType]) => {
        this.appService.isContentLoadingSubject.next(false);

        this.prizeTypeList = [...(prizeType?.data || [])];

        if (threeInfo?.code !== '0000')
          return this.appService.showToastSubject.next({ msg: threeInfo.message || 'fail' });
        this.edit(threeInfo?.data);
      }
    );
  }

  edit(data?) {
    if (!data) return;

    // 类型
    this.typeValue = data?.signInType;

    // 奖品
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .prize_getprizes({
        merchantId: this.tenantId,
        lang: this.lang.isLocal ? 'zh-cn' : 'en-us',
        pageIndex: 1,
        pageSize: 999,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        // 所有奖品数据
        const prizeList = res?.data?.prizes || [];

        // 匹配奖品信息
        this.prizeInfo = prizeList.find((v) => v.id === +data?.prizeItems[0]?.prizeId) || null;
      });
  }

  /** 打开奖品选择弹窗 */
  onOpenSelectPrize() {
    const modal = this.modalService.open(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });
    modal.result
      .then((v) => {
        if (
          ([PrizeType.Cash, PrizeType.Credit, PrizeType.AfterCash, PrizeType.NonStickyBonus].includes(v?.prizeType) &&
            v?.amountType === PrizeAmountType.Fixed) ||
          [PrizeType.FreeSpin].includes(v?.prizeType)
        ) {
          this.prizeInfo = { ...v };
        } else {
          this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli15.prizeSelectLimitTips' });
        }
      })
      .catch(() => {});
  }

  /** 奖品 - 获取奖品状态 */
  getPrizeSatus(status: number) {
    const list = new Map([
      [1, 'member.coupon.pendingReview'],
      [3, 'member.coupon.beenRemoved'],
      [4, 'member.coupon.pendingReview'],
    ]);
    return list.get(status) || '-';
  }

  /** 提交 */
  onSubmit() {
    if (this.submitInvalid()) return;

    const params = {
      tmpCode: this.tmpCode,
      tenantId: +this.tenantId,
      signInType: this.typeValue,
      prizeItems: [{ prizeId: this.prizeInfo?.id || '' }],
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.vipSignInStep3(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message || 'fail' });

      this.appService.toastOpera(true);
      this.toList();
    });
  }

  /** 返回上一步 */
  onBack() {
    this.jump('qualifications');
  }

  /** 跳转到列表页 */
  toList() {
    this.router.navigate([this.instance.link]);
  }

  jump(lastPath: string) {
    return this.router.navigate(
      [`${this.instance.stepPath}/${lastPath}${this.isReadonly ? '-view' : ''}`, this.id, this.tmpCode],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          sTime: this.timeRange[0] || 0,
          eTime: this.timeRange[1] || 0,
        },
      }
    );
  }

  /** 提交 - 字段校验 */
  submitInvalid() {
    if (!this.typeValue) {
      // 请选择类型！
      this.errorToast('member.activity.sencli15.errorTips.tips1');
      return true;
    }

    if (!this.prizeInfo) {
      // 请选择奖品！
      this.errorToast('member.activity.sencli15.errorTips.tips2');
      return true;
    }

    return false;
  }

  errorToast(msgLang) {
    this.appService.showToastSubject.next({
      msgLang,
    });
  }
}

@Component({
  selector: 'login-check-in-edit-view',
  standalone: true,
  imports: [LoginCheckInEditComponent],
  template: '<login-check-in-edit [isView]="true"></login-check-in-edit>',
})
export class LoginCheckInEditViewComponent {}
