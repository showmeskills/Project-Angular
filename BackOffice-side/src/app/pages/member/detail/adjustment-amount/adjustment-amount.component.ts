import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { RadioSelectComponent } from 'src/app/shared/components/radio-select/radio-select.component';
import { lastValueFrom, zip, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { ActivatedRoute } from '@angular/router';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { GameApi } from 'src/app/shared/api/game.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UserAmountLimitData } from 'src/app/shared/interfaces/member.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { DetailService } from '../detail.service';

@Component({
  selector: 'adjustment-amount',
  templateUrl: './adjustment-amount.component.html',
  styleUrls: ['./adjustment-amount.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatSelectModule,
    MatOptionModule,
    CurrencyIconDirective,
    FormWrapComponent,
    InputFloatDirective,
    NgFor,
    MatFormFieldModule,
    UploadComponent,
    LangPipe,
    CurrencyValuePipe,
  ],
})
export class AdjustmentAmountComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public modal: MatModalRef<any>,
    private modalService: MatModal,
    private appService: AppService,
    private selectApi: SelectApi,
    private api: AssetApi,
    private route: ActivatedRoute,
    public lang: LangService,
    private gameApi: GameApi,
    private detailService: DetailService
  ) {
    const { uid } = this.route.snapshot.queryParams;
    this.uid = uid;
  }

  uid;

  formGroup!: FormGroup;
  validator!: FormValidator;
  isDigital = true;
  currencyModal!: MatModalRef<any>;

  amount = 0; // 金额
  amountLimitData: UserAmountLimitData; // 调账金额限制
  isAmountInvalid = false;
  isAmoutAdd = true; // 默认 +

  limit = 0; // 提款流水要求
  isLimitAdd = true; // 默认 +

  type = 1;
  typeList = this.detailService.adjustmentTypeList;

  baseId = '';
  providerList: any[] = []; // 游戏厂商列表

  gameCategory = '';
  gameList: any[] = []; // 游戏厂商支持的游戏列表

  private _currencyList: any[] = [];

  /** getters */
  get currencyList() {
    return this._currencyList.filter((e) => e.isDigital === this.isDigital);
  }

  get curCurrency(): any {
    return this._currencyList.find((e) => e.code === this.formGroup.value['currency']) || {};
  }

  get currencyName() {
    return this._currencyList.find((e) => e.code === this.formGroup.value['currency'])?.code || '';
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loading(true);
    zip(this.getProvider()).subscribe(() => {
      this.loading(false);
    });

    this.formGroup = this.fb.group({
      username: ['main', Validators.compose([Validators.required])],
      currency: ['', Validators.compose([Validators.required])],
      remark: ['', Validators.compose([Validators.required])],
      image: ['', Validators.required],
    });
    this.validator = new FormValidator(this.formGroup);
  }

  /** methods */
  /**
   * 获取该管理后台账号调账限额
   */
  getlimitdata() {
    this.loading(true);
    this.api.getlimitdata(this.currencyName).subscribe((res) => {
      this.loading(false);
      if (res) this.amountLimitData = res;
    });
  }

  /**
   * 获取游戏厂商所有数据
   */
  getProvider() {
    return this.gameApi.getProvider({ baseID: '', abbreviation: '', page: 1, pageSize: 999 }).pipe(
      tap((res) => {
        this.providerList = res?.list || [];
      })
    );
  }

  /**
   * 监听余额变化
   */
  amountValueChange(e) {
    this.isAmountInvalid = !e;
    if (typeof this.amountLimitData?.isNeedLimit === 'boolean' && this.amountLimitData?.isNeedLimit) {
      this.isAmountInvalid = !e || e > this.amountLimitData?.availableAmount;
    }
  }

  // 打开选择币种框
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onOpenCurrency(tabTpl): Promise<void> {
    if (!this._currencyList.length) {
      this.appService.isContentLoadingSubject.next(true);
      this._currencyList = (await lastValueFrom(this.selectApi.getCurrencySelect())) || [];
      this.appService.isContentLoadingSubject.next(false);
    }

    this.currencyModal = this.modalService.open(RadioSelectComponent, {
      width: '500px',
    });
    this.currencyModal.componentInstance['title'] = (await this.lang.getOne('payment.currency.chooseCurrency')) || '';
    this.currencyModal.componentInstance['tabTemplate'] = tabTpl;
    this.currencyModal.componentInstance['list'] = this.currencyList;
    this.currencyModal.componentInstance['label'] = 'code';
    this.currencyModal.componentInstance['value'] = 'code';
    this.currencyModal.componentInstance['select'] = [this.formGroup.value['currency']];

    const currency = (await this.currencyModal.result) || '';
    if (currency !== this.formGroup.value['currency']) {
      this.formGroup.patchValue({ currency });
      this.getlimitdata();
    }
  }

  // 调账余额浮层提交
  onSubmit(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    if (this.isAmountInvalid) return;

    this.loading(true);
    this.api
      .myAddAdjustWallet({
        uid: this.uid,
        category: this.formGroup.value['username'],
        currency: this.formGroup.value['currency'],
        amount: this.amount || 0,
        withdrawLimit: this.limit || 0,
        remark: this.formGroup.value['remark'],
        attachmentList: [this.formGroup.value['image']],
        adjustType: this.type,
        ...(this.type === 4
          ? {
              baseId: this.baseId,
              gameCategory: this.gameCategory,
              providerId: this.gameList.find((v) => v.category === this.gameCategory)['providerId'],
            }
          : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        if (res === true) this.modal.close(true);
        this.appService.toastOpera(res === true);
      });
  }

  // 投影选择币种tab内容切换
  onCurrencyTab(digital: boolean): void {
    this.isDigital = digital;
    if (!this.currencyModal) return;
    this.currencyModal.componentInstance['list'] = this.currencyList;
  }

  addCut(category: any, type: any) {
    if (category === 'amount') {
      if (type === 'add') {
        this.isAmoutAdd = true;
        ++this.amount;
        return;
      }
      this.isAmoutAdd = false;
      --this.amount;
    } else if (category === 'limit') {
      if (type === 'add') {
        this.isLimitAdd = true;
        ++this.limit;
        return;
      }
      this.isLimitAdd = false;
      --this.limit;
    }
  }

  // 游戏厂商选择 -> 联动支持的游戏
  onProviderChange({ value }) {
    this.gameList = this.providerList.find((e) => e.baseId === value)?.details || [];
  }

  loading(v: any): void {
    this.appService.isContentLoadingSubject.next(v);
  }
}
