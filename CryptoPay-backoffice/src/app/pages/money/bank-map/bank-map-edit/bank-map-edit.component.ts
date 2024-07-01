import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { zip } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { BankApi } from 'src/app/shared/api/bank.api';
import { UploadChange } from 'src/app/shared/interfaces/upload';
import { validatorTrue } from 'src/app/shared/models/validator';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { searchFilter } from 'src/app/shared/pipes/array.pipe';
import { DisableControlDirective } from 'src/app/shared/directive/control.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DefaultDirective } from 'src/app/shared/components/upload/default.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
@Component({
  templateUrl: './bank-map-edit.component.html',
  styleUrls: ['./bank-map-edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    MatTabsModule,
    NgIf,
    MatInputModule,
    UploadComponent,
    DefaultDirective,
    AngularSvgIconModule,
    DisableControlDirective,
    searchFilter,
    LangPipe,
  ],
})
export class BankMapEditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    public router: Router,
    public modal: MatModal,
    public selectApi: SelectApi,
    public channelApi: ChannelApi,
    public api: BankApi,
    private activatedRoute: ActivatedRoute,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = +id || 0;
  }

  id = 0;
  curTab = 0;
  tabList: any[] = [
    { formKey: 'manual', name: 'payment.bankMap.manualEntry' },
    { formKey: 'batch', name: 'payment.bankMap.batchConfiguration' },
  ];

  currencyList: any[] = [];
  channelList: any[] = [];
  paymentList: PaymentMethod[] = [];
  bankList: any[] = [];
  formGroup!: FormGroup;
  searchBank: any = {};

  /** getters */
  get manualFormGroup() {
    return this.formGroup.controls['manual'] as FormGroup;
  }

  get batchFormGroup() {
    return this.formGroup.controls['batch'] as FormGroup;
  }

  get batchListForm() {
    return this.formGroup.controls['batch']['controls']['list'] as FormArray | any;
  }

  get isEdit() {
    return !!this.id;
  }

  get curTabData() {
    return this.tabList[this.curTab] || {};
  }

  /** 可选的银行列表 */
  get allowBankList() {
    return this.bankList.filter((e) => e.currencyType.includes(this.formGroup.value.currency));
  }

  /** 当前币种数据 */
  get curCurrency() {
    return this.currencyList.find((e) => e.code === this.formGroup.value.currency);
  }

  /** 当前手动输入银行 */
  get curManualBank() {
    return this.allowBankList.find((e) => e.bankCode === this.formGroup.value.manual.name);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();

    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.goMoneyGetCurrencies(),
      this.channelApi.getAllChannels(),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.selectApi.goMoneyGetBankList()
    ).subscribe(([currency, channel, payment, bank]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.currencyList = currency;
      this.channelList = channel;
      this.paymentList = payment;
      this.bankList = bank;
    });
  }

  /** methods */
  loadForm() {
    this.formGroup = this.fb.group({
      channelId: ['', Validators.required],
      currency: ['', Validators.required],
      method: ['', Validators.required],

      // 手动输入
      manual: this.fb.group({
        state: [true],
        name: ['', Validators.required],
        code: ['', Validators.required],
        map: ['', Validators.required],
      }),

      // 批量配置
      batch: this.fb.group({
        excel: ['', Validators.required],
        list: this.fb.array([]),
      }),
    });
  }

  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if (
      this.formGroup.controls['channelId'].invalid ||
      this.formGroup.controls['currency'].invalid ||
      this.formGroup.controls['method'].invalid
    )
      return;

    let sendData: any[] = [];
    const preData = {
      channelId: this.formGroup.value['channelId'],
      currencyType: this.formGroup.value['currency'],
      paymentMethodId: this.formGroup.value['method'],
    };

    // 手动输入
    let msg = await this.lang.getOne('payment.bankMap.ofCurrenciesDoNot');
    if (this.curTabData.formKey === 'manual') {
      if (this.manualFormGroup.invalid) return;
      if (!this.allowBankList.length && !this.formGroup.value.manual.name)
        return this.appService.showToastSubject.next({
          msg: this.formGroup.value.currency + msg,
        });

      sendData = [
        {
          ...preData,
          // bankName: this.formGroup.value['manual']['name'],
          bankCode: this.formGroup.value['manual']['code'],
          bankCodeMapping: this.formGroup.value['manual']['map'],
          isEnable: this.formGroup.value['manual']['state'],
        },
      ];
    } else if (this.curTabData.formKey === 'batch') {
      if (this.batchFormGroup.controls['excel'].invalid)
        return this.appService.showToastSubject.next({ msgLang: 'payment.bankMap.pleaseUploadExcel' });
      else if (!this.batchListForm.value.every((e) => e.isEnable))
        return this.appService.showToastSubject.next({ msgLang: 'payment.bankMap.beTurnedOn' });
      else if (this.batchListForm.invalid)
        return this.appService.showToastSubject.next({
          msgLang: 'payment.bankMap.incompleteData',
        });
      else if (!this.batchListForm.value?.length)
        return this.appService.showToastSubject.next({
          msgLang: 'payment.bankMap.mappingData',
        });

      sendData = this.batchListForm.value.map((e) => ({
        ...preData,
        bankCode: e.bankCode,
        bankCodeMapping: e.bankCodeMapping,
        isEnable: e.isEnable,
      }));
    } else {
      // 没有所支持的提交方式！
      let tips = await this.lang.getOne('payment.bankMap.noSupSubmissionMethod');
      throw Error(tips);
    }

    let type = 'addBankMap';
    if (this.isEdit) type = 'updateBankMap';

    this.api[type](sendData).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);
      // 翻译
      // 更新
      let update = await this.lang.getOne('payment.currency.update');
      // 新增;
      let adds = await this.lang.getOne('common.add');
      // 成功;
      let success = await this.lang.getOne('common.success');
      // 失败;
      let fail = await this.lang.getOne('common.fail');
      // over
      const successed = res === true; // 避免为其他对象值
      const msg = (this.isEdit ? update : adds) + (successed ? success : fail);

      this.appService.showToastSubject.next({ msg, successed });
      successed && this.onBack();
    });
  }

  downloadExcel(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.downloadBankMapExcel().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res) return this.appService.showToastSubject.next({ msgLang: 'payment.bankMap.downloadFailed' });
    });
  }

  async onDelBatch(tpl, item: FormGroup, i: number) {
    if ((await this.modal.open(tpl, { width: '500px', data: item.value }).result) !== true) return;

    this.batchListForm.removeAt(i);
  }

  onBack() {
    this.router.navigate(['/money/bank-map']);
  }

  /** 币种变化 */
  async onCurrency({ value }) {
    let msg = await this.lang.getOne('payment.bankMap.notHaveBankData');
    if (!this.allowBankList.length)
      this.appService.showToastSubject.next({
        msg: value + msg,
      });
    this.formGroup.patchValue({
      manual: {
        name: '',
        code: '',
      },
    });
  }

  /** 手动银行选择 */
  onManualBank() {
    this.formGroup.patchValue({
      manual: {
        code: this.curManualBank.bankCode,
      },
    });
  }

  /** 清空excel上传 */
  onClearExcel() {
    (this.batchFormGroup.get('list') as FormArray).clear();
  }

  /** 上传解析excel流请求 */
  uploadExcel$ = (file) => {
    const { channelId: channelId, currency: currencyType, method: paymentMethodId } = this.formGroup.value;

    // this.formGroup.controls['channelId'].markAsTouched();
    // this.formGroup.controls['currency'].markAsTouched();
    // this.formGroup.controls['method'].markAsTouched();
    //
    // if (!channelId || !currencyType || !paymentMethodId) {
    //   throw new Error('请选择之后再上传')
    // }

    return this.api.parseBankMapByExcel({ channelId, currencyType, paymentMethodId }, file, {
      reportProgress: true,
      observe: 'events',
    });
  };

  /** excel上传完回调 */
  onUploadExcelChange({ upload }: UploadChange) {
    if (upload?.state !== 'DONE') return;

    if (!Array.isArray(upload.body))
      return this.appService.showToastSubject.next({ msgLang: 'payment.bankMap.parseError' });
    else if (!upload.body.length)
      return this.appService.showToastSubject.next({ msgLang: 'payment.bankMap.resolvesToEmpty' });

    this.batchFormGroup.setControl('list', this.toArrayGroup(upload.body));
  }

  /** 转excel批量的ArrayGroup */
  toArrayGroup(bm: any[]) {
    return this.fb.array(
      bm.map((e) =>
        this.fb.group({
          disabled: [e.isEnable], // 是否后台匹配成功，匹配成功将不能进行改动
          bankName: [e.bankCode || '', Validators.required],
          bankCode: [e.bankCode || '', Validators.required],
          bankNameMapping: [e.bankNameLocalMapping || '', Validators.required],
          bankCodeMapping: [e.bankCodeMapping || '', Validators.required],
          isEnable: [e.isEnable, validatorTrue],
        })
      )
    );
  }

  /** 银行下拉搜索词 */
  onSearchBank(key: string, word: any) {
    this.searchBank[key] = word || '';
  }

  /** 打开或关闭搜索下拉 */
  onOpenSearch(isOpen: boolean, key: string, el: HTMLInputElement) {
    if (isOpen) {
      el.value = '';
      el.focus();
    } else {
      this.searchBank[key] = '';
    }
  }

  /** excel的银行选择 */
  onBatchBank({ value }, item: FormGroup) {
    item.get('bankCode')?.setValue(value);
    item.get('isEnable')?.setValue(true);
  }
}
