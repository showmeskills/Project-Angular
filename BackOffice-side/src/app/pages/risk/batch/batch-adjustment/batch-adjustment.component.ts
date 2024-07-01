import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { InputFloatDirective, InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { AppService } from 'src/app/app.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { takeUntil } from 'rxjs/operators';
import { finalize, forkJoin } from 'rxjs';
import { BatchAdjustmentInfo, BatchAdjustmentParams } from 'src/app/shared/interfaces/risk';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { DetailService } from 'src/app/pages/member/detail/detail.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { ProviderProduct, ProviderPT } from 'src/app/shared/interfaces/provider';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { Currency } from 'src/app/shared/interfaces/currency';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import {
  AdjustmentCategoryEnum,
  AdjustmentTypeEnum,
  AdjustmentTypeValueEnum,
} from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'batch-adjustment',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    FormRowComponent,
    InputTrimDirective,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    ReactiveFormsModule,
    SearchDirective,
    SearchInpDirective,
    OwlDateTimeTriggerDirective,
    CurrencyIconDirective,
    UploadComponent,
    InputFloatDirective,
  ],
  templateUrl: './batch-adjustment.component.html',
  styleUrls: ['./batch-adjustment.component.scss'],
  providers: [DestroyService],
})
export class BatchAdjustmentComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: RiskApi,
    private fb: FormBuilder,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private confirmModalService: ConfirmModalService,
    private selectApi: SelectApi,
    public detailService: DetailService,
    private gameApi: GameApi,
    private currencyService: CurrencyService,
    private lang: LangService
  ) {}

  protected readonly AdjustmentCategoryEnum = AdjustmentCategoryEnum;

  ngOnInit(): void {
    this.loading = true;
    forkJoin([
      this.gameApi.getProvider({ baseID: '', abbreviation: '', page: 1, pageSize: 999 }),
      this.currencyService.updateCurrency(),
    ])
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(([providerList]) => {
        this.providerList = providerList?.list || [];
      });

    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });
  }

  loading = false;
  formGroup = this.fb.array([this.generateItem()]);
  currencyTypeList = [
    { name: '法币', value: false, lang: 'member.detail.balance.category.1' },
    { name: '数字货币', value: true, lang: 'member.detail.balance.category.0' },
  ];

  currencyList: Currency[][] = [];
  gameList: ProviderProduct[][] = [];

  providerList: ProviderPT[] = [];

  submit() {
    this.formGroup.markAllAsTouched();

    if (!this.formGroup.length) return this.appService.showToastSubject.next({ msgLang: 'form.dataEmpty' });
    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    this.appService.isContentLoadingSubject.next(true);
    this.api.addBatchAdjustment(this.getSendData()).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(!!res?.batchId);

      if (res?.batchId) {
        this.confirmModalService
          .open({
            msg: 'BatchID：' + res.batchId,
            type: 'success',
            dismissShow: false,
          })
          .result.finally(() => {
            this.formGroup = this.fb.array([this.generateItem()]);
          });
      }
    });
  }

  /**
   * 获取参数
   */
  getSendData(): BatchAdjustmentParams {
    const info = this.formGroup.value.map((e, i) => {
      const item: BatchAdjustmentInfo = {
        uid: e.uid!,
        category: e.account!, // 调账种类
        currency: e.currency!, // 币种
        amount: +e.amount!, // 调账金额
        withdrawLimit: +e.withdrawalLimit!, // 提款流水要求
        remark: e.remarks!, // 备注
        adjustType: e.type! as AdjustmentTypeValueEnum, // 调账类型
        attachmentList: [e.image!], // 附件
      };

      // 输赢类型传入厂商
      if (e.type === AdjustmentTypeEnum.Payout) {
        item.baseId = e.baseId!;
        item.providerId = this.gameList[i].find((v) => v.category === e.gameCategory)?.providerId!;
        item.gameCategory = e.gameCategory!;
      }

      return item;
    });

    return { tenantId: +this.subHeaderService.merchantCurrentId, info };
  }

  /**
   * 删除一行
   * @param i
   */
  remove(i: number) {
    this.formGroup.removeAt(i);
    this.formGroup.updateValueAndValidity();
  }

  /**
   * 添加一行
   */
  add() {
    this.formGroup.push(this.generateItem());
    this.formGroup.updateValueAndValidity();
  }

  generateItem() {
    return this.fb.group({
      uid: ['', Validators.required],
      account: [null as null | AdjustmentCategoryEnum, Validators.required], // 调账种类
      currencyType: ['' as '' | boolean, Validators.required],
      currency: ['', Validators.required],
      amount: ['', validatorNumberRequired], // 调账金额
      withdrawalLimit: [''], // 提款流水要求
      remarks: ['', Validators.required], // 备注
      image: ['', Validators.required], // 附件
      type: ['' as string | AdjustmentTypeValueEnum, Validators.required],
      baseId: [''], // 厂商基础ID
      gameCategory: [''], // 游戏
    });
  }

  /**
   * 厂商变化
   * @param group
   * @param i
   */
  baseIdChange(group: (typeof this.formGroup.controls)[0], i: number) {
    group.controls.gameCategory.setValue('');

    this.gameList[i] = this.getGameList(group);
  }

  /**
   * 获取游戏列表
   * @param group
   */
  getGameList(group: (typeof this.formGroup.controls)[0]): ProviderProduct[] {
    return this.providerList.find((e) => e.baseId === group.value.baseId)?.details || [];
  }

  /**
   * 币种类型变化
   */
  currencyTypeChange(group: (typeof this.formGroup.controls)[0], i) {
    group.controls.currency.setValue('');
    this.currencyList[i] = this.getCurrencyList(group);
  }

  /**
   * 获取币种列表
   */
  getCurrencyList(group: (typeof this.formGroup.controls)[0]): any[] {
    return this.currencyService.list.filter((e) => e.isDigital === group.value.currencyType);
  }

  /**
   * 币种点击
   */
  async currencyTap(group: (typeof this.formGroup.controls)[0], i) {
    const label = await this.lang.getOne('budget.currencyType');
    if (!this.currencyList[i] || !this.currencyList[i].length)
      return this.appService.showToastSubject.next({ msgLang: 'form.chooseTips', msgArgs: { label } });
  }

  /**
   * 类型变动
   */
  typeChange(group: (typeof this.formGroup.controls)[0], i) {
    // 输赢
    const isWinLose = group.value.type === 4;
    group.controls.baseId.setValue('');
    group.controls.baseId.setValidators(isWinLose ? Validators.required : null);
    group.controls.baseId.updateValueAndValidity();

    group.controls.gameCategory.setValue('');
    group.controls.gameCategory.setValidators(isWinLose ? Validators.required : null);
    group.controls.gameCategory.updateValueAndValidity();

    this.gameList[i] = [];
  }

  /**
   * 重置
   */
  reset() {
    this.formGroup = this.fb.array([this.generateItem()]);
    this.formGroup.updateValueAndValidity();
    this.loading = false;
  }
}
