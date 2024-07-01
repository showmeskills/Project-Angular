import { Component, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoMoneyCurrency } from 'src/app/shared/interfaces/common.interface';
import { BankApi } from 'src/app/shared/api/bank.api';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
@Component({
  templateUrl: './bank-edit.component.html',
  styleUrls: ['./bank-edit.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class BankEditComponent implements OnInit {
  constructor(
    public modal: MatModalRef<BankEditComponent>,
    private fb: FormBuilder,
    private appService: AppService,
    private api: BankApi,
    public lang: LangService
  ) {}

  formGroup: FormGroup = this.getInitForm();
  currencyList: GoMoneyCurrency[] = [];

  /** getters */
  get isEdit() {
    return !!this.formGroup.value.id;
  }

  /** lifeCycle */
  ngOnInit(): void {}

  /** methods */
  getInitForm(value?: any) {
    return this.fb.group({
      name: [value?.bankNameLocal || '', Validators.required],
      nameEN: [value?.bankNameEn || ''],
      code: [value?.bankCode || '', Validators.required],
      type: [value?.currencyType || [], Validators.required],
      id: [value?.id || 0],
    });
  }

  onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) return;

    const type = this.isEdit ? 'updateBankListConfig' : 'addBankListConfig';
    this.appService.isContentLoadingSubject.next(true);
    this.api[type]({
      bankCode: this.formGroup.value['code'],
      bankNameLocal: this.formGroup.value['name'],
      bankNameEn: this.formGroup.value['nameEN'],
      currencyType: this.formGroup.value['type'],
      id: this.formGroup.value['id'],
    }).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);
      const successed = res === true;
      let edit = await this.lang.getOne('common.edit');
      let adds = await this.lang.getOne('common.add');
      let success = await this.lang.getOne('common.success');
      let fail = await this.lang.getOne('common.fail');
      const msg = (this.isEdit ? edit : adds) + (successed ? success : fail);

      this.appService.showToastSubject.next({ msg, successed });

      successed && this.modal.close(true);
    });
  }

  setForm(value) {
    if (!value) return;

    this.formGroup = this.getInitForm(value);
  }
}
