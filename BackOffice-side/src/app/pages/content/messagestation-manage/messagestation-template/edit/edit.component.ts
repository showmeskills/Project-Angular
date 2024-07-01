import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AppService } from 'src/app/app.service';
import { MessagestationApi } from 'src/app/shared/api/messagestation.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent as LangTabComponent_1 } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, FormsModule, ReactiveFormsModule, LangTabComponent_1, FormRowComponent, LangPipe],
})
export class EditComponent implements OnInit {
  formGroup: FormGroup = this.fb.group({});
  id = ''; // 编辑所用id
  validator!: FormValidator;
  isAdd = true;
  selectLang = ['zh-cn']; // PM:默认值CN
  modal!: NgbModalRef;
  searchGroup: any = {};
  detail: any = {};

  constructor(
    private fb: FormBuilder,
    public modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private appService: AppService,
    private api: MessagestationApi,
    private lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  get langArrayForm() {
    return this.formGroup.get('lang') as FormArray;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();
    this.initData();
  }

  /** methods */
  initData(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getTemplate({
        id: this.id,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.detail = res;
        this.update(this.detail);
      });
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([this.getLangForm()]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  update(detail): void {
    this.selectLang = detail.titleContent.map((e) => e.languageCode);
    this.formGroup.setControl('lang', this.fb.array(detail.titleContent.map((e) => this.getLangForm(e))));
  }

  /** 获取主题Form */
  getLangForm(value?: any) {
    return this.fb.group({
      title: [value?.title || '', Validators.required],
      content: [value?.content || '', Validators.required],
      languageCode: [value?.languageCode || 'zh-cn'],
    });
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        content: '',
        title: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.getLangForm(value);
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  async onSubmit(langTab: LangTabComponent) {
    const fail = await this.lang.getOne('content.insite.cFail');
    this.formGroup.markAllAsTouched();
    langTab.check();
    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    const titleContent = this.formGroup.value.lang;
    this.api
      .updaTetemplateContent({
        titleContent,
        id: this.id,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res === true) {
          this.router.navigate(['/content/messagestation-manage/messagestation-template']);
          return this.appService.showToastSubject.next({
            msgLang: 'content.insite.cSuc',
            successed: true,
          });
        }
        this.appService.showToastSubject.next({
          msg: fail + res.error.detail,
          successed: false,
        });
      });
  }
}
