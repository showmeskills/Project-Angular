import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MessagestationApi } from 'src/app/shared/api/messagestation.api';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UEditorComponent } from 'src/app/components/ueditor/ueditor.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { NgSwitch, NgSwitchCase, NgIf, NgFor } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'NoticeEdit',
  templateUrl: './notice-edit.component.html',
  styleUrls: ['./notice-edit.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgSwitch,
    NgSwitchCase,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    UEditorComponent,
    NgIf,
    NgFor,
    AngularSvgIconModule,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class NoticeEditComponent implements OnInit {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private appService: AppService,
    private api: MessagestationApi,
    private activatedRoute: ActivatedRoute
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  base: any = {};

  /** 编辑所用id */
  id = '';

  /** 记录的动态 */
  recordList: any[] = [];

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  modal!: NgbModalRef;
  selectLang = ['zh-cn']; // PM:默认值CN
  optionVal: any = {
    vip: '0',
    status: '0',
    source: '0',
  };

  recordType = [
    { type: 'Create', name: '新增', color: 'green' },
    { type: 'ModifyTitle', name: '将站内信标题更改为', color: 'yellow' },
    { type: 'ModifyContent', name: '将站内信内容更改为', color: 'yellow' },
    { type: 'Canceled', name: '撤回', color: 'red' },
  ];

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  /** 获取数据 */
  loadData(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getNotice({
        id: this.id,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.base = res;
        this.update(this.base);
        this.setRecordList(this.base);
        if (this.base.queryInfo) {
          this.optionVal.source = this.base.queryInfo.sourceList ? '1' : '0';
          this.optionVal.status = this.base.queryInfo.statusList ? '1' : '0';
          this.optionVal.vip = this.base.queryInfo.vipList ? '1' : '0';
        }
      });
  }

  /** 获取表单数据 */
  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([this.getLangForm()]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  update(base): void {
    this.selectLang = base.titleContent.map((e) => e.languageCode);
    this.formGroup.setControl('lang', this.fb.array(base.titleContent.map((e) => this.getLangForm(e))));
  }

  /** 获取主题Form */
  getLangForm(value?: any) {
    return this.fb.group({
      title: [value?.title || '', Validators.required],
      content: [value?.content || '', Validators.required],
      languageCode: [value?.languageCode || 'zh-cn'],
    });
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadData();
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        title: '',
        content: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.getLangForm(value);
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  async onSubmit(tpl, langTab): Promise<void> {
    this.formGroup.markAllAsTouched();
    langTab.check();
    if (this.formGroup.invalid) return;
    const titleContent = this.formGroup.value.lang;
    const res = await this.modalService.open(tpl, { centered: true }).result;
    if (!res?.value) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updaTenotice({
        titleContent,
        id: this.base.id,
        tenantId: this.base.tenantId,
        noticeType: this.base.noticeType,
        userIdList: this.base.userIdList,
        queryInfo: this.base.queryInfo,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'content.insite.saveSuc',
            successed: true,
          });
          // 成功后关闭页面
          this.router.navigate(['/content/messagestation-manage/messagestation-log']);
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'content.insite.saveFail',
            successed: false,
          });
        }
      });
  }

  /**
   * 设置记录列表
   */
  setRecordList(list: any) {
    const res = list?.userNoticeOperationList || [];

    this.recordList = res.map((e) => ({
      ...e,
      custom: this.recordType.find((item) => item.type === e.operationName),
    }));
  }
}
