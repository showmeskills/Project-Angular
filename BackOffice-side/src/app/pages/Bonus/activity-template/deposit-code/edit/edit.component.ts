import { Component, Input, OnInit } from '@angular/core';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { depositCodeInstance } from 'src/app/pages/Bonus/bonus-routing';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import {
  DepositCouponStep3Custom,
  DepositCouponStep3Response,
  PrizeTypeItem,
} from 'src/app/shared/interfaces/activity';
import { InputFloatDirective, InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { filter, finalize, zip } from 'rxjs';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';

@Component({
  selector: 'app-deposit-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    FormsModule,
    NgFor,
    CurrencyIconDirective,
    NgIf,
    AsyncPipe,
    LangPipe,
    PrizeConfigPipe,
    ReactiveFormsModule,
    InputFloatDirective,
    InputTrimDirective,
  ],
})
export class DepositCodeEditComponent implements OnInit {
  constructor(
    private settingService: ActivityStepService,
    private destroy$: DestroyService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    private modalService: MatModal,
    private api: ActivityAPI,
    public lang: LangService,
    private fb: FormBuilder,
    public prizeService: PrizeService
  ) {
    const { id, code } = this.activatedRoute.snapshot.params; // 快照里的params参数
    const { tenantId } = this.activatedRoute.snapshot.queryParams; // 快照里的params参数
    const { sTime, eTime } = this.activatedRoute.snapshot.queryParams; // 快照里的params参数

    this.id = +id || 0;
    this.code = code || '';
    this.tenantId = tenantId;
    this.timeRange = [+sTime || 0, +eTime || 0];

    this.settingService.backList.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate([this.instance.link]);
    });
  }

  combineValidators = {
    pattern: (reg: RegExp) => (control: any) => {
      const value = control.value;
      if (!value) return null;
      return reg.test(value) ? null : { pattern: true };
    },
  };

  instance = depositCodeInstance;
  id = 0; // 当前第三步的活动id
  code = '';
  tenantId = ''; // 商户ID
  timeRange: number[] = []; // 活动时间区间
  formGroup = this.fb.group({
    voucherCode: [
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        // this.combineValidators.pattern(/^(?=.*\d)(?=.*[a-zA-Z]).{4,12}$/),
        this.combineValidators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
    ],
  });

  times = 1; // 奖励次数

  prizeTypeList: PrizeTypeItem[] = [];

  // curLimit = 0;
  // limitList: any[] = [
  //   { name: '永不', nameLang: 'member.activity.sencli2.never', value: 0 },
  //   { name: '每天', nameLang: 'member.activity.sencli2.everyDay', value: 1 },
  //   { name: '每周', nameLang: 'member.activity.sencli2.everyWeek', value: 2 },
  //   { name: '每月', nameLang: 'member.activity.sencli2.everyMonth', value: 3 },
  // ];

  setUpList: DepositCouponStep3Custom[] = [{ orderNum: 1, minPrizes: [{ minDepositUsdt: 0, prizeId: '' }] }]; // 奖励列表

  /**
   * 是否只读查看
   */
  @Input() isView = false;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  ngOnInit() {
    this.formGroup.controls.voucherCode.setValue(this.code);
    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.getCouponCodeStep3(this.tenantId, this.code), this.api.prize_getprizetypes(this.tenantId)).subscribe(
      ([threeInfo, prizeType]) => {
        this.appService.isContentLoadingSubject.next(false);

        this.prizeTypeList = [...(prizeType?.data || [])];

        if (threeInfo?.code !== '0000')
          return this.appService.showToastSubject.next({ msg: threeInfo.message || 'fail' });
        this.edit(threeInfo?.data);
      }
    );
  }

  edit(data?: DepositCouponStep3Response) {
    if (!data) return;

    // 奖励次数
    this.times = data.number;

    // 周期
    // this.curLimit = data?.period;

    // 范围
    const editList = data?.prizeItems || [];

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
        prizeList.forEach((a) => {
          editList.forEach((b, i) => {
            b?.minPrizes.forEach((c, j) => {
              if (a.id === +c.prizeId) editList[i].minPrizes[j] = { ...c, ...a };
            });
          });
        });

        // 赋值
        this.setUpList = editList;
      });
  }

  // 奖品次数
  onPrizeTimesEdit(type: any) {
    if (type === 'add') {
      if (this.times === 5) return;
      ++this.times;
      this.setUpList.push({ orderNum: this.times, minPrizes: [{ minDepositUsdt: 0, prizeId: '' }] });
    }
    if (type === 'cut') {
      if (this.times === 1) return;
      --this.times;
      this.setUpList = this.setUpList.slice(0, -1);
    }
  }

  async onAddUpdatePrize(i: number, j: number) {
    const modal = this.modalService.open(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });

    const result = await modal.result;
    if (!result) return;

    // *奖品新增只限于选择：1.现金券 2.抵用券 3.后发现金券 4.非粘性奖金 5.Free Spin。
    if (![1, 2, 7, 6, 8].includes(result.prizeType)) {
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli2.limit' });
    }

    this.setUpList[i].minPrizes[j] = { ...this.setUpList[i]?.minPrizes[j], ...result, prizeId: result.id };
  }

  onEditlimit(type: string, i: number, j?: number) {
    if (type === 'add') this.setUpList[i].minPrizes.push({ minDepositUsdt: 0, prizeId: '' });
    if (type === 'delete') this.setUpList[i].minPrizes.splice(j!, 1);
  }

  getPrizeSatus(status: any) {
    const list: any = new Map([
      [1, 'member.coupon.pendingReview'],
      [3, 'member.coupon.beenRemoved'],
      [4, 'member.coupon.pendingReview'],
    ]);
    return list.get(status) || '-';
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    const code = this.formGroup.value.voucherCode!.toUpperCase();
    const params = {
      tmpCode: this.code,
      tenantId: +this.tenantId,
      number: this.times,
      changeTmpCode: this.code === code ? undefined : code,
      prizeItems: this.setUpList.map((v) => ({
        orderNum: v.orderNum,
        minPrizes: v.minPrizes.map((j) => ({
          minDepositUsdt: j.minDepositUsdt,
          prizeId: j.prizeId,
        })),
      })),
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateCouponCode({
        activityId: this.id,
        tenantId: +this.tenantId,
        couponCode: code,
      })
      .pipe(
        finalize(() => this.appService.isContentLoadingSubject.next(false)),
        filter((e) => e === true)
      )
      .subscribe(() => {
        this.code = code;
        this.appService.isContentLoadingSubject.next(true);

        this.api.couponCodeStep3(params).subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);
          if (res.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message || 'fail' });

          this.appService.toastOpera(true);
          this.router.navigate([this.instance.link], { replaceUrl: true });
        });
      });
  }

  onBack() {
    this.jump('qualifications');
  }

  jump(lastPath: string) {
    return this.router.navigate(
      [`${this.instance.stepPath}/${lastPath}${this.isReadonly ? '-view' : ''}`, this.id, this.code],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          sTime: this.timeRange[0] || 0,
          eTime: this.timeRange[1] || 0,
        },
      }
    );
  }
}

@Component({
  selector: 'deposit-edit-view',
  standalone: true,
  imports: [DepositCodeEditComponent],
  template: '<app-deposit-edit [isView]="true"></app-deposit-edit>',
})
export class DepositCodeEditViewComponent {}
