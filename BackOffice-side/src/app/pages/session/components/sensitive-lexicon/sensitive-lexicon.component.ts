import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppService } from 'src/app/app.service';
import { SessionApi } from 'src/app/shared/api/session.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SensitiveLexiconItem } from 'src/app/shared/interfaces/session';

@Component({
  selector: 'sensitive-lexicon',
  templateUrl: './sensitive-lexicon.component.html',
  styleUrls: ['./sensitive-lexicon.component.scss'],
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
    ModalFooterComponent,
    LangPipe,
  ],
})
export class SensitiveLexiconComponent implements OnInit {
  constructor(
    public modal: MatModalRef<SensitiveLexiconComponent>,
    private fb: FormBuilder,
    public appService: AppService,
    private api: SessionApi
  ) {}

  @Input() tenantId?;

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
    this.getDetail();
  }

  /** 获取详情 */
  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.sensitive_query(this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res?.data?.length) return;
      this.selectLang = res.data.map((e) => e.languageCode);
      this.formGroup.setControl(
        'lang',
        this.fb.array(
          res.data.map((e) =>
            this.generateLangItem({
              ...e,
              content: e.content,
            })
          )
        )
      );
    });
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

  generateLangItem(data?: SensitiveLexiconItem) {
    return this.fb.group({
      languageCode: [data?.languageCode || 'zh-cn'],
      content: [data?.content || '', Validators.required],
    });
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const sensList =
      this.formGroup.value.lang?.map((e) => ({
        languageCode: e.languageCode, // 语言Code
        content: e.content, // 内容
      })) || [];

    const params = {
      tenantId: this.tenantId,
      sensList,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.sensitive_update(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0')
        return this.appService.showToastSubject.next(
          res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.modal.close(true);
    });
  }
}
