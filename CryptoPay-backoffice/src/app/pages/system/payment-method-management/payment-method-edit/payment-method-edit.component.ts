import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidator } from 'src/app/shared/form-validator';
import { AppService } from 'src/app/app.service';
import { UploadApi } from 'src/app/shared/api/upload.api';
import { PaymentMethodManagementApi } from 'src/app/shared/api/payment-method-management.api';
import { map } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { NgFor, NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { PaymentMethodItem } from 'src/app/shared/interfaces/payment-method-management';
import { validatorNumberRequired } from 'src/app/shared/models/validator';

@Component({
  selector: 'app-payment-method-edit',
  templateUrl: './payment-method-edit.component.html',
  styleUrls: ['./payment-method-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    UploadComponent,
    LangPipe,
    FormRowComponent,
    AngularSvgIconModule,
    SelectGroupComponent,
    ModalFooterComponent,
    ModalTitleComponent,
    InputFloatDirective,
  ],
})
export class PaymentMethodEditComponent implements OnInit {
  constructor(
    private appService: AppService,
    private fb: FormBuilder,
    private uploadApi: UploadApi,
    private api: PaymentMethodManagementApi,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private modal: MatModal
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = +id || 0;
  }

  id = 0;
  formGroup: FormGroup = this.fb.group({});
  preAmountCtr = new FormControl('', Validators.compose([Validators.required, validatorNumberRequired]));
  validator!: FormValidator;
  info: PaymentMethodItem;
  isLoading = false; // 是否处于加载
  maxPreAmountLen = 6;

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getPaymentMethodList({ id: this.id })
      .pipe(map((res) => ({ ...res, list: res?.list || [] })))
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.info = res?.list?.[0] || ({ fixedAmounts: [] } as any);

        this.loadForm();
        this.setFromValue('cnName', this.info.paymentMethodNameLocal);
        this.setFromValue('enName', this.info.paymentMethodNameEn);
        this.setFromValue('status', this.info.isEnable);
        this.info.images.forEach((item, index) => {
          this.setFromValue(`icon${index + 1}`, item);
        });
      });
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      cnName: ['', Validators.compose([Validators.required])],
      enName: ['', Validators.compose([Validators.required])],
      icon1: ['', Validators.compose([Validators.required])],
      icon2: ['', Validators.compose([Validators.required])],
      icon3: ['', Validators.compose([Validators.required])],
      icon4: ['', Validators.compose([Validators.required])],
      icon5: ['', Validators.compose([Validators.required])],
      icon6: ['', Validators.compose([Validators.required])],
      icon7: ['', Validators.compose([Validators.required])],
      icon8: ['', Validators.compose([Validators.required])],
      icon9: ['', Validators.compose([Validators.required])],
      status: false,
    });
    this.validator = new FormValidator(this.formGroup);
  }

  /**
   * 设置表单数据
   * @param name
   * @param value
   */
  setFromValue(name, value) {
    this.formGroup.controls[name].patchValue(value);
  }

  back() {
    this.router.navigate(['/system/paymentMethodManagement']);
  }

  submit() {
    this.formGroup.markAllAsTouched(); // 手动执行验证
    if (this.formGroup.invalid) return;
    this.update();
  }

  update() {
    const params = {
      id: this.info.id,
      paymentMethodNameEn: this.formGroup.value.enName,
      paymentMethodNameLocal: this.formGroup.value.cnName,
      isEnable: this.formGroup.value.status,
      images: [
        this.formGroup.value.icon1,
        this.formGroup.value.icon2,
        this.formGroup.value.icon3,
        this.formGroup.value.icon4,
        this.formGroup.value.icon5,
        this.formGroup.value.icon6,
        this.formGroup.value.icon7,
        this.formGroup.value.icon8,
        this.formGroup.value.icon9,
      ],
      fixedAmounts: this.info?.fixedAmounts || [],
    };
    this.loading(true);
    this.api.updatedPaymentMethod(params).subscribe((res) => {
      this.loading(false);
      if (res === true) {
        this.back();
      }

      this.appService.toastOpera(res === true);
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 打开预设金额编辑
   */
  onOpenEditPreAmount(tpl) {
    this.preAmountCtr.reset();
    this.modal.open(tpl, { width: '500px' });
  }

  /**
   * 添加预设金额
   */
  onAddPreAmount(close) {
    if (this.preAmountCtr.invalid) return;

    const amount = +this.preAmountCtr.value! || 0;
    this.info.fixedAmounts = [...new Set([...(this.info.fixedAmounts || []), amount])].sort((a, b) => a - b);

    close();
  }

  /**
   * 删除预设金额
   */
  onDelPreAmount(i: number) {
    this.info.fixedAmounts && this.info.fixedAmounts.splice(i, 1);
  }
}
