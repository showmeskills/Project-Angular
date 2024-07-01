import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';

@Component({
  selector: 'app-profit-sharing',
  templateUrl: './profit-sharing.component.html',
  styleUrls: ['./profit-sharing.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    NgFor,
    NgIf,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    FormWrapComponent,
  ],
})
export class ProfitSharingComponent implements OnInit {
  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  selectLang = ['zh-cn']; // PM:默认值CN

  constructor(
    private fb: FormBuilder,
    private modalService: MatModal
  ) {}

  time: Date[] = []; // 活动时间

  cycle: any = 1;
  cycleList: any[] = [
    { name: '周', value: 1 },
    { name: '月', value: 2 },
  ];

  weekList: any[] = [
    { name: '一', value: 1 },
    { name: '二', value: 2 },
    { name: '三', value: 3 },
    { name: '四', value: 4 },
    { name: '五', value: 5 },
    { name: '六', value: 6 },
    { name: '七', value: 7 },
  ];

  curWeekList: any = [1, 4];

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  get getMaxWeek() {
    return Math.max(...this.curWeekList);
  }

  get getMinWeek() {
    return Math.min(...this.curWeekList);
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

  seletcdWeek(v: any) {
    if (this.curWeekList.length < 2) {
      this.curWeekList.push(v);
    } else {
      // 如果新选择的 大于 第二位 删除最后的
      // if (v >= this.curWeekList[1]) {
      //   this.curWeekList.pop();
      // } else {
      //   this.curWeekList.shift();
      // }
      this.curWeekList = [];
      this.curWeekList.push(v);
    }
  }

  onSubmit() {}
}
