import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { LegalAreaApi } from 'src/app/shared/api/legalarea.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { FormValidator } from 'src/app/shared/form-validator';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-jurisdiction',
  templateUrl: './jurisdiction.component.html',
  styleUrls: ['./jurisdiction.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatExpansionModule,
    NgFor,
    MatListModule,
    LangPipe,
  ],
})
export class JurisdictionComponent implements OnInit {
  formGroup!: FormGroup;
  validator!: FormValidator;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private selectApi: SelectApi,
    private legalAreaApi: LegalAreaApi,
    public lang: LangService
  ) {}

  isLoading = false;
  allchecked = { name: '全部', lang: 'common.all', selected: false };
  countryList_one: any = []; // 国家清单1
  countryList_two: any = []; // 国家清单2
  id_one: any = '';
  id_two: any = '';

  // get nameArrayForm() {
  //   return this.formGroup.get('nameList') as FormArray;
  // }

  ngOnInit() {
    this.loadForm();
    this.getInitData();
  }

  getInitData() {
    this.loading(true);
    this.selectApi.getCountry().subscribe((countryList) => {
      if (!Array.isArray(countryList)) return;
      this.countryList_one = cloneDeep(countryList);
      this.countryList_two = cloneDeep(countryList);

      this.legalAreaApi.getLegalareaList().subscribe((res) => {
        this.loading(false);

        // 为国家清单塞入英文名称
        countryList.forEach((k) => {
          res.forEach((j) => {
            j.area?.forEach((e) => {
              if (k.continentCode === e.continentCode) {
                k.countries.forEach((c) => {
                  e.countries.forEach((ec) => {
                    if (ec.countryCode === c.countryCode) {
                      ec.countryEnName = c.countryEnName;
                    }
                  });
                });
              }
            });
          });
        });

        // this.formGroup.setControl('nameList', this.fb.array(
        //   res.map(e => this.fb.group({
        //     name: [e.name, Validators.compose([Validators.required])],
        //   }))
        // ));

        if (res?.length > 0) {
          const one = res[0];
          const two = res[1];
          if (one) {
            this.formGroup.patchValue({ name_one: one.name });
            this.countryList_one = one.area;
            this.id_one = one.id;
          }
          if (two) {
            this.formGroup.patchValue({ name_two: two.name });
            this.countryList_two = two.area;
            this.id_two = two.id;
          }
        }
      });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 初始化 全部表单
  loadForm(): void {
    // this.formGroup = this.fb.group({
    //   nameList: this.fb.array([
    //     this.fb.group({
    //       name: ['', [Validators.required]]
    //     })
    //   ])
    // });
    this.formGroup = this.fb.group({
      name_one: ['', Validators.required],
      name_two: ['', Validators.required],
    });
    this.validator = new FormValidator(this.formGroup);
  }

  isIndeterminate(item: any, status: any): boolean {
    let hasChecked = false;
    let isAll = false;

    if (item.name !== '全部') {
      hasChecked = item['countries'].some((v) => v['selected']); // 有一个满足条件返还true
      isAll = item['countries'].every((v) => v['selected']); // 全部满足条件返还true
    } else {
      if (status === 1) {
        hasChecked = this.countryList_one.some((v) => v['countries'].some((j) => j['selected']));
        isAll = this.countryList_one.every((v) => v['countries'].every((j) => j['selected']));
      } else {
        hasChecked = this.countryList_two.some((v) => v['countries'].some((j) => j['selected']));
        isAll = this.countryList_two.every((v) => v['countries'].every((j) => j['selected']));
      }
    }

    item['selected'] = hasChecked;
    return hasChecked && !isAll;
  }

  checkItem(item: any, status: any) {
    if (!item) return;
    const val = item['selected'];
    if (item.countries && item.countries.length) {
      item.countries.forEach((v) => (v['selected'] = val));
    } else {
      if (status === 1) {
        this.countryList_one.forEach((v) => {
          v['selected'] = val;
          v.countries.forEach((j) => (j['selected'] = val));
        });
      } else {
        this.countryList_two.forEach((v) => {
          v['selected'] = val;
          v.countries.forEach((j) => (j['selected'] = val));
        });
      }
    }
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const code_one: any = [];
    const code_two: any = [];

    this.countryList_one.forEach((a) => {
      a.countries.forEach((b) => {
        if (b.selected) code_one.push(b.countryCode);
      });
    });

    this.countryList_two.forEach((a) => {
      a.countries.forEach((b) => {
        if (b.selected) code_two.push(b.countryCode);
      });
    });

    if (code_one.length === 0) {
      this.appService.showToastSubject.next({
        msgLang: 'content.sf.sf1No',
        successed: false,
      });
      return;
    }
    if (code_two.length === 0) {
      this.appService.showToastSubject.next({
        msgLang: 'content.sf.sf2No',
        successed: false,
      });
      return;
    }

    const addParams: any = [];
    const updateParams: any = [];

    if (this.id_one) {
      // 如果有区域1 有ID，是更新
      const obj: any = {};
      obj.id = this.id_one;
      obj.name = this.formGroup.value.name_one;
      obj.supportArea = code_one;

      updateParams.push(obj);
    } else if (!this.id_one) {
      // 如果有区域1 无ID，是新增
      const obj: any = {};
      obj.name = this.formGroup.value.name_one;
      obj.supportArea = code_one;

      addParams.push(obj);
    }

    if (this.id_two) {
      // 如果有区域2 有ID，是更新
      const obj: any = {};
      obj.id = this.id_two;
      obj.name = this.formGroup.value.name_two;
      obj.supportArea = code_two;

      updateParams.push(obj);
    } else if (!this.id_two) {
      // 如果有区域2 无ID，是新增
      const obj: any = {};
      obj.name = this.formGroup.value.name_two;
      obj.supportArea = code_two;

      addParams.push(obj);
    }

    // 新增请求
    if (addParams.length > 0) {
      this.loading(true);
      this.legalAreaApi.createLagalArea(addParams).subscribe((res) => {
        this.loading(false);
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'budget.addSuc',
            successed: true,
          });
          this.getInitData();
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'budget.addFailed',
            successed: false,
          });
        }
      });
    }
    // 更新请求
    if (updateParams.length > 0) {
      this.loading(true);
      this.legalAreaApi.getUpdateLagalarea(updateParams).subscribe((res) => {
        this.loading(false);
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'payment.channelConfig.updateCompleted',
            successed: true,
          });
          this.getInitData();
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'payment.channelConfig.updateFailed',
            successed: false,
          });
        }
      });
    }
  }
}
