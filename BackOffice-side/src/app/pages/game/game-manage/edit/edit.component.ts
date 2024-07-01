import { moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { zip, of } from 'rxjs';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
// import { GameConfiguration } from 'src/app/shared/interfaces/game';
import { SelectProviderComponent } from '../select-provider/select-provider.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { InputPercentageDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NzImageDirective } from 'src/app/shared/components/image';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    LangTabComponent,
    UploadComponent,
    CdkDropList,
    CdkDrag,
    NgTemplateOutlet,
    AngularSvgIconModule,
    FormWrapComponent,
    InputPercentageDirective,
    CurrencyIconDirective,
    ModalTitleComponent,
    ModalFooterComponent,
    CurrencyValuePipe,
    LangPipe,
    NzImageDirective,
  ],
})
export class EditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private api: GameApi,
    private selectApi: SelectApi,
    private gameLabelApi: GameLabelApi,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    public router: Router,
    public appService: AppService,
    private lang: LangService
  ) {}

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  selectLang = ['zh-cn']; // PM:默认值CN

  id = 0; // 编辑 -> 游戏id
  tenantId: any; // 新增/编辑 -> 商户id

  gameStatusList: any[] = []; // 游戏状态
  providerList: any[] = []; // 游戏厂商列表
  gameCodeList: any[] = []; // 游戏 ID 列表

  labelList: any[] = []; // 游戏所有标签
  labelConfigList: any[] = []; // 游戏标签配置
  addLabelList: any[] = []; // 游戏标签弹窗
  inputLabelName = ''; //标签模糊搜索

  // 游戏状态
  isReBate = false; // 参与反水
  isTry = false; // 试玩模式
  isFullScreen = false; // 是否全屏
  isHot = false; // 热门推荐
  isRecomment = false; // 首页推荐
  isFreeSpin = false; // FreeSpin
  isValidWaterCalc = true; // 有效流水计算
  validWaterPercentage = 100; // 有效流水计算百分比 默认100

  curTypeValue: any = 0;

  totalBetAmount!: number; //累计交易金额
  payoutAmount!: number; //累计派彩金额

  webRedirectUrl!: string; //web link
  appRedirectUrl!: string; //app link

  /** APP打开方式 */
  openMethod = {
    appAndroid: 'WithinApp', // 安卓 - 默认“APP应用内打开”
    appIos: 'WithinApp', // IOS - 默认“APP应用内打开”
  };

  showStatus = [
    { code: true, description: 'common.show' },
    { code: false, description: 'common.hide' },
  ];

  /** getter */
  // 是否新增
  get isAdd(): boolean {
    return !this.id;
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get providerName(): string {
    const provider = this.providerList.find((e) => e.providerCatId === this.formGroup.value['vendor']);
    if (provider) {
      return `${provider?.name}(${provider.providerCatId})`;
    }
    return '';
  }

  get providerLogo(): string {
    return this.providerList.find((e) => e.providerCatId === this.formGroup.value['vendor'])?.webLogo || '';
  }

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  ngOnInit() {
    this.loadForm();
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.id = +v?.id || 0;
      this.tenantId = v?.tenantId;
      this.initData();
    });
  }

  initData(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.getProviderSelect(this.tenantId),
      this.gameLabelApi.getList(this.tenantId),
      this.selectApi.getStatus(),
      this.isEdit ? this.api.getGameDetail({ id: this.id, tenantId: this.tenantId }) : of(undefined)
    ).subscribe(([provider, labelList, status, _detail]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.providerList = provider || [];
      this.labelList = labelList || [];
      this.gameStatusList = status || [];

      const detail = _detail;
      if (this.isEdit) this.update(detail);
    });
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      state: ['', Validators.required], // 状态
      isShow: ['', Validators.required], // 显示/隐藏
      vendor: ['', Validators.required], // 游戏厂商
      id: ['', Validators.required],
      sort: [''],
      lang: this.fb.array([
        this.fb.group({
          gameName: ['', Validators.required],
          gameDesc: ['', Validators.required],
          webLogo: [''],
          appLogo: [''],
          h5Logo: [''],
          lanageCode: ['zh-cn'],
        }),
      ]),
      advantage: ['', Validators.compose([validatorNumberRequired])], // 庄家优势
      webRedirectUrl: [''], //Web Link
      appRedirectUrl: [''], //app Link
      gameLabelLength: ['', Validators.required],
    });

    this.validator = new FormValidator(this.formGroup);
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((lanageCode) => {
      const value = {
        lanageCode,
        gameName: '',
        gameDesc: '',
        webLogo: '',
        appLogo: '',
        h5Logo: '',
        ...prevValue.find((e) => e.lanageCode === lanageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        gameName: [value.gameName, Validators.required],
        gameDesc: [value.gameDesc, Validators.required],
        webLogo: [value.webLogo],
        appLogo: [value.appLogo],
        h5Logo: [value.appLogo],
        lanageCode: [value.lanageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  update(detail): void {
    if (!detail) return;

    this.isReBate = detail?.isReBate;
    this.isTry = detail?.isTry;
    this.isFullScreen = detail?.isFullScreen;
    this.isHot = detail?.isHot;
    this.isRecomment = detail?.isRecomment;
    this.isFreeSpin = detail?.isFreeSpin;
    this.totalBetAmount = detail?.totalBetAmount;
    this.payoutAmount = detail?.payoutAmount;
    this.openMethod = detail?.openMethod;
    this.isValidWaterCalc = detail?.isTurnover;
    this.validWaterPercentage = detail?.turnoverPercentage;

    this.formGroup.patchValue({
      vendor: detail.providerCatId,
      id: detail.gameId,
      advantage: detail.bankerAdvantage,
      webRedirectUrl: detail.webRedirectUrl,
      appRedirectUrl: detail.appRedirectUrl,
      sort: detail.sort,
      state: detail.status,
      gameLabelLength: detail.gameLabels.length || '',
      isShow: detail.isShow,
    });

    this.selectLang = detail.gameInfos?.length ? detail.gameInfos.map((e) => e.lanageCode) : this.selectLang;

    // 有长度进行更新
    if (detail.gameInfos?.length) {
      this.formGroup.setControl(
        'lang',
        this.fb.array(
          detail.gameInfos.map((e) =>
            this.fb.group({
              gameName: [e.gameName, Validators.required],
              gameDesc: [e.gameDesc],
              webLogo: [e.webLogo],
              appLogo: [e.appLogo],
              h5Logo: [e.appLogo],
              lanageCode: [e.lanageCode],
            })
          )
        )
      );
    }

    this.labelConfigList = this.labelList.filter((v) => detail?.gameLabels.includes(v.id));
  }

  // 游戏厂商选择 -> 联动游戏code
  onProviderChange({ value }) {
    this.gameCodeList = this.providerList.find((e) => e.providerCatId === value)?.gameList || [];
  }

  // 拖拽
  drop(event: any) {
    moveItemInArray(this.labelConfigList, event.previousIndex, event.currentIndex);
  }

  // 删除 大厅/菜单 标签
  onDelLabel(i: number) {
    this.labelConfigList.splice(i, 1);
    this.formGroup.patchValue({ gameLabelLength: this.labelConfigList.length ? this.labelConfigList.length : '' });
  }

  // 新增游戏标签 弹窗
  openAddLabelPopup(tpl: any) {
    this.addLabelList = this.labelList.filter((v) => !this.labelConfigList.map((v) => v.id).includes(v.id));
    this.addLabelList.forEach((item) => (item.checked = false));
    const modalRef = this.modalService.open(tpl, { width: '829px' });
    modalRef.result.then(() => {}).catch(() => {});
  }

  // 新增标签弹窗 确认
  onAddLabelSubmit(close: any) {
    const list = this.addLabelList.filter((v) => v.checked);
    this.labelConfigList = [...this.labelConfigList, ...list];
    this.formGroup.patchValue({ gameLabelLength: this.labelConfigList.length ? this.labelConfigList.length : '' });
    close(true);
  }

  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    // 请输入 有效流水计算百分比
    if (!+this.validWaterPercentage) {
      const label = await this.lang.getOne('game.manage.validWaterPercentage');
      return this.appService.showToastSubject.next({
        msgLang: 'form.enterTips',
        msgArgs: { label },
      });
    }

    const prevText = await this.lang.getOne(this.isEdit ? 'conten.change' : 'conten.add');
    const success = await this.lang.getOne('common.success');
    const fail = await this.lang.getOne('common.fail');

    this.formGroup.value.lang.forEach((v) => {
      if (v.appLogo && !v.h5Logo) v.h5Logo = v.appLogo;
    });

    this.appService.isContentLoadingSubject.next(true);
    const sort = +this.formGroup.value.sort;
    this.api[this.isEdit ? 'updateGame' : 'createGame']({
      sort,
      ...(this.isEdit ? { id: +this.id } : {}),
      tenantId: this.tenantId,
      providerCatId: this.formGroup.value.vendor,
      gameId: this.formGroup.value.id,
      bankerAdvantage: parseFloat(this.formGroup.value.advantage),
      webRedirectUrl: this.formGroup.value.webRedirectUrl,
      appRedirectUrl: this.formGroup.value.appRedirectUrl,
      status: this.formGroup.value.state,
      isShow: this.formGroup.value.isShow,
      isReBate: this.isReBate,
      isTry: this.isTry,
      isFullScreen: this.isFullScreen,
      isHot: this.isHot,
      isRecomment: this.isRecomment,
      isFreeSpin: this.isFreeSpin,
      isTurnover: this.isValidWaterCalc,
      turnoverPercentage: this.validWaterPercentage,
      gameInfos: this.formGroup.value.lang,
      gameLabels: this.labelConfigList.map((v) => String(v.id)) || [],
      openMethod: this.openMethod,
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (+res) this.router.navigate(['/game/manage']);
      this.appService.showToastSubject.next({
        msg: prevText + (+res ? success : fail) + '！',
        successed: +res ? true : false,
      });
    });
  }

  onOpen() {
    if (!this.providerList?.length)
      return this.appService.showToastSubject.next({ msgLang: 'game.provider.noSuppliers' });
    const modelref = this.modalService.open(SelectProviderComponent, {
      width: '600px',
      data: { providerList: this.providerList },
      disableClose: true,
    });
    modelref.result.then((res) => {
      if (res) {
        this.formGroup.get('vendor')?.setValue(res.providerCatId);
        this.onProviderChange({ value: res.providerCatId });
      }
    });
  }

  serachChange() {
    if (this.inputLabelName) {
      this.addLabelList = this.labelList.filter(
        (v) =>
          !this.labelConfigList.map((v) => v.id).includes(v.id) &&
          v.name.toLowerCase().includes(this.inputLabelName.toLowerCase())
      );
    } else {
      this.addLabelList = this.labelList.filter((v) => !this.labelConfigList.map((v) => v.id).includes(v.id));
    }
  }

  /**
   * 有效流水计算 变动
   */
  onIsValidWaterCale() {
    if (!this.isValidWaterCalc) {
      this.isReBate = false;
    }
  }
}
