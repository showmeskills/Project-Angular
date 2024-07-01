import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { from, of, zip } from 'rxjs';
import { Prize, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { Currency } from 'src/app/shared/interfaces/currency';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import {
  ExtraRewardForm,
  ExtraRewardFormPrize,
  ExtraRewardParams,
} from 'src/app/shared/interfaces/activityExtraReward';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { PaymentCategoryEnum } from 'src/app/shared/interfaces/transaction';
import { PaymentMethodGoMoneyItem } from 'src/app/shared/interfaces/payment-method-management';
import { InputFloatDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { extraRewardInstance } from 'src/app/pages/Bonus/bonus-routing';
import { validatorArrayRequired } from 'src/app/shared/models/validator';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';

@Component({
  selector: 'extra-reward-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    LangPipe,
    AngularSvgIconModule,
    FormWrapComponent,
    FormsModule,
    ModalFooterComponent,
    ModalTitleComponent,
    PaginatorComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    InputNumberDirective,
    CurrencyIconDirective,
    ReactiveFormsModule,
    PrizeConfigPipe,
    InputFloatDirective,
    AttrDisabledDirective,
  ],
  templateUrl: './extra-reward-edit.component.html',
  styleUrls: ['./extra-reward-edit.component.scss'],
})
export class ExtraRewardEditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modalService: MatModal,
    public lang: LangService,
    private activatedRoute: ActivatedRoute,
    private api: ActivityAPI,
    private selectApi: SelectApi,
    public appService: AppService,
    public router: Router,
    private confirmModalService: ConfirmModalService,
    private settingService: ActivityStepService,
    private destroy$: DestroyService,
    private currencyService: CurrencyService,
    public prizeService: PrizeService,
    private assetApi: AssetApi
  ) {
    const { id, code } = activatedRoute.snapshot.params; // 快照里的params参数
    const { tenantId } = activatedRoute.snapshot.queryParams; // 快照里的params参数
    const { sTime, eTime } = activatedRoute.snapshot.queryParams; // 快照里的params参数

    this.id = +id || 0;
    this.code = code || '';
    this.tenantId = tenantId;
    this.timeRange = [+sTime || 0, +eTime || 0];
    this.settingService.backList.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate([extraRewardInstance.link]);
    });
  }

  /**
   * 是否只读查看
   */
  @Input() isView = false;

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.prize_getprizetypes(this.tenantId),
      this.assetApi.getGoMoneyPaymentMethodList(this.tenantId, PaymentCategoryEnum.Deposit),
      from(this.currencyService.updateCurrency()),
      this.api
        .prize_getprizes({
          merchantId: this.tenantId,
          lang: this.lang.isLocal ? 'zh-cn' : 'en-us',
          pageIndex: 1,
          pageSize: 999,
        })
        .pipe(catchError(() => of({ data: { prizes: [] } }))),
      this.id ? this.api.getExtraBonus(this.tenantId, String(this.code)) : of(null)
    ).subscribe(([typeList, goMoneyPaymentList, currency, prizeList, detail]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.currencyList = currency;
      this.goMoneyPaymentList = goMoneyPaymentList.filter((e) => !e.isDigital); // 过滤掉虚拟币支付方式
      this.prizeList = prizeList.data.prizes;
      this.prizeTypeList = typeList?.data?.filter((e) => e.prizeTypeValue) || [];
      this.onAddPayment();
      this.processDetail(detail?.data);
    });
  }

  id = 0; // 当前第三步的活动id
  code = '';
  editId = 0; // 活动步骤的id：ToLan  新增为0：Roger
  tenantId = '';
  timeRange: number[] = [];
  currencyList: Currency[] = []; // 币种列表
  goMoneyPaymentList: PaymentMethodGoMoneyItem[] = []; // 支付方式列表
  prizeList: Prize[] = []; // 奖品列表
  prizeTypeList: PrizeTypeItem[] = []; // 已选奖品列表
  form = this.fb.group({
    dailyMaxLimit: [null as number | null, Validators.compose([Validators.min(1), Validators.required])], // 每日最大限制
  });

  group: FormArray<FormGroup<ExtraRewardForm>> = this.fb.array([] as FormGroup<ExtraRewardForm>[]); // 支付方式组合列表

  /**
   * 是否新增
   */
  get isAdd() {
    return !this.editId;
  }

  /**
   * 是否编辑
   */
  get isEdit() {
    return !!this.editId;
  }

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  /**
   * 删除支付方式组合
   */
  async onDelPayment(paymentList: FormControl<PaymentMethodGoMoneyItem[] | null>, i: number) {
    if (await this.confirmModalService.open({ msgLang: 'form.isDelete' }).result) {
      const res = paymentList.value?.filter((e, n) => n !== i) || [];
      paymentList.setValue(res);
    }
  }

  /**
   * 编辑当前支付方式
   * @param paymentSelectTpl
   * @param item
   * @param index
   */
  async onOpenPayment(paymentSelectTpl: TemplateRef<any>, item: FormGroup<ExtraRewardForm>, index: number) {
    const curSelect = cloneDeep(item.controls.payment.value || []);
    const otherPaymentList = cloneDeep(this.group.getRawValue())
      .filter((j, i) => i !== index)
      .map((e) => e.payment)
      .filter((e) => !!e)
      .flat(1);
    const allowPaymentList = this.goMoneyPaymentList.filter((e) =>
      otherPaymentList.length ? otherPaymentList.every((b) => b!.key !== e.key) : true
    );

    if (!allowPaymentList.length)
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli13.notUsePaymentTips' });

    const modal = this.modalService.open(paymentSelectTpl, {
      width: '600px',
      data: {
        select: curSelect,
        allowPaymentList,
        index,
      },
    });

    const result = await modal.result;
    if (!result) return;
    item.controls.payment.setValue(result);
  }

  /**
   * 更新支付方式选择
   */
  onPaymentSelChange(
    data: { select: PaymentMethodGoMoneyItem[]; allowPaymentList: PaymentMethodGoMoneyItem[]; index: number },
    paymentItem: PaymentMethodGoMoneyItem
  ) {
    if (data.select.some((e) => e.key === paymentItem.key)) {
      data.select = data.select.filter((e) => e.key !== paymentItem.key);
    } else {
      data.select.push(paymentItem);
    }
  }

  /**
   * 支付方式是否选中
   */
  onPaymentIsChecked(
    data: { select: PaymentMethodGoMoneyItem[]; allowPaymentList: PaymentMethodGoMoneyItem[]; index: number },
    paymentItem: PaymentMethodGoMoneyItem
  ) {
    return data.select.some((e) => e.key === paymentItem.key);
  }

  /**
   * 首次额外奖励
   */
  async onSelectPrize(item: ExtraRewardFormPrize) {
    const modal = this.modalService.open<PrizeSelectComponent, any, Prize>(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });

    const result = await modal.result;
    if (!result) return;

    if (![1, 2, 7].includes(result.prizeType) || result.amountType !== 2) {
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli13.tips' });
    }

    item.controls.prizeId.setValue(result);
  }

  /**
   * 下次额外奖励编辑次数
   */
  onPrizeTimesEdit(plusValue: number, item: FormGroup<ExtraRewardForm>) {
    const resultValue = item.value.nextExtraRewardCount! + plusValue;
    if (resultValue === 0 || !plusValue) return;

    item.controls.nextExtraRewardCount.setValue(resultValue);
    if (plusValue > 0) {
      new Array(plusValue).fill(0).forEach(() => {
        item.controls.next.push(
          this.fb.group({
            minDepositUsdt: [0, Validators.required],
            number: [item.controls.next.length + 2],
            prizeId: [null as Prize | null, Validators.required],
          })
        );
      });
    } else {
      item.controls.next.removeAt(plusValue);
    }
  }

  /**
   * 每次不同类型选中
   */
  onDifferent(item: FormGroup<ExtraRewardForm>) {
    if (!item.controls.next.length) {
      item.controls.next.push(
        this.fb.group({
          minDepositUsdt: [0, Validators.required],
          number: [2],
          prizeId: [null as Prize | null, Validators.required],
        })
      );
    }

    item.controls.next.controls.forEach((c) => {
      c.controls.minDepositUsdt.setValidators(Validators.required);
      c.controls.prizeId.setValidators(Validators.required);
    });

    item.controls.nextExtraRewardCount.setValue(item.controls.next.length);
  }

  /**
   * 新增支付方式组合
   */
  onAddPayment() {
    this.group.push(
      this.fb.group({
        payment: [[] as PaymentMethodGoMoneyItem[], validatorArrayRequired], // 支付方式
        first: this.fb.group({
          minDepositUsdt: [0, Validators.required], // 最低存款Usdt
          number: [0], // 奖励序号
          prizeId: [null as Prize | null, Validators.required], // 奖品 ID
        }), // 首存奖励
        nextExtraRewardType: ['same'], // 下次额外奖励类型   每次相同/每次不同
        nextExtraRewardCount: [2], // 下次额外奖励次数
        next: this.fb.array([
          this.fb.group({
            minDepositUsdt: [0, Validators.required], // 最低存款Usdt
            number: [2], // 奖励序号
            prizeId: [null as Prize | null, Validators.required], // 奖品 ID
          }),
        ]), // 下次额外奖励
      })
    );
  }

  /**
   * 删除支付方式组合
   * @param i
   */
  onDelPaymentCombine(i: number) {
    this.group.removeAt(i);
  }

  async jump(lastPath: string) {
    return this.router.navigate(
      [`${extraRewardInstance.stepPath}/${lastPath}${this.isReadonly ? '-view' : ''}`, this.id],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          sTime: this.timeRange[0] || 0,
          eTime: this.timeRange[1] || 0,
        },
      }
    );
  }

  /**
   * 处理详情
   */
  processDetail(data?: ExtraRewardParams) {
    if (!data) return;

    this.form.patchValue({ dailyMaxLimit: data.dailyMaxLimit || null });

    this.group = this.fb.array(
      data.prizeItems.map((e) => {
        return this.fb.group({
          payment: [
            e.paymentMethods
              .map((paymentId) => this.goMoneyPaymentList.find((j) => j.key === paymentId)!)
              .filter((e) => e),
            validatorArrayRequired,
          ], // 支付方式
          first: this.fb.group({
            minDepositUsdt: [e.firstDepositPrize.minDepositUsdt, Validators.required], // 最低存款Usdt
            number: [e.firstDepositPrize.number], // 奖励序号
            prizeId: [
              this.prizeList.find((p) => p.id === +e.firstDepositPrize.prizeId) as Prize | null,
              Validators.required,
            ], // 奖品 ID
          }), // 首存奖励
          nextExtraRewardType: [e.otherDepositPrizeType], // 下次额外奖励类型   每次相同/每次不同
          nextExtraRewardCount: [e.otherDepositPrizeNum], // 下次额外奖励次数
          next: this.fb.array(
            e.otherDepositPrizes.map((j) =>
              this.fb.group({
                minDepositUsdt: [j.minDepositUsdt, Validators.required], // 最低存款Usdt
                number: [j.number], // 奖励序号
                prizeId: [this.prizeList.find((p) => p.id === +j.prizeId) as Prize | null, Validators.required], // 奖品 ID
              })
            )
          ), // 下次额外奖励
        });
      })
    );

    if (this.isReadonly) {
      this.group.disable();
      this.form.disable();
    }
  }

  /**
   * 提交
   */
  onSubmit() {
    this.form.markAllAsTouched();
    this.group.markAllAsTouched();

    // 请正确填写表单
    if (this.form.invalid || this.group.invalid)
      return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    // 请至少添加一个
    if (!this.group.value.length)
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli13.emptyTips' });

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .extraBonus({
        dailyMaxLimit: this.form.value.dailyMaxLimit!,
        number: this.group.value.length,
        prizeItems: this.group.value.map((e) => {
          return {
            firstDepositPrize: {
              minDepositUsdt: e.first!.minDepositUsdt!,
              number: e.first!.number!,
              prizeId: String(e.first!.prizeId!.id),
            },
            otherDepositPrizeNum: e.nextExtraRewardCount!, // 下次存款奖励次数
            otherDepositPrizeType: e.nextExtraRewardType!, // 下次存款奖励类型(same=每次相同/different=每次不同)
            otherDepositPrizes: (e.next || []).map((j, i) => ({
              minDepositUsdt: j.minDepositUsdt!,
              number: i + 2,
              prizeId: String(j.prizeId!.id),
            })),
            paymentMethods: (e.payment || []).map((e) => e.key), // 支付方式组合
          };
        }),
        tenantId: +this.tenantId,
        tmpCode: this.code,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message || 'fail' });
        this.appService.toastOpera(true);
        this.toList();
      });
  }

  toList() {
    this.router.navigate([extraRewardInstance.link]);
  }

  onBack() {
    this.jump('qualifications');
  }

  /**
   * 都相同
   * @param item
   */
  onSame(item: FormGroup<ExtraRewardForm>) {
    item.controls.next.controls.forEach((e, i) => {
      if (i === 0) return;
      e.controls.minDepositUsdt.clearValidators();
      e.controls.prizeId.clearValidators();
    });
  }

  getPrizeSatus(status: any) {
    const list: any = new Map([
      [1, 'member.coupon.pendingReview'],
      [3, 'member.coupon.beenRemoved'],
      [4, 'member.coupon.pendingReview'],
    ]);
    return list.get(status) || '-';
  }
}

@Component({
  selector: 'edit-view',
  standalone: true,
  imports: [ExtraRewardEditComponent],
  template: '<extra-reward-edit [isView]="true"></extra-reward-edit>',
})
export class ExtraRewardEditViewComponent {}
