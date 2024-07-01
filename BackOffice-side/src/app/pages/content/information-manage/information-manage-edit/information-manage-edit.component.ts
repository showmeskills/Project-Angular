import { Component, OnInit } from '@angular/core';
import { Language } from 'src/app/shared/interfaces/zone';
import { forkJoin, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { FormValidator } from 'src/app/shared/form-validator';
import { LanguageWarningComponent } from '../../../game/component/language-warning.component';
import { ThemeSelectComponent } from './theme-select/theme-select.component';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor } from '@angular/common';

@Component({
  templateUrl: './information-manage-edit.component.html',
  styleUrls: ['./information-manage-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    SelectGroupComponent,
    SelectDirective,
    InputTrimDirective,
    UploadComponent,
    LangPipe,
  ],
})
export class InformationManageEditComponent implements OnInit {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private appService: AppService,
    private zoneApi: ZoneApi,
    private api: ArticleApi,
    private selectApi: SelectApi,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;

  id = ''; // 编辑所用id
  curTab = 0; // 当前tab索引
  imgDomain = ''; // 图片域名
  selectLang: string[] = ['zh-cn']; // PM:默认值CN
  showEditTab = false; // 编辑i18n
  defaultForm: any; // 表单初始值
  data = {
    category: '',
  };

  EMPTY: any = {
    language: [],
    type: '',
    merchant: '',
    theme: 0,
  };

  modal!: NgbModalRef;
  langList: Language[] = [{ code: 'zh-cn', enabled: true, name: '中文', disabled: true }]; // PM:默认值CN
  merchantList: any[] = []; // 商户列表
  themeList: any[] = []; // 主题
  categoryList: any[] = []; // 分类

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

  get langTabList(): Language[] {
    return this.selectLang?.map((e) => this.langList.find((j) => j.code === e) as Language);
  }

  get curLang(): Language | undefined {
    return this.langList.find((e) => e.code === this.selectLang[this.curTab]);
  }

  get curThemeList() {
    return this.themeList ? this.themeList.filter((e) => e.categoryCode === this.formGroup.value['type']) : [];
  }

  get curTheme() {
    return this.curThemeList.find((e) => e.categoryId === this.formGroup.value['theme']) || {};
  }

  get curMerchant() {
    return this.merchantList.find((e) => e.value === this.formGroup.value['merchant']) || {};
  }

  get categoryName() {
    return this.categoryList.find((e) => e.key === this.formGroup.value.type)?.[this.lang.isLocal ? 'value' : 'key'];
  }

  ngOnInit(): void {
    this.loadForm();
    this.initData();
  }

