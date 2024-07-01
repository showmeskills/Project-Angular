import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { CorrespondenceInfoItem, CorrespondenceItem } from 'src/app/shared/interfaces/member.interface';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'correspondence-note-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    FormWrapComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    ModalFooterComponent,
    LangPipe,
    NgTemplateOutlet,
    AttrDisabledDirective,
    TimeFormatPipe,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
  ],
})
export class CorrespondenceNoteEditComponent implements OnInit {
  constructor(
    public modal: MatModalRef<CorrespondenceNoteEditComponent>,
    public activatedRoute: ActivatedRoute,
    private api: MemberApi,
    private fb: FormBuilder,
    public appService: AppService
  ) {
    const { uid, tenantId } = activatedRoute.snapshot.queryParams; // params参数;

    this.uid = uid;
    this.tenantId = tenantId;
  }

  @Input() id?: number;
  @Input() data?: CorrespondenceItem;
  @Output() editSuccess = new EventEmitter();

  uid: string;
  tenantId: string;

  /** 日期 */
  time = new Date() as Date;

  /** 当前类型 */
  category = 'Email';
  /** 类型 */
  categoryList = [
    {
      name: '邮箱',
      lang: 'member.overview.correspondence.email',
      value: 'Email',
    },
    { name: '聊天', lang: 'member.overview.correspondence.chat', value: 'Chat' },
    { name: '其他', lang: 'member.overview.correspondence.other', value: 'Other' },
  ];

  /** 语系数据 */
  curLang = 'zh-cn';
  selectLang = ['zh-cn'];
  formGroup: FormGroup = this.fb.group({
    lang: this.fb.array([this.generateLangItem()]),
  });

  /** 名称多语系 */
  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  ngOnInit() {
    this.id && this.getDetail();
  }

  /** 获取详情 */
  getDetail() {
    // 类型
    this.category = this.data?.boardType || '';

    // 多语言
    const infoList = this.data?.info || [];
    this.selectLang = infoList.map((e) => e.languageCode);
    this.formGroup.setControl(
      'lang',
      this.fb.array(
        infoList.map((e) =>
          this.generateLangItem({
            ...e,
            problem: e.problem, // 问题
            answer: e.answer, // 回答
          })
        )
      )
    );
  }

  /** 更新语言表单 */
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.generateLangItem(value);
    });

    this.formGroup.setControl('lang', this.fb.array(langArray));
  }

  generateLangItem(data?: CorrespondenceInfoItem) {
    return this.fb.group({
      languageCode: [data?.languageCode || 'zh-cn'],
      problem: [data?.problem || '', Validators.required],
      answer: [data?.answer || '', Validators.required],
    });
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const infoList =
      this.formGroup.value.lang?.map((e) => ({
        languageCode: e.languageCode, // 语言Code
        problem: e.problem, // 问题
        answer: e.answer, // 回答
      })) || [];

    const params = {
      tenantId: this.tenantId,
      boardType: this.category,
      uid: this.uid,
      ...(this.id ? { id: this.id } : { uid: this.uid, messageBoardTime: +this.time }),
      infoList,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api[this.id ? 'updatemessageboard' : 'addsmessageboard'](params).subscribe((res) => {
      if (!res)
        return this.appService.showToastSubject.next(
          res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });

      this.editSuccess.emit();
      this.modal.close(true);
    });
  }
}
