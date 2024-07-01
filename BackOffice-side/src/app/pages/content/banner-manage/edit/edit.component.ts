import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LangTabComponent,
  LangTabComponent as LangTabComponent_1,
} from 'src/app/shared/components/lang-tab/lang-tab.component';
import { BannerApi } from 'src/app/shared/api/banner.api';
import { AppService } from 'src/app/app.service';
import moment from 'moment';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgForOf, NgIf } from '@angular/common';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MerchantsApi } from 'src/app/shared/api/merchants.api';
import { BannerDetail, BannerTypeEnum } from 'src/app/shared/interfaces/banner';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent_1,
    FormRowComponent,
    UploadComponent,
    NgIf,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    LangPipe,
    NgForOf,
    SelectGroupDirective,
    SelectChildrenDirective,
  ],
})
export class EditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private api: BannerApi,
    private appService: AppService,
    private lang: LangService,
    private merchantsApi: MerchantsApi
  ) {}

  formGroup: FormGroup = this.fb.group({
    lang: this.fb.array([
      this.fb.group({
        // title: ['', Validators.compose([Validators.required])],
        title: [''],
        bannerUrl: ['', Validators.compose([Validators.required])],
        // imageUrl: ['', Validators.compose([Validators.required])],
        imageUrl: [''],
        languageCode: ['zh-cn'],
      }),
    ]),
    releaseType: 'Immediately',
  });

  validator!: FormValidator;
  config = {
    id: 0,
    tenantId: 0,
    startTime: 0,
    endTime: 0,
    nowTime: new Date(),
    timeInvalid: false,
    clientType: '',
    bannerPageType: '' as BannerTypeEnum,
  };

  bannerDetail: BannerDetail;

  isAdd = true;
  selectLang = ['zh-cn']; // PM:默认值CN
  langList: { checked: boolean; value: string }[] = [];

  get langArrayForm() {
    return this.formGroup.get('lang') as FormArray;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();
  }

  /** methods */
  initData(): void {}

  loadForm(): void {
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.config.bannerPageType = v.bannerPageType;
      this.config.clientType = v.clientType;
      this.config.tenantId = v.tenantId;
      //新增获取数据
      this.formGroup = this.fb.group({
        lang: this.fb.array([
          this.fb.group({
            // title: ['', Validators.compose([Validators.required])],
            title: [''],
            bannerUrl: ['', Validators.compose([Validators.required])],
            // imageUrl: ['', Validators.compose([Validators.required])],
            imageUrl: [''],
            languageCode: ['zh-cn'],
          }),
        ]),
        releaseType: 'Immediately',
      });

      this.validator = new FormValidator(this.formGroup);

      this.config.nowTime = new Date();
      if (v.id) {
        this.config.id = v.id;
        this.isAdd = false;
      }

      this.appService.isContentLoadingSubject.next(true);
      forkJoin([
        this.merchantsApi.getMerchantLanguage(this.config.tenantId),
        v.id ? this.api.getInfocs({ bannerId: this.config.id }) : of(null), // 新增不获取详情
      ]).subscribe(([langList, detail]) => {
        this.appService.isContentLoadingSubject.next(false);
        if (detail) {
          this.bannerDetail = detail;
        }

        this.langList = langList.map((value) => ({
          checked: !detail?.supportLangList?.length ? true : detail.supportLangList.includes(value),
          value,
        }));

        this.update(this.bannerDetail);
      });
    });
  }

  update(detail): void {
    if (!detail) return;

    this.config.tenantId = detail.merchantId;
    this.config.id = detail.id;
    this.config.bannerPageType = detail.bannerPageType;
    this.config.clientType = detail.clientType;
    this.config.startTime = this.formatDateTime(detail.startTime);
    this.config.endTime = this.formatDateTime(detail.endTime);
    this.formGroup.patchValue({
      releaseType: detail.releaseType,
    });

    this.selectLang = Array.isArray(detail.banners) ? detail.banners.map((e) => e.languageCode) : this.selectLang;
    this.formGroup.setControl(
      'lang',
      this.fb.array(
        detail.banners.map((e) =>
          this.fb.group({
            // title: [e.title, Validators.compose([Validators.required])],
            title: [e.title],
            bannerUrl: [e.bannerUrl, Validators.compose([Validators.required])],
            // imageUrl: [e.imageUrl, Validators.compose([Validators.required])],
            imageUrl: [e.imageUrl],
            languageCode: [e.languageCode],
          })
        )
      )
    );
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        title: '',
        bannerUrl: '',
        imageUrl: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        // title: [value.title, Validators.compose([Validators.required])],
        title: [value.title],
        bannerUrl: [value.bannerUrl, Validators.compose([Validators.required])],
        // imageUrl: [value.imageUrl, Validators.compose([Validators.required])],
        imageUrl: [value.imageUrl],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  formatDate(releaseTime: any): any {
    if (!releaseTime) return 0;
    return moment(releaseTime).valueOf();
  }

  formatDateTime(releaseTime: any): any {
    if (!releaseTime) return 0;
    return moment(releaseTime).format();
  }

  startTimeBack(): any {
    this.config.startTime ? (this.config.timeInvalid = false) : (this.config.timeInvalid = true);
  }

  async onSubmit(langTab: LangTabComponent) {
    this.formGroup.markAllAsTouched();
    langTab.check();

    if (!this.langList.some((e) => e.checked))
      return this.appService.showToastSubject.next({ msgLang: 'content.ba.supportLangRequire' });

    if (this.formGroup.value.releaseType === 'Immediately') {
      // 立即发布
      this.config.startTime = 0;
    } else {
      //预约发布但不选择开始时间
      if (this.config.startTime === 0) {
        this.config.timeInvalid = true;
        return;
      }
    }
    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    const banners = this.formGroup.value.lang;
    const starTimeDate = this.formatDate(this.config.startTime);
    const endTimeDate = this.formatDate(this.config.endTime);
    this.api
      .postAddorUpdateBanner({
        banners,
        id: this.config.id,
        merchantId: this.config.tenantId,
        bannerPageType: this.config.bannerPageType,
        clientType: this.config.clientType,
        releaseType: this.formGroup.value.releaseType,
        ...(starTimeDate ? { startTime: starTimeDate } : { startTime: 0 }),
        ...(endTimeDate ? { endTime: endTimeDate } : { endTime: 0 }),
        supportLangList: this.langList.filter((e) => e.checked).map((e) => e.value),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(res === true);
        res === true &&
          this.router.navigate(['/content/banner-manage'], { queryParams: { bannerType: this.config.clientType } });
      });
  }

  /** 返回上一次入口 */
  onBack(): void {
    this.router.navigate(['/content/banner-manage'], {
      queryParams: { bannerType: this.config.clientType },
    });
  }
}