  /** methods */
  initData(): void {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.zoneApi.getLanguages(),
      this.selectApi.getMerchantList(),
      this.api.getCategoryType(),
      this.isEdit ? this.api.getCategoryDetail(+this.id) : of(undefined),
    ]).subscribe(([lang, merchant, category, detail]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.categoryList = Array.isArray(category) ? category : [];

      lang?.forEach((e) => e.code === 'zh-cn' && (e.disabled = true)); // 固定中文禁止操作

      detail?.categoryInfos?.forEach((e, i) => {
        // 置顶中文
        if (e.code === 'zh-cn') detail.categoryInfos.unshift(detail.categoryInfos.splice(i, 1)[0]);
      });

      this.langList = lang || this.langList;

      if (this.isEdit) {
        this.update(detail);
      }

      this.merchantList = Array.isArray(merchant) ? merchant.filter((e) => e.value !== '-1') : [];
    });
  }

  update(detail: any) {
    if (!detail) return;

    this.imgDomain = detail.iconAddress;
    this.formGroup.patchValue({
      merchant: String(detail.tenantId),
      type: detail.categoryCode,
      theme: detail.parentId,
      icon: detail.icon,
    });

    this.api.getCategory(detail.tenantId).subscribe((res) => {
      this.themeList = res;
    });

    this.selectLang = detail.categoryInfos.map((e) => e.lanageCode);
    this.formGroup.setControl(
      'lang',
      this.fb.array(
        detail.categoryInfos.map((e) =>
          this.fb.group({
            title: [e.title, Validators.compose([Validators.required])],
            content: [e.description, Validators.compose([Validators.required])],
            code: [e.lanageCode],
          })
        )
      )
    );
  }

  loadForm(): void {
    this.defaultForm = { ...this.EMPTY };
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          title: ['', Validators.compose([Validators.required])],
          content: ['', Validators.compose([Validators.required])],
          code: ['zh-cn'],
        }),
      ]),
      merchant: [this.defaultForm.merchant, Validators.compose([Validators.required])],
      theme: [this.defaultForm.theme],
      type: [this.defaultForm.type, Validators.compose([Validators.required])],
      icon: ['', Validators.compose([Validators.required])],
    });

    this.validator = new FormValidator(this.formGroup);
  }

  // 提交的语言
  onLanguage(languages): void {
    if (!languages.length)
      return this.appService.showToastSubject.next({
        msgLang: 'conten.seLa',
        successed: false,
      });

    const lang = languages.map((e) => e.code);
    const hasRemove = !this.selectLang.every((e) => lang.includes(e)); // 是否有移除语言情况
    const done = () => {
      // 当前选中的语言被改变或删除了
      if (this.selectLang[this.curTab] !== lang[this.curTab]) {
        // 尝试找到之前的语种
        const i = lang.indexOf(this.selectLang[this.curTab]);
        this.curTab = Math.max(i, 0);
      }
      this.selectLang = lang;
      this.updateLanguageForm();
    };

    if (hasRemove) {
      // 有删除 警告确认再赋值
      this.modalService.open(LanguageWarningComponent, { centered: true }).result.then(({ value }) => {
        value && done();
      });
    } else {
      done();
    }
  }

  // 更新语言表单
  updateLanguageForm(): void {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((code) => {
      const value = {
        code,
        title: '',
        content: '',
        ...prevValue.find((e) => e.code === code), // 把之前的值保留下来
      };

      return this.fb.group({
        title: [value.title, Validators.compose([Validators.required])],
        content: [value.content, Validators.compose([Validators.required])],
        code: [value.code],
      });
    });

    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  back(): void {
    this.router.navigate(['/content/information-manage']).then();
  }

  async onSubmit() {
    const change = await this.lang.getOne('conten.change');
    const add = await this.lang.getOne('conten.add');
    const suc = await this.lang.getOne('conten.suc');
    const fail = await this.lang.getOne('conten.fail');
    this.formGroup.markAllAsTouched();

    if (this.langArrayForm.invalid) {
      // 语言未通过验证
      if (this.langArrayForm.controls[this.curTab].invalid) return; // 当前所选语言内容没通过直接退出
      this.langArrayForm.controls.some((e, i) => {
        // 语言未填写完整切换到相应语言索引，提高用户体验
        if (e.invalid) this.curTab = i;
        return e.invalid; // 找到未通过验证停止遍历
      });
    }

    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);

    this.api
      .updateCategory({
        ...(this.isEdit ? { id: this.id } : {}),
        tenantId: this.formGroup.value.merchant,
        categoryCode: this.formGroup.value.type,
        parentId: this.curTheme.categoryId,
        parentName: this.curTheme.title,
        categoryInfos: this.formGroup.value.lang.map((e) => ({
          lanageCode: e.code,
          title: e.title,
          description: e.content,
        })),
        icon: this.formGroup.value.icon,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        const prevText = this.isEdit ? change : add;
        if (+res) {
          this.back();
          return this.appService.showToastSubject.next({
            msg: prevText + suc,
            successed: true,
          });
        }

        this.appService.showToastSubject.next({
          msg: prevText + fail,
          successed: false,
        });
      });
  }

  async onParent(): Promise<void> {
    this.modal = this.modalService.open(ThemeSelectComponent, {
      centered: true,
      windowClass: 'theme-select-modal',
    });
    this.modal.componentInstance['list'] = [{ categoryId: 0, title: '无' }, ...this.curThemeList];
    this.modal.componentInstance['select'] = [this.formGroup.value['theme']];

    const theme = (await this.modal.result) || 0;
    if (theme === this.formGroup.value['theme']) return;

    this.formGroup.patchValue({ theme });
  }

  onMerchantChange({ value }): void {
    this.api.getCategory(value).subscribe((res) => {
      this.themeList = res;
      this.formGroup.patchValue({ theme: 0, type: '' });
    });
  }

  onTypeChange(value: string): void {
    this.formGroup.patchValue({ type: value, theme: 0 });
  }
}
