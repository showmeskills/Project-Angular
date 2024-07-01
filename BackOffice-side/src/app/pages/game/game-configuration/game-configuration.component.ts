import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { GameConfiguration } from 'src/app/shared/interfaces/game';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { GameApi } from 'src/app/shared/api/game.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { forkJoin, of } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { validatorArrayRequired, validatorNumberRequired } from 'src/app/shared/models/validator';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputPercentageDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent as LangTabComponent_1 } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-game-configuration',
  templateUrl: './game-configuration.component.html',
  styleUrls: ['./game-configuration.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    NgFor,
    MatOptionModule,
    LangTabComponent_1,
    FormRowComponent,
    UploadComponent,
    FormWrapComponent,
    InputPercentageDirective,
    LangPipe,
  ],
})
export class GameConfigurationComponent implements OnInit {
  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;

  id = 0; // 编辑所用id
  tenantId = 0; // 编辑回传id
  imgDomain = ''; // 图片域名
  config!: GameConfiguration; // 表单Group
  providerList: any[] = []; // 游戏厂商列表
  gameCodeList: any[] = []; // 游戏 ID 列表
  gameLabelList: any[] = []; // 游戏标签列表
  gameStatusList: any[] = []; // 状态列表
  EMPTY_CONFIG: GameConfiguration = {
    // 初始值
    vendor: undefined,
    id: undefined,
    language: [],
    label: [],
    advantage: '',
    sort: 0,
    state: '',
    backwater: false,
    recommend: false,
    hotRecommend: false, //热门推荐
    isTry: false,
  };

  selectLang = ['zh-cn']; // PM:默认值CN
  modal!: NgbModalRef;
  searchGroup: any = {};

  @ViewChild('wrap') wrap!: ElementRef<HTMLDivElement>;

  constructor(
    private fb: FormBuilder,
    public modalService: NgbModal,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private api: GameApi,
    private selectApi: SelectApi,
    private appService: AppService,
    private lang: LangService
  ) {
    const { id, merchantId } = this.activatedRoute.snapshot.params;
    this.id = +id || 0;
    this.tenantId = merchantId;
  }

