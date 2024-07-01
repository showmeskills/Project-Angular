import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AnnouncementTypeSelectComponent as TypeSelect } from './type-select/type-select.component';
import { AnnouncementRelativeSelectComponent as RelativeSelect } from './relative-select/relative-select.component';
import { AppService } from 'src/app/app.service';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { FormValidator } from 'src/app/shared/form-validator';
import { Language } from 'src/app/shared/interfaces/zone';
import { validatorArrayRequired, validatorNumberRequired } from 'src/app/shared/models/validator';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { UEditorComponent } from 'src/app/components/ueditor/ueditor.component';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { InputNumberDirective, InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent, FormFullDirective } from 'src/app/shared/components/form-row/form-wrap.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

// 预约发布时间交叉验证
function validatorPublishTime(group: FormGroup) {
  if (group.controls['releaseType'].value !== 'Appointment') return null;
  const value = group.controls['releaseTime'].value;

  if (!value) return { required: true }; // 必填
  // if (+new Date(value) < Date.now()) return {lg: true}; // 大于当前时间

  return value;
}

// 验证 前台标识
const validatorWebCode = (name: AbstractControl) => {
  return !(name && /^[\dA-Za-z0-9_]*?$/.test(name.value)) ? { webCode: true } : null;
};

@Component({
  selector: 'edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    FormRowComponent,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    FormWrapComponent,
    FormFullDirective,
    InputNumberDirective,
    SelectGroupComponent,
    SelectDirective,
    InputTrimDirective,
    UEditorComponent,
    UploadComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class EditComponent implements OnInit {
  formGroup;
  validator!: FormValidator;

  id = 0; // 编辑所用id
  curTab = 0; // 当前tab索引
  selectLang: string[] = ['zh-cn']; // PM:默认值CN
  showEditTab = false; // 编辑i18n
  defaultForm: any; // 表单初始值
  EMPTY: any = {
    language: [],
    type: 'FAQ',
    category: 'Brand',
    releaseType: 'Immediately',
  };

  langList: Language[] = [{ code: 'zh-cn', enabled: true, name: '中文', disabled: true }]; // PM:默认值CN
  modal!: MatModalRef<any>;
  iconAddress = '';
  merchantList: any[] = [];
  relativeList: any[] = [];
  clientList: any[] = [];
  typeList: any[] = [];
  categoryList: any[] = [];
  tagList: any[] = [];
  currentRelative: any[] = [];
  detail: any = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    private appService: AppService,
    private zoneApi: ZoneApi,
    private selectApi: SelectApi,
    private api: ArticleApi,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  /** getter */
  // 是否新增
  get isAdd(): boolean {
    return !this.id;
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get isAppointment() {
    // 是否预约发布
    return this.formGroup.value.method.releaseType === 'Appointment';
  }

  get clientArrayForm() {
    return this.formGroup.get('client') as FormArray;
  }

  get tagArrayForm() {
    return this.formGroup.get('tag') as FormArray<FormControl<any>>;
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

  /** 是否为优惠活动单选标签 */
  get isRadio() {
    return this.formGroup.value.type === 'Activity';
  }

  get curCategory() {
    const currentId = this.formGroup.value.category;
    let res;

    this.categoryList.some((e) => {
      res = e.categoryId === currentId ? e : e?.childrens?.find((j) => j.categoryId === currentId);

      return !!res;
    });

    return res || {};
  }

  get invalidPublishTime() {
    const methodGroup = this.formGroup.controls['method'] as FormGroup;
    const timeControl = methodGroup.controls['releaseTime'] as AbstractControl;

    return methodGroup.invalid && (timeControl.dirty || timeControl.touched);
  }

  get merchantName(): string {
    const merchantId = this.formGroup.value.merchant;
    return this.merchantList.find((e) => e.value === merchantId)?.name || '';
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
      this.selectApi.getMerchantList(true),
      this.api.getArticleClient(),
      this.api.getArticleTag(),
      this.api.getCategoryType(),
      this.isEdit ? this.api.getArticleDetail(this.id) : of(undefined),
    ]).subscribe(([lang, merchant, client, tag, type, detail]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.detail = detail || {};

      // 后台没中文数据时新增一条
      if (!detail?.articleInfos?.some((e) => e.lanageCode === 'zh-cn'))
        detail?.articleInfos.push({
          content: '',
          lanageCode: 'zh-cn',
          title: '',
        });
      lang?.forEach((e) => e.code === 'zh-cn' && (e.disabled = true)); // 固定中文禁止操作
      detail?.articleInfos?.forEach((e, i) => {
        // 置顶中文
        if (e.lanageCode === 'zh-cn') detail.articleInfos.unshift(detail.articleInfos.splice(i, 1)[0]);
      });

      this.typeList = type;
      this.langList = lang || this.langList;
      this.merchantList = merchant;
      this.clientList = client;
      this.tagList = tag;

      this.isEdit ? this.updateValue(detail) : this.computedFormGroup();
    });
  }

  updateValue(detail?: any): void {
    if (!detail) return;

    const isActivity = detail.categoryName === 'Activity';

    this.formGroup.patchValue({
      merchant: String(detail.tenantId),
      flag: detail.articleCode,
      type: detail.categoryName,
      category: detail.categoryId,
      tagRadio: (isActivity && detail.tags?.[0]) || '',
      sort: +detail.sort || 0,
      method: {
        endTime: detail.endTime ? new Date(detail.endTime) : '',
        releaseTime: new Date(detail.startTime),
        releaseType: detail.releaseType,
      },
    });
    this.formGroup.get('tagRadio').setValidators(isActivity ? Validators.required : null); // 优惠活动标签为必填
    this.currentRelative = detail.relations || [];
    this.selectLang = detail.articleInfos.map((e) => e.lanageCode);
    this.formGroup.setControl(
      'lang',
      this.fb.array(detail.articleInfos.map((e) => this.generateLangForm({ ...e, code: e.lanageCode })))
    );

    this.onMerchant({ value: detail.tenantId }, true);
    this.computedFormGroup(detail.clientType, detail.tags);
  }

  // 计算绑定control表单
  computedFormGroup(client?: string[], tags?: any[]) {
    const clientCrl = this.clientList.map((c) => new FormControl(client && client.includes(c.key)));
    this.formGroup.setControl('client', this.fb.array(clientCrl, Validators.compose([validatorArrayRequired])));

    const tagCrl = this.tagList.map((c) => new FormControl(tags && tags.includes(c.key)));
    this.formGroup.setControl(
      'tag',
      this.fb.array(
        tagCrl,
        Validators.compose([
          /*validatorArrayRequired*/
        ])
      )
    );
  }

  loadForm(): void {
    this.defaultForm = { ...this.EMPTY };
    this.formGroup = this.fb.group({
      merchant: ['', Validators.compose([Validators.required])],
      // tag: this.fb.array([], validatorArrayRequired),
      tag: this.fb.array([]),
      tagRadio: [''],
      flag: ['', Validators.compose([Validators.required, validatorWebCode])],
      type: [this.defaultForm.type, Validators.compose([Validators.required])],
      category: [this.defaultForm.category, Validators.compose([Validators.required])],
      client: this.fb.array([], validatorArrayRequired),
      sort: [0, validatorNumberRequired],
      method: this.fb.group(
        {
          releaseType: ['', Validators.compose([Validators.required])],
          releaseTime: [''],
          // endTime: ['', validatorLgNowTime],
          endTime: [''],
        },
        { validators: validatorPublishTime }
      ),
      lang: this.fb.array([this.generateLangForm()]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  // 提交的语言
  onLanguage(languages, delLang): void {
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
        this.curTab = i == -1 ? 0 : i;
      }
      this.selectLang = lang;
      this.updateLanguageForm();
    };

    if (hasRemove) {
      // 有删除 警告确认再赋值
      this.modalService.open(delLang, { width: '520px' }).result.then(({ value }) => {
        value && done();
      });
    } else {
      done();
    }
  }

  // 生成语言表单
  generateLangForm(data?: any) {
    return this.fb.group({
      title: [data?.title || '', Validators.required],
      introduction: [data?.introduction || ''],
      content: [data?.content || '', Validators.required],
      activityImgUrl: [data?.activityImgUrl || ''],
      detailImgUrl: [data?.detailImgUrl || ''],
      bonusImgUrl: [data?.bonusImgUrl || ''], //活动图
      code: [data?.code || 'zh-cn'],
    });
  }

  // 更新语言表单
  updateLanguageForm(): void {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((code) => {
      const value = {
        code,
        ...prevValue.find((e) => e.code === code), // 把之前的值保留下来
      };

      return this.generateLangForm(value);
    });

    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  back(): void {
    this.router.navigate(['/content/announcement']).then();
  }

  // 获取游戏标签提交数据
  getTag() {
    if (this.isRadio) {
      return [this.formGroup.value.tagRadio].filter((e) => e);
    }

    return this.tagList.filter((e, i) => this.formGroup.value.tag[i]).map((e) => e.key);
  }

  getClient() {
    return this.clientList.filter((e, i) => this.formGroup.value.client[i]).map((e) => e.key);
  }

  onClearEndTime(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.formGroup.patchValue({ method: { endTime: '' } });
  }

  onSubmit(publish = false): void {
    this.formGroup.markAllAsTouched();

    if (this.langArrayForm.invalid) {
      // 语言未通过验证
      if (this.langArrayForm.controls[this.curTab].invalid) return; // 当前语言没通过直接退出
      this.langArrayForm.controls.some((e, i) => {
        // 语言未填写完整切换到相应语言索引，提高用户体验
        if (e.invalid) this.curTab = i;
        return e.invalid; // 找到未通过验证停止遍历
      });
    }

    if (this.isRadio && !this.formGroup.value.tagRadio?.trim()) {
      return this.appService.showToastSubject.next({ msgLang: 'content.article.tagTip' });
    }

    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'common.formFillCompletely' });
    this.appService.isContentLoadingSubject.next(true);
    this.api[publish ? 'addPublishArticle' : 'addSaveArticle']({
      ...(this.isEdit ? { id: this.id } : {}),
      tenantId: this.formGroup.value.merchant,
      categoryId: this.curCategory.categoryId,
      categoryName: this.formGroup.value.type,
      articleCode: String(this.formGroup.value.flag),
      clientType: this.getClient(),
      // isHot: true, // 是否热门
      // isIndex: true, // 是否首页
      tags: this.getTag(),
      relationIds: this.currentRelative.map((e) => e.id),
      releaseType: this.formGroup.value.method.releaseType,
      startTime: this.isAppointment ? +new Date(this.formGroup.value.method.releaseTime) : Date.now(),
      endTime: this.formGroup.value.method.endTime ? +new Date(this.formGroup.value.method.endTime) : 0,
      sort: +this.formGroup.value.sort || 0,
      articleInfos: this.formGroup.value.lang.map((e) => ({
        ...e,
        lanageCode: e.code,
      })),
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res === true) {
        this.appService.showToastSubject.next({
          msgLang: 'conten.suc',
          successed: true,
        });
        this.back();
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'conten.fail',
          successed: false,
        });
      }
    });
  }

  async onCategory(): Promise<void> {
    // if (this.isEdit) return;
    this.modal = this.modalService.open(TypeSelect, {
      maxWidth: '680px',
      minWidth: '520px',
    });
    this.modal.componentInstance['list'] = this.categoryList.filter(
      (e) => e.categoryCode === this.formGroup.value.type
    );
    this.modal.componentInstance['select'] = this.formGroup.value['category'];

    const category = (await this.modal.result) || '';
    if (category === this.formGroup.value['category']) return;
    this.formGroup.patchValue({ category });
  }

  async onAddInformation(): Promise<void> {
    if (!this.relativeList.length)
      return this.appService.showToastSubject.next({
        msgLang: 'content.info.noGuan',
        successed: false,
      });
    this.modal = this.modalService.open(RelativeSelect, {
      maxWidth: '850px',
      minWidth: '600px',
    });
    this.modal.componentInstance['list'] = this.categoryList.filter(
      (e) => e.categoryCode === this.formGroup.value.type
    );
    this.modal.componentInstance['select'] = this.currentRelative.map((e) => ({ ...e })).slice(-5); // 拷贝一份
    this.modal.componentInstance['data'] = this.relativeList;

    this.currentRelative = (await this.modal.result) || [];
  }

  onMerchant({ value }, skipClear = false): void {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([this.api.getCategory(value), this.api.getArticleRelative(value)]).subscribe(([type, relative]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.categoryList = type && type.length ? type.map((e) => ({ ...e, id: e.articleId })) : this.categoryList;
      this.relativeList = relative
        ? relative
            .filter((e) => e.articleId !== +this.id) // 过滤自己已发布的文章id
            .map((e) => ({ ...e, id: e.articleId, title: e.articleTitle }))
        : [];

      if (skipClear) return;

      this.currentRelative = [];
      this.formGroup.patchValue({ category: '' });
    });
  }

  onTypeChange(value: string): void {
    this.currentRelative = [];
    this.formGroup.patchValue({ type: value, category: '' });

    const tagRadio = this.formGroup.get('tagRadio');
    tagRadio.setValidators(value === 'Activity' ? Validators.required : null);
    tagRadio.updateValueAndValidity();
  }
}
