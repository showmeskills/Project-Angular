import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { AddPopupComponent } from '../add-popup/add-popup.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { NgFor } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';

@Component({
  selector: 'app-svip-experience',
  templateUrl: './svip-experience.component.html',
  styleUrls: ['./svip-experience.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    NgFor,
    FormWrapComponent,
  ],
})
export class SvipExperienceComponent implements OnInit {
  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  selectLang = ['zh-cn']; // PM:默认值CN
  constructor(
    private fb: FormBuilder,
    private modalService: MatModal
  ) {}

  time: Date[] = []; // 活动时间

  kycLeval: any = 1;
  kycLevalList: any = [
    { name: '初级', value: 1 },
    { name: '中级', value: 2 },
  ];

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  ngOnInit() {
    this.loadForm();
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          name: ['', Validators.required],
          languageCode: ['zh-cn'],
        }),
      ]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        name: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        name: [value.name, Validators.required],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  openAddPopup(type: any) {
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = [];
    modalRef.result.then(() => {}).catch(() => {});
  }

  onSubmit() {}
}
