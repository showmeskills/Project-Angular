import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { forkJoin, of } from 'rxjs';
import { validatorArrayRequired } from 'src/app/shared/models/validator';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import {
  ProviderCurrencyRatio,
  ProviderParamsForMerchant,
  ProviderParamsLang,
  ProviderProductDetail,
  ProviderStatus,
  ProviderStatusEnum,
} from 'src/app/shared/interfaces/provider';
import { ProviderService } from 'src/app/pages/game/game.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { cloneDeep } from 'lodash';
import {
  LangTabComponent,
  LangTabComponent as LangTabComponent_1,
} from 'src/app/shared/components/lang-tab/lang-tab.component';
import { GameCategory, GameCategoryEnum } from 'src/app/shared/interfaces/game';
import BigNumber from 'bignumber.js';
import { AddPopupComponent } from 'src/app/pages/Bonus/activity-template/add-popup/add-popup.component';
import { SelectApi } from 'src/app/shared/api/select.api';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { Country } from 'src/app/shared/interfaces/select.interface';
import { Currency } from 'src/app/shared/interfaces/currency';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { GameCategoryLangPipe } from '../game.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyIconDirective, IconCountryComponent } from 'src/app/shared/components/icon/icon.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import {
  CheckboxArrayControlDirective,
  InputFloatDirective,
  InputNumberDirective,
  InputPercentageDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';

@Component({
  templateUrl: './provider-edit.component.html',
  styleUrls: ['./provider-edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    InputTrimDirective,
    FormWrapComponent,
    InputPercentageDirective,
    LangTabComponent_1,
    AngularSvgIconModule,
    NgbPopover,
    UploadComponent,
    CheckboxArrayControlDirective,
    InputNumberDirective,
    IconCountryComponent,
    CurrencyIconDirective,
    InputFloatDirective,
    LangPipe,
    GameCategoryLangPipe,
    AttrDisabledDirective,
  ],
})
export class ProviderEditComponent implements OnInit {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    private appService: AppService,
    private api: GameApi,
    public subHeaderService: SubHeaderService,
    public providerService: ProviderService,
    private selectApi: SelectApi,
    public ls: LocalStorageService,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = id;
  }

  id = 0;
  formGroup = this.fb.group({
    baseId: ['', Validators.required],
    aliasName: ['', Validators.required],
    foundedYear: [null as null | number, Validators.required], // 成立年份
    isProxy: [true], // 是否代理
    status: [ProviderStatusEnum[ProviderStatusEnum.Online] as ProviderStatus, Validators.required], // 状态
    product: this.fb.array([this.generateProduct()]),
  });

  currencyList: Currency[] = [];
  countryList: any[] = [];
  providerBaseList: string[] = [];
  showEditTab = false; // 语种编辑
  curTab = 0; // 当前语种索引
  selectLang = [['zh-cn']]; // PM:默认值CN

  get isEdit(): boolean {
    return !!this.id;
  }

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);

    forkJoin([
      this.selectApi.getCountry(),
      this.selectApi.getCurrencySelect(),
      this.selectApi.getProviderBaseSelect(),
      this.isEdit ? this.api.getProviderDetail(this.id) : of(undefined),
      this.subHeaderService.getMerchantList$(),
    ]).subscribe(([countryList, currency, providerBase, detail]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.currencyList = currency;
      this.providerBaseList = providerBase;
      this.countryList = countryList;
      detail && this.updateDetail(detail);
    });
  }

  /**
   * 回显数据
   */
  updateDetail(detail: ProviderParamsForMerchant) {
    this.formGroup.patchValue({
      // 基础ID
      baseId: detail?.baseId,
      // 厂商简称
      aliasName: detail?.abbreviation,
      // 成立年份
      foundedYear: detail?.foundedYear,
      // 成立年份
      isProxy: detail?.isProxy || false,
      // 状态
      status: detail?.status,
    });
    if (!detail?.providerConfigDtos?.length) return;
    this.selectLang = detail.providerConfigDtos.map((j) => {
      const res = j.providerInfoDtos?.map((e) => e.lanageCode);
      return res.length ? res : ['zh-cn'];
    });

    this.formGroup.setControl('product', this.fb.array(detail.providerConfigDtos?.map((e) => this.generateProduct(e))));
  }

  @ViewChildren(LangTabComponent) langTab: QueryList<LangTabComponent>;
  onSubmit(): void {
    this.formGroup.markAllAsTouched(); // 手动执行验证
    this.langTab.toArray().forEach((e) => e.check()); // 语言未填写完整切换到相应语言索引，提高用户体验

    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api[this.isEdit ? 'updateProviderForMerchant' : 'createProviderForMerchant']({
      id: +this.id || undefined,
      baseId: this.formGroup.value.baseId!,
      abbreviation: this.formGroup.value.aliasName!,
      foundedYear: this.formGroup.value.foundedYear!,
      isProxy: this.formGroup.value.isProxy!,
      status: this.formGroup.value.status!,
      providerConfigDtos: this.formGroup.value.product!.map((e) => ({
        ...e,
        sort: e.sort || 0,
        providerInfoDtos: e.lang?.map((j) => ({ ...j })) || [],
        venueFee: new BigNumber(e.venueFee! || 0).div(100).toNumber() || 0,
        lang: undefined,
        //游戏打开方式
        gameOpenMethod: {
          h5Android: e.gameOpenMethod?.h5Android || '',
          h5Ios: e.gameOpenMethod?.h5Ios || '',
          ionicAndroid: e.gameOpenMethod?.ionicAndroid || '',
          ionicIos: e.gameOpenMethod?.ionicIos || '',
          webMac: e.gameOpenMethod?.webMac || '',
          webWindow: e.gameOpenMethod?.webWindow || '',
        },
      })) as any,
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res === true);

      res === true && this.router.navigate(['/game/provider']);
    });
  }

  /**
   * 更新语言表单
   * @param selectLang
   * @param control
   */
  updateLanguageForm(selectLang: string[], control) {
    const prevValue = cloneDeep(control.value.lang);
    const langArray = selectLang.map((lanageCode) =>
      this.generateLanguage({
        lanageCode,
        providerName: '',
        providerDesc: '',
        ...prevValue.find((e) => e.lanageCode === lanageCode), // 把之前的值保留下来
      })
    );

    control.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  /**
   * 生成语言表单
   */
  generateLanguage(data?: ProviderParamsLang | undefined) {
    return this.fb.group({
      providerName: [data?.providerName || '', Validators.compose([Validators.required])],
      providerDesc: [data?.providerDesc || '', Validators.compose([Validators.required])],
      lanageCode: [data?.lanageCode || 'zh-cn'],
    });
  }

  /**
   * 生成产品表单
   */
  generateProduct(data?: ProviderProductDetail) {
    return this.fb.group({
      id: [data?.id || 0],
      providerId: [data?.providerId || ''], // 厂商ID
      category: [data?.category || (GameCategoryEnum[GameCategoryEnum.SportsBook] as GameCategory)],
      venueFee: [+data?.venueFee! * 100 || 0], // 体育场馆费 0-100
      isEnable: [data?.isEnable ?? false], // 是否启用
      webLogo: [data?.webLogo || '', Validators.required],
      appLogo: [data?.appLogo || '', Validators.required],
      tenantIds: [data?.tenantIds || ([] as number[]), validatorArrayRequired], // 支持的商户
      showHomeTenant: [data?.showHomeTenant || ([] as number[])], // 体育显示于首页的商户
      guestMode: [data?.guestMode || ([] as number[]) || false], // 是否支持游客访问
      gameList: [data?.gameList || ''], // 游戏列表
      freeSpinGameList: [data?.freeSpinGameList || ''], // 支持免费旋转
      legalArea: [data?.legalArea || ([] as string[])], // 地区区域
      sort: [data?.sort || (null as number | null | undefined)], // 显示顺序
      countryCode: [data?.countryCode || ([] as string[])], // 能够访问的国家地区代码
      currencyRatio: [data?.currencyRatio || ([] as ProviderCurrencyRatio[])], // 货币压缩比例
      secondaryPage: [data?.secondaryPage || false], // 二级页面
      excludable: [data?.excludable || false], // 是否支持非粘性奖金单独排除游戏
      lang: this.fb.array(
        data?.providerInfoDtos?.length
          ? data.providerInfoDtos.map((e) => this.generateLanguage(e))
          : [this.generateLanguage()]
      ),
      //游戏打开方式
      gameOpenMethod: this.fb.group(
        {
          h5Android: [data?.gameOpenMethod?.h5Android || ''],
          h5Ios: [data?.gameOpenMethod?.h5Ios || ''],
          ionicAndroid: [data?.gameOpenMethod?.ionicAndroid || ''],
          ionicIos: [data?.gameOpenMethod?.ionicIos || ''],
          webMac: [data?.gameOpenMethod?.webMac || ''],
          webWindow: [data?.gameOpenMethod?.webWindow || ''],
        },
        Validators.required
      ),
    });
  }

  /**
   * 语言选项改变
   * @param event
   * @param i
   */
  onLangValueChange(event, i) {
    if (!event.length) return;
    this.selectLang[i] = event;
  }

  /**
   * 国家移除选项
   * @param control
   * @param i
   */
  onCountryRemove(control: any, i: number) {
    const valueList = [...control.value];
    valueList.splice(i, 1);
    control.setValue(valueList);
  }

  /**
   * 打开国家选择弹窗
   * @param control
   */
  openAddPopupCountry(control: FormControl<string[]>) {
    const type = 'area';
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = this.countryList || [];
    modalRef.componentInstance['selectedList'] = [...(control.value || [])]
      .map((code) => {
        return this.countryList
          .map((j) => j?.countries)
          .flat(1)
          .find((e) => e?.countryCode === code);
      })
      .filter((e) => e);

    modalRef.componentInstance.confirm.subscribe((selList) => {
      control.setValue(selList.map((e) => e.countryCode));
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /**
   * 获取选中的国家列表
   */
  getSelectCountryList(countryCode: string[]): Country[] {
    return (
      countryCode
        ?.map((code) =>
          this.countryList
            .find((j) => j.countries.find((p: Country) => p.countryCode === code))
            ?.countries.find((p) => p.countryCode === code)
        )
        .filter((e) => !!e) || []
    );
  }

  /**
   * 打开币种选择弹窗
   * @param control
   */
  openCurrencyDialog(control: FormControl<ProviderCurrencyRatio[]>) {
    const type = 'currency';
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = this.currencyList || [];
    modalRef.componentInstance['selectedList'] = [...(control.value.map((e) => e.currency) || [])];
    modalRef.componentInstance.confirm.subscribe((selectCurrency: string[]) => {
      const sel = selectCurrency.map((currency) => ({
        currency,
        ratio: 1,
        ...control.value.find((e) => e.currency === currency),
      }));

      control.setValue(sel);
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /**
   * 返回列表页
   */
  goBack() {
    this.router.navigate(['/game/provider']);
  }

  /**
   * 删除币种
   * @param control
   * @param i
   */
  delete(control: FormControl<ProviderCurrencyRatio[]>, i: number) {
    const value = control.value.filter((e, index) => index !== i);
    control.setValue(value);
  }
}
