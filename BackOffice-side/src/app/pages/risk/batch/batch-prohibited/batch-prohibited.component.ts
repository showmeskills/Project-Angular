import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { BatchProhibitedParams, BatchUpSubmitResponse, BatchProhibitedInfo } from 'src/app/shared/interfaces/risk';
import { SelectApi } from 'src/app/shared/api/select.api';
import { takeUntil } from 'rxjs/operators';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { finalize, forkJoin } from 'rxjs';
import { ProviderGroupItem } from 'src/app/shared/interfaces/select.interface';
import { PaymentCategoryEnum } from 'src/app/shared/interfaces/transaction';
import { ProviderSelect } from 'src/app/shared/interfaces/provider';
import { BatchMainType, BatchService } from 'src/app/pages/risk/batch/batch.service';
import { MatTabsModule } from '@angular/material/tabs';
import { TimeCompoentComponent } from 'src/app/pages/member/detail/overview/time-compoent/time-compoent.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { CheckboxArrayControlDirective } from 'src/app/shared/directive/input.directive';
import { UploadChange } from 'src/app/shared/interfaces/upload';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
export interface paySelect {
  lang: string;
  name: string; // 厂商总名称
  type: string; // 厂商分类id
}
@Component({
  selector: 'batch-prohibited',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    UploadComponent,
    AngularSvgIconModule,
    LangPipe,
    ReactiveFormsModule,
    EmptyComponent,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    FormsModule,
    InputTrimDirective,
    SearchInpDirective,
    SearchDirective,
    MatTabsModule,
    TimeCompoentComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    CheckboxArrayControlDirective,
    TimeFormatPipe,
  ],
  templateUrl: './batch-prohibited.component.html',
  styleUrls: ['./batch-prohibited.component.scss'],
  providers: [DestroyService],
})
export class BatchProhibitedComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: RiskApi,
    private fb: FormBuilder,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private confirmModalService: ConfirmModalService,
    private selectApi: SelectApi,
    public batchService: BatchService,
    public lang: LangService
  ) {}

  protected readonly BatchMainType = BatchMainType;
  protected readonly PaymentCategoryEnum = PaymentCategoryEnum;

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = true;
      forkJoin([
        this.selectApi.getProviderGroupSelect({
          tenantId: this.subHeaderService.merchantCurrentId,
          gameStatue: 'Online',
        }),
      ])
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(([providerList]) => {
          this.providerList = providerList;
        });

      this.formGroup.controls.forEach((e) => {
        // if (e.controls.main.value !== BatchMainType.game) return;
        e.controls.gametype.setValue('');
        e.controls.gameCodes.setValue([]);
      });
    });
  }

  loading = false;

  payTypeList = [
    {
      name: '存款',
      code: 'Deposit',
      lang: 'payment.method.deposit',
      list: [
        { name: '法币', lang: 'member.overview.depositFiatCurrency', type: 'Legal-d' },
        { name: '信用卡买币', lang: 'member.overview.cradBuyCoins', type: 'BankCard' },
      ],
    },
    {
      name: '提款',
      code: 'Withdraw',
      lang: 'payment.method.withdrawal',
      list: [
        { name: '法币', lang: 'member.overview.withdrawalFiatCurrency', type: 'Legal-w' },
        { name: '加密货币', lang: 'member.overview.cryptocurrency', type: 'Encryption' },
      ],
    },
  ];
  /**存款列表 */
  // depositList = [
  //   { name: '法币', checked: false, lang: 'member.overview.fiatCurrency', type: 'Legal' },
  //   { name: '信用卡买币', checked: false, lang: 'member.overview.cradBuyCoins', type: 'BankCard' },
  // ];

  // /**提款列表 */
  // withdrawalList = [
  //   { name: '法币', checked: false, lang: 'member.overview.fiatCurrency', type: 'Legal' },
  //   { name: '加密货币', checked: false, lang: 'member.overview.cryptocurrency', type: 'Encryption' },
  // ];

  // allchecked = { name: '全部', lang: 'common.all', checked: false };
  formGroup = this.fb.array([this.generateItem()]);
  providerList: ProviderGroupItem<ProviderSelect>[] = [];
  gameList: ProviderSelect[][] = [];
  payList: paySelect[][] = [];
  minDate = new Date();
  curApplyType = 0;

  isUploading = false;
  /** 批量 */
  fiatBatch = this.fb.group({
    excel: ['', Validators.required],
  });

  data = {
    batchId: '',
    list: [] as BatchProhibitedInfo[],
  };

  get list() {
    return this.data.list;
  }

  set list(val) {
    this.data.list = val;
  }

  submit() {
    let params = {} as BatchProhibitedParams;

    if (this.curApplyType == 0) {
      this.formGroup.markAllAsTouched();

      if (!this.formGroup.length) return this.appService.showToastSubject.next({ msgLang: 'form.dataEmpty' });
      if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });
      params = this.getSendData();
    } else {
      if (!this.list.length) return this.appService.showToastSubject.next({ msgLang: 'risk.batch.emptyReupload' });

      params = {
        tenantId: +this.subHeaderService.merchantCurrentId,
        info: this.getUpDate(),
        batchId: this.data.batchId,
        isExcel: true,
      };
    }
    this.appService.isContentLoadingSubject.next(true);

    this.api.addBatchProhibited(params).subscribe((res) => {
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
  getSendData(): BatchProhibitedParams {
    const info = this.formGroup.value.map((item) => {
      const sendData = {
        uid: item.uid!,
        isLoginDisable: false, // 是否禁用登录
        isForbidLoginForever: false, // 是否终生禁止登陆 （不是终生，那么就是指定开始，结束时间） true：是 false：否
        forbidLoginStartTime: 0, // 禁用开始时间 （终生禁止给0 ）
        forbidLoginEndTime: 0, // 禁用结束时间 （终生禁止给0 ）
        isForbidGameForever: false, // 是否终生禁止游戏 （不是终生，那么就是指定开始，结束时间） true：是 false：否
        forbidGameStartTime: 0, // 禁用游戏开始时间 （终生禁止给0 ）
        forbidGameEndTime: 0, // 禁用游戏结束时间 （终生禁止给0 ）
        gameCodes: [] as string[], // 用户禁用游戏的厂商id
        isForbidPaymentForever: false, // 是否终生禁止支付方式 （不是终生，那么就是指定开始，结束时间） true：是 false：否
        forbidPaymentStartTime: 0, // 禁用支付方式开始时间 （终生禁止给0 ）
        forbidPaymentEndTime: 0, // 禁用支付方式结束时间 （终生禁止给0 ）
        depositType: [] as string[], // 存款方式 Legal:1    BankCard:2
        withdrawType: [] as string[], // 提款方式  Legal:1    Encryption:2
      };

      // 禁止登录
      if (item.isLoginDisable) {
        sendData.isLoginDisable = true;
        sendData.isForbidLoginForever = item.isForbidLoginForever!;
        sendData.forbidLoginStartTime = Number(item.forbidLoginTime?.[0]) || 0;
        sendData.forbidLoginEndTime = Number(item.forbidLoginTime?.[1]) || 0;
      }

      // 禁止游戏
      // if (item.main === BatchMainType.game) {
      if (item.isGameDisable) {
        sendData.isForbidGameForever = item.isForbidGameForever!;
        sendData.forbidGameStartTime = Number(item.forbidGameTime?.[0]) || 0;
        sendData.forbidGameEndTime = Number(item.forbidGameTime?.[1]) || 0;
        let gameCodes = [] as any as string[];
        gameCodes = item.gameCodes ? item.gameCodes : [];
        sendData.gameCodes = gameCodes;
      }

      // }

      // 禁止支付
      // if (item.main === BatchMainType.pay) {
      if (item.isPayDisable) {
        sendData.isForbidPaymentForever = item.isForbidPaymentForever!;
        sendData.forbidPaymentStartTime = Number(item.forbidPaymentTime?.[0]) || 0;
        sendData.forbidPaymentEndTime = Number(item.forbidPaymentTime?.[1]) || 0;
        let depositType = [] as string[];
        let withdrawType = [] as string[];
        (item.payValue! as any as string[])?.forEach((e) => {
          if ('Legal-d' == e) {
            depositType.push('Legal');
          }
          if ('Legal-w' == e) {
            withdrawType.push('Legal');
          }
          if ('BankCard' == e) {
            depositType.push('BankCard');
          }
          if ('Encryption' == e) {
            withdrawType.push('Encryption');
          }
        });
        sendData.depositType = depositType;
        sendData.withdrawType = withdrawType;
      }
      // sendData.depositType = item.depositType
      // sendData[item.paytype === PaymentCategoryEnum.Deposit ? 'depositType' : 'withdrawType'] =
      //   (item[PaymentCategoryEnum.Deposit] as any) || [];
      // // }

      return sendData;
    });

    return { tenantId: +this.subHeaderService.merchantCurrentId, info };
  }

  getUpDate() {
    const info = this.data.list.map((item) => {
      const sendData = {
        uid: item.uid!,
        isLoginDisable: item.isLoginDisable, // 是否禁用登录
        isForbidLoginForever: item.isForbidLoginForever, // 是否终生禁止登陆 （不是终生，那么就是指定开始，结束时间） true：是 false：否
        forbidLoginStartTime: item.forbidLoginStartTime, // 禁用开始时间 （终生禁止给0 ）
        forbidLoginEndTime: item.forbidLoginEndTime, // 禁用结束时间 （终生禁止给0 ）
        isForbidGameForever: false, // 是否终生禁止游戏 （不是终生，那么就是指定开始，结束时间） true：是 false：否
        forbidGameStartTime: 0, // 禁用游戏开始时间 （终生禁止给0 ）
        forbidGameEndTime: 0, // 禁用游戏结束时间 （终生禁止给0 ）
        gameCodes: [], // 用户禁用游戏的厂商id
        isForbidPaymentForever: item.isForbidPaymentForever, // 是否终生禁止支付方式 （不是终生，那么就是指定开始，结束时间） true：是 false：否
        forbidPaymentStartTime: item.forbidPaymentStartTime, // 禁用支付方式开始时间 （终生禁止给0 ）
        forbidPaymentEndTime: item.forbidPaymentEndTime, // 禁用支付方式结束时间 （终生禁止给0 ）
        depositType: item.depositType, // 存款方式 Legal:1    BankCard:2
        withdrawType: item.withdrawType, // 提款方式  Legal:1    Encryption:2
      };

      return sendData;
    });

    return info;
  }

  /**
   * 时间范围类型变化
   * @param group
   */
  timeRangeChange(group: (typeof this.formGroup.controls)[0], type: string) {
    if (type == 'login') {
      const isPermanent = group.value.isForbidLoginForever;
      group.controls.forbidLoginTime.setValidators(
        isPermanent ? [] : [this.timeRangeValidator('isForbidLoginForever')]
      );
      group.controls.forbidLoginTime.updateValueAndValidity();
    } else if (type == 'game') {
      const isPermanent = group.value.isForbidGameForever;
      group.controls.forbidGameTime.setValidators(isPermanent ? [] : [this.timeRangeValidator('isForbidGameForever')]);
      group.controls.forbidGameTime.updateValueAndValidity();
    } else {
      const isPermanent = group.value.isForbidPaymentForever;
      group.controls.forbidPaymentTime.setValidators(
        isPermanent ? [] : [this.timeRangeValidator('isForbidLoginForever')]
      );
      group.controls.forbidPaymentTime.updateValueAndValidity();
    }
  }

  /**
   * 时间范围校验
   */
  timeRangeValidator(permanentBan): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const timeRange = control.value;
      const isPermanent = parent.value[permanentBan];

      if (!isPermanent && (!timeRange || !timeRange.length || !timeRange[0] || !timeRange[1]))
        return { required: true };
      return null;
    };
  }

  /**
   * 删除一行
   * @param i
   */
  remove(i: number) {
    this.formGroup.removeAt(i);
    this.gameList.splice(i, 1);
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
    const group = this.fb.group({
      uid: ['', Validators.required],
      gametype: [] as Array<string>,
      allchecked: false,
      allpaychecked: false,
      paytype: [] as Array<string>,
      isLoginDisable: false,
      isGameDisable: false,
      isPayDisable: false,
      gameCodes: [[] as string[]], // 用户禁用游戏的厂商id
      isForbidLoginForever: true, // 是否永久禁止
      isForbidGameForever: true, // 是否永久禁止
      isForbidPaymentForever: true, // 是否永久禁止
      forbidLoginTime: [[] as Date[], this.timeRangeValidator('isForbidLoginForever')], // 不是永久则为：时间范围 （isForbid = false）
      forbidGameTime: [[] as Date[], this.timeRangeValidator('isForbidGameForever')], // 不是永久则为：时间范围 （isForbid = false）
      forbidPaymentTime: [[] as Date[], this.timeRangeValidator('isForbidPaymentForever')], // 不是永久则为：时间范围 （isForbid = false）
      payValue: [] as string[], // 提款方式  Legal:1   Encryption:2
    });
    // this.depositList.forEach((option, j) => {
    //   const control = this.fb.control(option.checked);
    //   ((group.get('depositType') as FormArray).controls as FormControl[]).push(control);
    // });
    // this.withdrawalList.forEach((option, j) => {
    //   const control = this.fb.control(option.checked);
    //   ((group.get('withdrawType') as FormArray).controls as FormControl[]).push(control);
    // });
    return group;
  }

  /**
   * 厂商变化
   * @param group
   * @param i
   */
  providerChange(group: (typeof this.formGroup.controls)[0], i: number) {
    group.controls.gameCodes.setValue([]);

    this.gameList[i] = this.getGameList(group);
  }

  /**
   * 获取游戏列表
   * @param group
   */
  getGameList(group): ProviderSelect[] {
    // if(){
    //   group.controls.gametype.setValue(this.providerList.map(obj => obj.code))
    // }
    if (!group.value.gametype) return [];

    const gametype = group.value.gametype.flatMap(
      (code) => (this.providerList.find((obj) => obj.code === code) || { providers: [] }).providers
    );
    let controlsGameCodes = gametype.map((obj) => obj.providerCatId);
    // const index = paytype.findIndex((item) => item === 'all');
    controlsGameCodes.push('all');
    group.controls.gameCodes.setValue(controlsGameCodes);
    return gametype;
  }

  /** 游戏交易 - 是否半选状态 */
  isIndeterminate(group): boolean {
    let hasChecked = false;
    let isAll = false;
    const gameCodes: string[] = group.value.gameCodes ?? [];

    hasChecked = gameCodes
      ? this.providerList.some((v) => v['providers'].some((j) => gameCodes.includes(j['providerCatId'])))
      : false;

    const allProviderCatIds: string[] = this.providerList.reduce(
      (acc, obj) => [...acc, ...obj.providers.map((provider) => provider.providerCatId)],
      [] as string[]
    );

    isAll = gameCodes ? allProviderCatIds.length === gameCodes.length - 1 : false;

    group.value.allchecked = hasChecked;
    group.controls.isGameDisable.setValue(hasChecked);
    return hasChecked && !isAll;
  }

  /** 游戏交易 - 勾选全部 */
  checkItem(event: Event, group, i) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      let controlsGametype = this.providerList.map((obj) => obj.code);
      controlsGametype.push('all');
      group.controls.gametype?.setValue(controlsGametype);
      this.providerChange(group, i);
    } else {
      group.controls.gametype.setValue('');
      group.controls.gameCodes.setValue('');
    }
  }

  toggleSelectAll(group, i, name) {
    // 全选
    if (group.value[name]?.includes('all')) {
      if (name == 'gametype') {
        let controlsGametype = this.providerList.map((obj) => obj.code);
        controlsGametype.push('all');
        group.controls.gametype?.setValue(controlsGametype);
        this.providerChange(group, i);
      } else {
        const gametype = group.value.gametype.flatMap(
          (code) => (this.providerList.find((obj) => obj.code === code) || { providers: [] }).providers
        );
        let controlsGameCodes = gametype.map((obj) => obj.providerCatId);
        controlsGameCodes.push('all');
        group.controls.gameCodes.setValue(controlsGameCodes);
      }
    } else {
      if (name == 'gametype') {
        group.controls.gametype.setValue('');
      }
      group.controls.gameCodes.setValue('');
    }
  }

  toggleSelectItem(group, name) {
    if (group.value[name]?.includes('all')) {
      if (name == 'gameCodes') {
        let newGameCodes = group.value[name].filter((item) => item !== 'all');
        group.controls.gameCodes.setValue(newGameCodes);
      }
    } else {
      if (name == 'gameCodes') {
        const gametype = group.value.gametype.flatMap(
          (code) => (this.providerList.find((obj) => obj.code === code) || { providers: [] }).providers
        );
        let controlsGameCodes = gametype.map((obj) => obj.providerCatId);
        if (controlsGameCodes.length == group.value[name].length) {
          group.value[name].push('all');
          group.controls.gameCodes.setValue(group.value[name]);
        }
      }
    }
  }

  /**
   * 支付种类变化
   * @param group
   */
  payCategoryChange(group: (typeof this.formGroup.controls)[0], i) {
    group.controls.payValue.setValue('');
    // group.controls.depositType.updateValueAndValidity();

    // group.controls.withdrawType.setValue('');
    // group.controls.withdrawType.updateValueAndValidity();
    this.payList[i] = this.getPayList(group);
  }

  getPayList(group) {
    if (!group.value.paytype) return [];

    const paytype = group.value.paytype.flatMap(
      (code) => (this.payTypeList.find((obj) => obj.code === code) || { list: [] }).list
    );
    let controlsGameCodes = paytype.map((obj) => obj.type);
    // const index = paytype.findIndex((item) => item === 'all');
    controlsGameCodes.push('all');
    group.controls.payValue.setValue(controlsGameCodes);
    return paytype;
  }

  ispayIndeterminate(group) {
    let hasChecked = false;
    let isAll = false;
    const payValue: string[] = group.value.payValue ?? [];

    hasChecked = payValue ? this.payTypeList.some((v) => v['list'].some((j) => payValue.includes(j['type']))) : false;

    const allProviderCatIds: string[] = this.payTypeList.reduce(
      (acc, obj) => [...acc, ...obj.list.map((provider) => provider.type)],
      [] as string[]
    );

    isAll = payValue ? allProviderCatIds.length === payValue.length - 1 : false;

    group.value.allpaychecked = hasChecked;
    group.controls.isPayDisable.setValue(hasChecked);
    return hasChecked && !isAll;
  }

  togglePaySelectAll(group, name, i) {
    // 全选
    if (group.value[name]?.includes('all')) {
      if (name == 'paytype') {
        let controlsGametype = this.payTypeList.map((obj) => obj.code);
        controlsGametype.push('all');
        group.controls.paytype?.setValue(controlsGametype);
        this.payCategoryChange(group, i);
      } else {
        const paytype = group.value.paytype.flatMap(
          (code) => (this.payTypeList.find((obj) => obj.code === code) || { list: [] }).list
        );
        let controlsGameCodes = paytype.map((obj) => obj.type);
        controlsGameCodes.push('all');
        group.controls.payValue.setValue(controlsGameCodes);
      }
    } else {
      if (name == 'paytype') {
        group.controls.paytype.setValue('');
      }
      group.controls.payValue.setValue('');
    }
  }

  checkPayItem(event: Event, group, i) {
    const isChecked = (event.target as HTMLInputElement).checked;
    // group.controls.isPayDisable.setValue(isChecked);

    if (isChecked) {
      let controlsGametype = this.payTypeList.map((obj) => obj.code);
      controlsGametype.push('all');
      group.controls.paytype?.setValue(controlsGametype);
      this.payCategoryChange(group, i);
    } else {
      group.controls.paytype.setValue('');
      group.controls.payValue.setValue('');
    }
  }

  toggleBatchSelectAll(group, name: string) {
    if (group.value[name]?.includes('all')) {
      if (name == 'payValue') {
        let newGameCodes = group.value[name].filter((item) => item !== 'all');
        group.controls.payValue.setValue(newGameCodes);
      }
    } else {
      if (name == 'payValue') {
        const paytype = group.value.paytype.flatMap(
          (code) => (this.payTypeList.find((obj) => obj.code === code) || { list: [] }).list
        );
        let controlsGameCodes = paytype.map((obj) => obj.type);
        if (controlsGameCodes.length == group.value[name].length) {
          group.value[name].push('all');
          group.controls.payValue.setValue(group.value[name]);
        }
      }
    }
  }

  /**
   * 上传excel流请求
   * @param file
   */
  uploadExcelStream = (file) =>
    this.api.uploadProhibitedFile(this.subHeaderService.merchantCurrentId, file, {
      reportProgress: true,
      observe: 'events',
    });

  /** 下载模板 */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.downBatchTemplate(3).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /**
   * 上传excel回调
   * @param upload
   */
  async onUploadChange({ upload }: UploadChange<BatchUpSubmitResponse>) {
    if (upload?.state !== 'DONE') return;

    // 解析失败
    const res = upload.body?.batchId ? upload.body : undefined;
    if (!res) return this.appService.showToastSubject.next({ msgLang: 'form.parseFail' });

    // 解析为空
    if (!res.info || !res.info.length) this.appService.showToastSubject.next({ msgLang: 'form.parseEmpty' });

    this.data.batchId = upload.body?.batchId || '';
    this.data.list = res.info || [];
  }

  clearExcel() {
    this.data = {
      batchId: '',
      list: [],
    };
  }

  /**
   * 移除批次
   * @param i
   */
  async removeBatch(i: number) {
    if ((await this.confirmModalService.open({ msgLang: 'risk.batch.removeItemTips' }).result) !== true) return;

    this.data.list.splice(i, 1);
  }
}
