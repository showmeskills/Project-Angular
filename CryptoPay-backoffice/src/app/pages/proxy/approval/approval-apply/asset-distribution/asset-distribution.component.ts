import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { MatTabsModule } from '@angular/material/tabs';
import { UploadModule } from 'src/app/shared/components/upload/upload.module';

import { MatDialogModule } from '@angular/material/dialog';
import { MatModal, MatModalModule } from 'src/app/shared/components/dialogs/modal';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { Router } from '@angular/router';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PayService } from 'src/app/pages/proxy/approval/approval-apply/pay.service';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { UploadChange } from 'src/app/shared/interfaces/upload';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import { FilterKeyPipe } from 'src/app/shared/pipes/array.pipe';
import { InputFloatDirective, InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';

@Component({
  selector: 'asset-distribution',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormRowModule,
    MatTabsModule,
    UploadModule,
    MatDialogModule,
    MatModalModule,
    LangModule,
    FilterKeyPipe,
    InputFloatDirective,
    InputTrimDirective,
    SearchDirective,
    SearchInpDirective,
  ],
  templateUrl: './asset-distribution.component.html',
  styleUrls: ['./asset-distribution.component.scss'],
  providers: [DestroyService],
})
export class AssetDistributionComponent implements OnInit {
  constructor(
    public modal: MatModal,
    private router: Router,
    private selectApi: SelectApi,
    public appService: AppService,
    private channelApi: ChannelApi,
    public subHeader: SubHeaderService,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private zone: NgZone,
    public ls: LocalStorageService,
    public lang: LangService,
    public payService: PayService,
    private destroy$: DestroyService
  ) {}

  curApplyType = 0;
  isLoadingBatch = false;

  get isManual() {
    return this.curApplyType === 0;
  }

  get isBatch() {
    return this.curApplyType === 1;
  }

  get manualChannelId() {
    return this.payService.channelListByAll.find((e) => e.channelAccountId === this.manual.value.channel)?.channelId;
  }

  get batchChannelId() {
    return this.payService.channelListByAll.find((e) => e.channelAccountId === this.batch.value.channel)?.channelId;
  }

  get currentManualChannel() {
    return this.payService.channelListByAll.find((e) => e.channelAccountId === this.manual.value.channel);
  }

  get currentBatchChannel() {
    return this.payService.channelListByAll.find((e) => e.channelAccountId === this.batch.value.channel);
  }

  /** 转账网络 */
  get networkList(): any[] {
    return this.payService.channelListByAll.filter((e) => e.currency === this.manual.value?.exchangeCurrency);
  }

  /** 手动输入 */
  manual = this.fb.group({
    channel: ['', this.ls.isGB ? Validators.required : null],
    currency: ['', Validators.required],
    exchangeCurrency: ['', Validators.required],

    // 添加多笔操作
    list: this.fb.array([this.addManual()]),
  });

  /** 批量 */
  batch = this.fb.group({
    excel: ['', Validators.required],
    list: [[] as any[]],
    channel: [''],
  }) as FormGroup<{
    excel: FormControl<string | null>;
    list: FormControl<any | any[]>;
    channel: FormControl<string | null>;
  }>;

  ngOnInit(): void {
    this.payService.channelListChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.channelInit();
    });
  }

  /** 虚拟币手动输入列表 */
  get manualList(): FormArray<FormGroup> {
    return this.manual?.get('list') as FormArray<FormGroup>;
  }

  /** 虚拟币手动输入列表 */
  get batchExcelList() {
    return this.batch.value.list;
  }

  /** 允许手动的渠道 */
  get allowManualChannelList() {
    return this.payService.channelListByAll.filter((e) => e.currency === this.manual.value.currency);
  }

  /** 允许批量的渠道 */
  get allowBatchChannelList() {
    return this.payService.channelListByAll.filter((e) => e.currency === this.batch.value.list?.[0]?.currency);
  }

  /** 添加虚拟币手动输入 */
  addManual(el?) {
    const list = this.manualList;
    const item = this.fb.group({
      // exchangeCurrency: ['', Validators.required],
      exchangeRate: ['', Validators.required],
      exchangeAmount: ['', Validators.required],
      amount: ['', Validators.compose([validatorNumberRequired, this.validatorAmountRange()])],
      hash: ['', Validators.required],
      network: ['', Validators.required],
      merchantId: ['', Validators.required],
      // integral: [''],
    });

    list?.push(item);
    el && this.scrollBottom(el);

    return item;
  }

  /** 滚动到底部 */
  scrollBottom(el: any) {
    if (!el?.scrollTop) return;

    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        el.scrollTop = 9e9;
      });
    }, 0);
  }

  validatorAmountRange(): ValidatorFn {
    return () => {
      return null;
    };
  }

  /** 币种改变 */
  currencyChange() {
    if (!this.allowManualChannelList.length && this.manual.value.currency) {
      this.appService.showToastSubject.next({ msgLang: 'budget.noCurrencyChannels' });
    }

    this.manual.controls.channel.setValue('');
  }

  /** 上传excel回调 */
  async onUploadChange({ upload }: UploadChange) {
    if (upload?.state !== 'DONE') return;

    this.isLoadingBatch = true;
    setTimeout(async () => {
      this.isLoadingBatch = false;

      const res = Array.isArray(upload.body) ? upload.body : [];

      if (!res.length) {
        this.appService.showToastSubject.next({
          msg: (await this.lang.getOne('budget.parseError')) + ' ' + (upload.body?.detail || ''),
        });

        this.batch.controls.excel?.setValue('');
      } else {
        this.batch.controls.list?.setValue(res);

        if (!this.allowBatchChannelList.length) {
          this.appService.showToastSubject.next({ msgLang: `budget.noChannelAvailable` });
        }

        this.batch.controls.channel?.setValue('');
        this.channelInit();
      }
    }, 1);
  }

  /** 分批 - 移除类目 */
  onRemoveBatch(number: number) {
    const list: any[] = this.batchExcelList || [];
    list.splice(number, 1);

    !list.length && this.batch.controls.excel?.setValue('');
  }

  onDownloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.withdrawDownloadTemplate(WithdrawalTypeEnum.CurrencyExchange).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /** 批量清空excel */
  onClearExcel() {
    this.manual.controls.list?.reset([]);
    this.batch.controls.list?.reset([]);
    this.channelInit();
  }

  /** 渠道 - 重置渠道以及校验 */
  channelInit() {
    this.manual.controls.channel?.reset('');
    this.batch.controls.channel?.reset('');
  }

  /** 上传分批excel流请求 - 虚拟币 */
  uploadExcelDigital = (file) =>
    this.channelApi.withdrawExcelParseAsset(file, {
      reportProgress: true,
      observe: 'events',
    });
}
