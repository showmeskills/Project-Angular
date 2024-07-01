import { Component, OnInit } from '@angular/core';
import { Language } from 'src/app/shared/interfaces/zone';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LanguageWarningComponent } from 'src/app/pages/game/component/language-warning.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgSwitch, NgSwitchCase, NgFor, NgIf } from '@angular/common';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
@Component({
  templateUrl: './kyc-option-edit.component.html',
  styleUrls: ['./kyc-option-edit.component.scss'],
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    AngularSvgIconModule,
    SelectGroupComponent,
    SelectDirective,
    FormRowComponent,
    FormWrapComponent,
    NgIf,
    LangPipe,
  ],
})
export class KycOptionEditComponent implements OnInit {
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private zoneApi: ZoneApi,
    private fb: FormBuilder,
    private appService: AppService,
    private modal: NgbModal,
    private api: KycApi,
    public lang: LangService,
    private breadcrumbsService: BreadcrumbsService
  ) {}

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  isLoading = false;

  tenantId;
  /** KYC认证类型 */
  catagory;
  /** 亚欧类型 */
  region: KYCRegionEnum;

  editData: any = {};
  curTab = 0; // 当前tab索引
  showEditTab = false; // 编辑i18n
  langList: Language[] = [{ code: 'zh-cn', enabled: true, name: '中文', disabled: true }]; // PM:默认值CN
  selectLang = ['zh-cn']; // PM:默认值CN

  /** getters */
  get langArrayForm() {
    return this.formGroup.get('lang') as FormArray;
  }

  get langTabList(): Language[] {
    return this.selectLang?.map((e) => this.langList.find((j) => j.code === e) as Language);
  }

  get curLang(): Language | undefined {
    return this.langList.find((e) => e.code === this.selectLang[this.curTab]);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();

    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.tenantId = v?.tenantId;
      this.catagory = v?.catagory;
      this.region = v?.region || 'Asia'; // 如果为空，默认亚洲

      this.breadcrumbsService.setBefore([
        { name: 'KYC管理', link: '/kyc/count', lang: 'nav.kycManagement' },
        {
          name: '配置管理',
          lang: 'breadCrumb.configManagement',
          click: () =>
            this.router.navigate(['/kyc/count/option'], {
              queryParams: { tenantId: v?.tenantId, region: v?.region },
            }),
        },
      ]);
    });

    this.loading(true);
    forkJoin([this.zoneApi.getLanguages()]).subscribe(([lang]) => {
      this.loading(false);
      // lang?.forEach((e) => e.code === 'zh-cn' && (e.disabled = true)); // 固定中文禁止操作
      this.langList = lang || this.langList;
      this.loadData();
    });
  }

  /** methods */
  loadForm(): void {
    this.formGroup = this.fb.group({
      fiatDepositLimit: ['', Validators.compose([Validators.required])],
      fiatWithdrawLimit: ['', Validators.compose([Validators.required])],
      virtualDepositLimit: ['', Validators.compose([Validators.required])],
      virtualWithdrawLimit: ['', Validators.compose([Validators.required])],
      lang: this.fb.array([
        this.fb.group({
          title: ['', Validators.compose([Validators.required])],
          lanageCode: ['zh-cn'],
        }),
      ]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  // 提交的语言
  async onLanguage(languages) {
    if (!languages.length) {
      // 需要选中一个语种
      const msg = await this.lang.getOne('member.kyc.model.needOneLanguage');
      return this.appService.showToastSubject.next({
        msg,
        successed: false,
      });
    }

    const lang = languages.map((e) => e.code);
    const hasRemove = !this.selectLang.every((e) => lang.includes(e)); // 是否有移除语言情况
    const done = () => {
      // 当前选中的语言被改变或删除了
      if (this.selectLang[this.curTab] !== lang[this.curTab]) {
        // 尝试找到之前的语种
        const i = lang.indexOf(this.selectLang[this.curTab]);
        this.curTab = i == -1 ? 0 : i;
      }
      this.selectLang = lang;
      this.updateLanguageForm();
    };

    if (hasRemove) {
      // 有删除 警告确认再赋值
      this.modal.open(LanguageWarningComponent, { centered: true }).result.then(({ value }) => {
        value && done();
      });
    } else {
      done();
    }
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((code) => {
      const value = {
        code,
        title: '',
        isAdd: false,
        ...prevValue.find((e) => e.code === code), // 把之前的值保留下来
      };
      return this.fb.group({
        title: [value.title, Validators.compose([Validators.required])],
        code: [value.code],
        id: [value.id],
        isAdd: [false],
      });
    });

    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  onSubmit(): void {
    this.formGroup.markAllAsTouched(); // 手动执行验证

    if (this.langArrayForm.invalid) {
      // 语言未通过验证
      if (this.langArrayForm.controls[this.curTab].invalid) return; // 当前语言没通过直接退出
      this.langArrayForm.controls.some((e, i) => {
        // 语言未填写完整切换到相应语言索引，提高用户体验
        if (e.invalid) this.curTab = i;
        return e.invalid; // 找到未通过验证停止遍历
      });
    }

    if (this.formGroup.invalid) return;
    this.loading(true);
    const formLangList: any = [];
    for (const item in this.formGroup.value.lang) {
      const items = this.formGroup.value.lang[item];
      if (items.id) {
        formLangList.push({
          langCode: items.code,
          content: items.title,
          id: items.id,
          isAdd: false,
        });
      } else {
        formLangList.push({
          langCode: items.code,
          content: items.title,
          isAdd: true,
        });
      }
    }

    this.api
      .updatekycsetting({
        tenantId: this.tenantId,
        region: this.region,
        kycType: this.catagory,
        titles: formLangList,
        fiatToVirtualLimit: this.editData.fiatToVirtualLimit + '',
        fiatDepositLimit: this.formGroup.value.fiatDepositLimit + '',
        fiatWithdrawLimit: this.formGroup.value.fiatWithdrawLimit + '',
        virtualDepositLimit: this.formGroup.value.virtualDepositLimit + '',
        virtualWithdrawLimit: this.formGroup.value.virtualWithdrawLimit + '',
        enbaled: true,
      })
      .subscribe(async (res) => {
        this.loading(false);
        const editSuc = await this.lang.getOne('member.kyc.model.editSuc');
        const editFail = await this.lang.getOne('member.kyc.model.editFail');
        if (res === true) {
          this.back();
          return this.appService.showToastSubject.next({
            msg: editSuc,
            successed: true,
          });
        }

        this.appService.showToastSubject.next({
          msg: editFail,
          successed: false,
        });
      });
  }

  loadData() {
    this.loading(true);
    const params = {
      tenantId: this.tenantId,
      catagory: this.catagory,
      region: this.region,
    };
    this.api.getkycsettingdetail(params).subscribe((data) => {
      this.loading(false);
      this.editData = data;
      this.update(data);
    });
  }

  // 渲染初始数据到页面
  update(detail: any) {
    if (!detail) return;

    this.formGroup.patchValue({
      fiatDepositLimit: detail?.fiatDepositLimit,
      fiatWithdrawLimit: detail?.fiatWithdrawLimit,
      virtualDepositLimit: detail?.virtualDepositLimit,
      virtualWithdrawLimit: detail?.virtualWithdrawLimit,
    });

    this.selectLang = detail.titles.map((e) => e.langCode);
    this.formGroup.setControl(
      'lang',
      this.fb.array(
        detail.titles.map((e) =>
          this.fb.group({
            title: [e.content, Validators.compose([Validators.required])],
            code: [e.langCode],
            isAdd: [false],
            id: [e.id],
          })
        )
      )
    );
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  back(): void {
    this.router.navigate(['/kyc/count/option'], {
      queryParams: { tenantId: this.tenantId, region: this.region },
    });
  }
}
