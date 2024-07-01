import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { AppService } from 'src/app/app.service';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { finalize, Subject, zip } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { tap } from 'rxjs/operators';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { UEditorComponent } from 'src/app/components/ueditor/ueditor.component';
import { LangTabComponent as LangTabComponent_1 } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { InputPercentageDirective, InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { NgIf, NgSwitch, NgSwitchCase, NgFor } from '@angular/common';

@Component({
  templateUrl: './pay-edit.component.html',
  styleUrls: ['./pay-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    InputPercentageDirective,
    NgSwitch,
    NgSwitchCase,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    CdkDropList,
    CdkDrag,
    ReactiveFormsModule,
    LangTabComponent_1,
    UEditorComponent,
    InputTrimDirective,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class PayEditComponent implements OnInit {
  id = '';
  queryData: any = {};

  constructor(
    private router: Router,
    private api: AssetApi,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private ngbModal: NgbModal,
    private modal: MatModal
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = id;
    this.queryData = { ...activatedRoute.snapshot.queryParams };
  }

  formGroup: FormGroup = this.fb.group({
    lang: this.fb.array([
      this.fb.group({
        remark: ['' /*Validators.required*/],
        withdrawDesc: ['' /*Validators.required*/],
        detailDesc: ['' /*Validators.required*/],
        code: ['zh-cn'],
      }),
    ]),
  });

  validator!: FormValidator;
  selectLang = ['zh-cn']; // PM:默认值CN
  selectLangLabel = ['zh-cn']; // PM:默认值CN
  selectLangLabelCurrent = 'zh-cn'; // PM:默认值CN

  data: any = {
    fee: '',
    feeEnabled: true,
    selectLabel: [],
  };

  protected readonly _destroy$ = new Subject<void>();

  // 标签
  isEditTag = true; // 是否可编辑标签
  labelList: any[] = []; // 标签列表
  editTagData!: any;
  labelControl: FormArray = this.fb.array([
    this.fb.group({
      id: [''],
      label: ['', Validators.compose([Validators.required])],
      code: ['zh-cn'],
    }),
  ]);

  tipsList: any[] = [
    { key: 'remark', value: 'Operate' },
    { key: 'withdrawDesc', value: 'Deposit' },
    { key: 'detailDesc', value: 'Detail' },
  ];

  /** 获取选择标签名 */
  get labelName(): string[] {
    return this.data.selectLabel?.map((e) => this.labelList.find((j) => j.labelId === e)?.name || '') || [];
  }

  // 拖动排序
  drop(event) {
    //  如果没有发生交互直接return
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(this.labelList, event.previousIndex, event.currentIndex);
    // labelId数组
    let sortIds = this.labelList.map((item) => item.labelId);
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateLabelSort({
        tenantId: this.queryData.merchantId,
        sortIds,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res) {
          this.appService.showToastSubject.next({
            msgLang: 'payment.currency.updaeSortSuccess',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'payment.currency.updateSortFail',
            successed: false,
          });
        }
      });
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.getPayMethodDetail({
        id: this.id,
        ...this.queryData,
        tenantId: this.queryData.merchantId,
      }),
      this.getLabel()
    ).subscribe(([res]) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res) return;
      res = res?.list?.[0] || {};
      res.fee = String((res.fee * 1e4) / 100 || '');
      this.data = res;
      this.data.selectLabel = Object.keys(res.selectLabel || []).map((e) => +e);
      this.loadForm(res);
    });
  }

  /** methods */
  onSubmit(langTab: LangTabComponent): void {
    this.formGroup.markAllAsTouched();
    langTab.check();

    if (this.formGroup.invalid) return;

    const tipsInfo = this.formGroup.value.lang.map((e) => ({
      languageCode: e.code,
      tipsInfoItem: this.tipsList.reduce(
        (t: any[], n) => (e[n.key] ? [...t, { tipsType: n.value, content: e[n.key] }] : t),
        []
      ),
    }));

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updatePaymentMethod({
        ...this.data,
        tenantId: this.queryData.merchantId,
        fee: (this.data.fee * 100) / 1e4 || 0,
        tipsInfo,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (!+res)
          return this.appService.showToastSubject.next({
            msgLang: 'payment.currency.updateFailed',
            successed: false,
          });

        this.appService.showToastSubject.next({
          msgLang: 'payment.currency.updateCompleted',
          successed: true,
        });
        this.back();
      });
  }

  back(): void {
    this.router.navigate(['/pay/method']);
  }

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  loadForm(detail?: any): void {
    if (detail?.tipsInfo?.length) {
      this.selectLang = detail.tipsInfo.map((e) => e.languageCode);

      this.formGroup = this.fb.group({
        lang: this.fb.array(
          detail.tipsInfo.map((e) =>
            this.fb.group({
              remark: ['' /*Validators.required*/],
              withdrawDesc: ['' /*Validators.required*/],
              detailDesc: ['' /*Validators.required*/],
              code: [e.languageCode],
              ...e.tipsInfoItem.reduce((t: any, n) => {
                const key = this.tipsList.find((j) => j.value === n.tipsType)?.key;
                return { ...t, [key]: [n.content /*Validators.required*/] };
              }, {}),
            })
          )
        ),
      });
    }

    this.validator = new FormValidator(this.formGroup);
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((code) => {
      const value = {
        code,
        remark: '',
        withdrawDesc: '',
        detailDesc: '',
        ...prevValue.find((e) => e.code === code), // 把之前的值保留下来
      };

      return this.fb.group({
        remark: [value.remark /*Validators.required*/],
        withdrawDesc: [value.withdrawDesc /*Validators.required*/],
        detailDesc: [value.detailDesc /*Validators.required*/],
        code: [value.code],
      });
    });

    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  getLabel() {
    return this.api.getlabellist(this.queryData.merchantId).pipe(
      tap((label) => {
        this.labelList = label;
      })
    );
  }

  // 打开删除标签提示
  async onOpenDelTagTpl(event, tpl: TemplateRef<any>, item: any) {
    event.stopPropagation();
    event.preventDefault();

    const modal = this.ngbModal.open(tpl, { centered: true });
    if ((await modal.result) !== true) return;

    this.onDelTag(item);
  }

  // 打开编辑标签浮层
  async onOpenEditLabelTpl(tpl: TemplateRef<any>, labelItem?: any[]) {
    this.labelControl.markAsUntouched({ onlySelf: true });
    this.selectLangLabelCurrent = 'zh-cn'; // 默认选中中文

    if (labelItem) {
      // 编辑
      this.selectLangLabel = labelItem['item'].map((e) => e.languageCode);
      this.labelControl = this.fb.array(
        labelItem['item'].map((e) =>
          this.fb.group({
            labelId: [labelItem['labelId']],
            label: [e.name, Validators.required],
            code: [e.languageCode],
          })
        )
      );
    } else {
      // 新增
      this.selectLangLabel = ['zh-cn'];
      this.labelControl = this.fb.array([
        this.fb.group({
          id: [''],
          label: ['', Validators.required],
          code: ['zh-cn'],
        }),
      ]);
    }

    this.editTagData = labelItem;
    this.modal.open(tpl, { width: '500px' });
  }

  // 编辑标签 新增为undefined
  onUpdateLabel(c: any, langTabCom: LangTabComponent): void {
    this.labelControl.markAllAsTouched();
    langTabCom.check();

    if (this.labelControl.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .addorupdatelabel(
        this.queryData.merchantId,
        this.editTagData?.labelId,
        this.labelControl.value.map((e) => ({
          name: e.label,
          languageCode: e.code,
        }))
      )
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((id) => {
        if (this.data.selectLabel.includes(this.editTagData?.labelId)) {
          this.data.selectLabel = this.data.selectLabel.filter((e) => e !== this.editTagData?.labelId);
          this.data.selectLabel.push(id);
        }
        if (!+id) return this.appService.showToastSubject.next({ msgLang: 'payment.method.operationFailed' });
        this.getLabel().subscribe();
        this.appService.showToastSubject.next({
          msgLang: 'payment.method.sucOperation',
          successed: true,
        });

        c(true);
      });
  }

  // 删除标签
  onDelTag(item: any): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .deletelabel(this.queryData.merchantId, item.labelId)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        if (res !== true) return this.appService.showToastSubject.next({ msgLang: 'payment.currency.failedToDelete' });

        this.appService.showToastSubject.next({
          msgLang: 'payment.currency.sucDeleted',
          successed: true,
        });
        this.data.selectLabel = this.data.selectLabel.filter((e) => e !== item.labelId); // 如果当前删除了，也对应删除，提交的时候不要带过去就行

        this.getLabel().subscribe();
      });
  }

  updateLanguageTagForm(select): void {
    const prevValue = this.labelControl.value as any[];
    const langArray = select.map((code) => {
      const prevData = prevValue.find((e) => e.code === code);
      return this.getInitContent({ ...(prevData || { code }) });
    });

    this.labelControl = this.fb.array(langArray);
  }

  getInitContent(value?: any): any {
    return this.fb.group({
      id: [value?.id || ''],
      label: [value?.label || '', Validators.compose([Validators.required])],
      code: [value?.code || 'zh-cn'],
    });
  }

  findCurrentLang(code: string): any {
    return this.labelControl.controls.find((e) => e.value['code'] === code);
  }
}