  /** getter */
  // 是否新增
  get isAdd(): boolean {
    return !this.id;
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get langArrayForm() {
    return this.formGroup.get('lang') as FormArray;
  }

  get providerName(): string {
    return this.providerList.find((e) => e.id === this.formGroup.value['vendor'])?.name || '';
  }

  get getGameCodeList(): any[] {
    return this.searchGroup['gameCodeList']
      ? this.gameCodeList.filter((e) =>
          (e || '').toLowerCase().includes(this.searchGroup['gameCodeList'].toLowerCase())
        )
      : this.gameCodeList;
  }

  get getProviderList(): any[] {
    return this.searchGroup['providerList']
      ? this.providerList.filter((e) =>
          (e.name || '').toLowerCase().includes(this.searchGroup['providerList'].toLowerCase())
        )
      : this.providerList;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();
    this.initData();
  }

  /** methods */
  initData(): void {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.selectApi.getProviderSelect(this.tenantId),
      this.selectApi.getLabelSelect(this.tenantId),
      this.selectApi.getStatus(),
      this.isEdit ? this.api.getGameList({ id: this.id, tenantId: this.tenantId }) : of(undefined),
    ]).subscribe(([provider, label, status, _detail]) => {
      this.appService.isContentLoadingSubject.next(false);

      const detail = _detail?.list?.[0];
      this.providerList = provider;
      this.gameLabelList = label;
      this.gameStatusList = status;
      this.imgDomain = _detail?.iconAddress;
      if (this.isEdit) {
        this.update(detail);
      } else {
        this.computedFormGroup();
      }
    });
  }

  loadForm(): void {
    this.config = this.EMPTY_CONFIG;
    this.formGroup = this.fb.group({
      vendor: [this.config.vendor, Validators.compose([Validators.required])],
      id: [this.config.id, Validators.compose([Validators.required])],
      lang: this.fb.array([
        this.fb.group({
          gameName: ['', Validators.compose([Validators.required])],
          gameDesc: [''],
          webLogo: [''],
          appLogo: [''],
          lanageCode: ['zh-cn'],
        }),
      ]),
      label: this.fb.array([], Validators.compose([validatorArrayRequired])),
      advantage: [this.config.advantage, Validators.compose([validatorNumberRequired])],
      sort: [''],
      state: [this.config.state, Validators.compose([Validators.required])],
      backwater: [this.config.backwater],
      recommend: [this.config.recommend],
      hotRecommend: [this.config.hotRecommend],
      isTry: [this.config.isTry],
    });

    this.validator = new FormValidator(this.formGroup);
  }

  update(detail): void {
    if (!detail) return;

    this.formGroup.patchValue({
      vendor: detail.providerId,
      id: detail.gameId,
      advantage: detail.bankerAdvantage,
      sort: detail.sort,
      state: detail.status,
      backwater: detail.isReBate,
      recommend: detail.isRecomment,
      hotRecommend: detail.isHot,
      isTry: detail.isTry,
    });

    this.selectLang = detail.gameInfos?.length ? detail.gameInfos.map((e) => e.lanageCode) : this.selectLang;

    // 有长度进行更新
    if (detail.gameInfos?.length) {
      this.formGroup.setControl(
        'lang',
        this.fb.array(
          detail.gameInfos.map((e) =>
            this.fb.group({
              gameName: [e.gameName, Validators.compose([Validators.required])],
              gameDesc: [e.gameDesc],
              webLogo: [e.webLogo],
              appLogo: [e.appLogo],
              lanageCode: [e.lanageCode],
            })
          )
        )
      );
    }

    this.computedFormGroup(detail.gameLabels);
  }

  // 计算绑定control表单
  computedFormGroup(labelSelect?: any[]) {
    const labelControl = this.gameLabelList.map(
      (e) => new FormControl((labelSelect && labelSelect.find((j) => j.code === e.code)?.isSelect) || false)
    ); // 如果有选中为true
    this.formGroup.setControl('label', this.fb.array(labelControl, Validators.compose([validatorArrayRequired])));
  }

  // 联动游戏code
  onProviderChange({ value }) {
    this.gameCodeList = this.providerList.find((e) => e.id === value)?.gameList || [];
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
        ...prevValue.find((e) => e.lanageCode === lanageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        gameName: [value.gameName, Validators.compose([Validators.required])],
        gameDesc: [value.gameDesc],
        webLogo: [value.webLogo],
        appLogo: [value.appLogo],
        lanageCode: [value.lanageCode],
      });
    });

    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  // 获取游戏标签提交数据
  getSubmitLabel() {
    return this.gameLabelList.map((e, i) => ({
      ...e,
      isSelect: this.formGroup.value.label[i],
    }));
  }

  onSubmit(langTab: LangTabComponent): void {
    this.formGroup.markAllAsTouched();
    langTab.check();

    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    const sort = +this.formGroup.value.sort;
    this.api[this.isEdit ? 'updateGame' : 'createGame']({
      sort,
      ...(this.isEdit ? { id: +this.id } : {}),
      ...(this.isEdit ? { tenantId: this.tenantId } : {}),
      providerId: this.formGroup.value.vendor,
      gameId: this.formGroup.value.id,
      bankerAdvantage: parseFloat(this.formGroup.value.advantage),
      status: this.formGroup.value.state,
      isRecomment: this.formGroup.value.recommend,
      isHot: this.formGroup.value.hotRecommend,
      isReBate: this.formGroup.value.backwater,
      isTry: this.formGroup.value.isTry,
      gameInfos: this.formGroup.value.lang,
      gameLabels: this.getSubmitLabel(),
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      const prevText = this.isEdit ? '更新' : '新增';
      if (+res) {
        this.router.navigate(['/game/list']);
        return this.appService.showToastSubject.next({
          msg: prevText + '成功！',
          successed: true,
        });
      }

      this.appService.showToastSubject.next({
        msg: prevText + '失败！',
        successed: false,
      });
    });
  }

  onSearch(key: string, kw: any): void {
    this.searchGroup[key] = kw ?? '';
  }

  onOpenSelect(isOpen: boolean, key: string, el: HTMLInputElement): void {
    if (isOpen) {
      el.value = '';
      el.focus();
    } else {
      this.searchGroup[key] = '';
    }
  }
}
