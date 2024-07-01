import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { timer } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { FeedbackApi } from 'src/app/shared/apis/feedback.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import { FeedbackOptionList } from 'src/app/shared/interfaces/feedback.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { FeedbackService } from '../feedback.service';

@UntilDestroy()
@Component({
  selector: 'app-submit-feedback',
  templateUrl: './submit-feedback.component.html',
  styleUrls: ['./submit-feedback.component.scss'],
})
export class SubmitFeedbackComponent implements OnInit {
  constructor(
    private feedbackApi: FeedbackApi,
    private resourceApi: ResourceApi,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public appService: AppService,
    private toast: ToastService,
    private dialog: MatDialog,
    public feedbackService: FeedbackService,
    private localeService: LocaleService
  ) {}

  initLoading: boolean = true;
  optionList!: FeedbackOptionList;
  submitLoading!: boolean;
  upLoading!: boolean;

  /**建议类型 */
  feedbackType!: string;
  /**产品类型 */
  productType: string = '';
  /**选择平台 */
  clientType: string[] = [];
  /**那种语言 */
  languageCode: string = '';
  /**设备信息 */
  device: string = '';
  /**app版本 */
  version: string = '';
  /**建议主题 */
  title: string = '';
  /**建议详情 */
  detail: string = '';
  /**输入网址 */
  url: string = '';
  /**附件 */
  urlList: string[] = [];

  files: File[] = [];
  allLangData!: LangModel[];
  canSubmit: boolean = false;
  formErrors: any = {};

  feedbackTypeTooltip = [
    { tit: this.localeService.getValue('sen_ce'), con: this.localeService.getValue('sen_cf') },
    { tit: this.localeService.getValue('sen_cg'), con: this.localeService.getValue('sen_ch') },
    { tit: this.localeService.getValue('sen_ci'), con: this.localeService.getValue('sen_cj') },
    { tit: this.localeService.getValue('sen_ck'), con: this.localeService.getValue('sen_cl') },
  ];

  ngOnInit() {
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(v => (this.allLangData = v));
    this.feedbackService
      .getOptionList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.data) {
          this.optionList = res.data;
          this.feedbackType =
            this.activatedRoute.snapshot.params.target ?? this.optionList.feedbackTypeOptionList[0].code;
          console.log(this.feedbackType);
          console.log(this.optionList);
          this.initLoading = false;
        }
      });
  }

  reset() {
    this.canSubmit = false;
    this.formErrors = {};
    this.productType = '';
    this.clientType = [];
    this.languageCode = '';
    this.device = '';
    this.version = '';
    this.title = '';
    this.detail = '';
    this.url = '';
    this.files = [];
    this.urlList = [];
  }

  selectFeedbackType(v: string) {
    if (this.feedbackType === v) return;
    this.reset();
    this.feedbackType = v;
  }

  selectClientType(v: string, key: string) {
    const index = this.clientType.findIndex(x => x === v);
    if (index >= 0) {
      this.clientType.splice(index, 1);
      switch (v) {
        case 'iOS':
        case 'Android':
          this.device = '';
          this.version = '';
          break;
        case 'Website':
          this.url = '';
          break;
      }
    } else {
      this.clientType.push(v);
    }
    this.onChange(key);
  }

  selectFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    const file = target.files && target.files[0];
    if (!file) return;
    const rule: any = {
      'image/png': 1024 * 1024 * 2,
      'image/jpg': 1024 * 1024 * 2,
      'image/jpeg': 1024 * 1024 * 2,
      'video/mp4': 1024 * 1024 * 30,
      'video/mov': 1024 * 1024 * 30,
      'video/quicktime': 1024 * 1024 * 30,
    };
    const fileType = file.type.toLowerCase();
    if (!rule[fileType]) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '', duration: 3000 });
      target.value = '';
      return;
    }
    const isVideo = fileType.startsWith('video');
    const typeName = isVideo ? this.localeService.getValue('up_file_v') : this.localeService.getValue('up_file_i');
    if (file.size > rule[fileType]) {
      this.dialog.open(StandardPopupComponent, {
        data: {
          type: 'warn',
          content: `${typeName}` + this.localeService.getValue('up_file_lim'),
          description: this.localeService.getValue('up_file_sup', 30, isVideo ? 'mp4' : 'JPG', isVideo ? 'mov' : 'PNG'), //`支持文件：${isVideo ? '30M以下的mp4、mov' : '2M以下的JPG、PNG'}`,
          buttons: [{ text: this.localeService.getValue('confirm_button'), primary: true }],
        },
      });
      target.value = '';
      return;
    }

    //通过检验，开始上传
    this.upLoading = true;
    this.resourceApi.uploadFile(file, fileType, 'UserFeedback').subscribe(url => {
      this.upLoading = false;
      if (url) {
        this.files.push(file);
        this.urlList.push(url);
        this.toast.show({
          message: `${typeName}${this.localeService.getValue('up_s')}`,
          type: 'success',
          duration: 3000,
        });
      } else {
        this.toast.show({
          message: `${typeName}${this.localeService.getValue('up_f')},${this.localeService.getValue('try_later')}`,
          type: 'fail',
        });
      }
      target.value = '';
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  submit() {
    if (!this.check(true)) return;
    this.submitLoading = true;
    this.feedbackApi
      .getCreate({
        feedbackType: this.feedbackType,
        productType: this.productType,
        clientType: this.clientType,
        languageCode: this.languageCode,
        device: this.device,
        version: this.version,
        title: this.title,
        detail: this.detail,
        url: this.url,
        urlList: this.urlList,
      })
      .subscribe(res => {
        if (res?.data) {
          this.reset();
          this.toast.show({
            message: this.localeService.getValue('thx_sug'),
            type: 'success',
            duration: 3000,
          });
          //简单判断是否还在当前页，如果还在，就跳转到记录 TODO: 可能会违背用户意愿，懒得和产品掰扯，等有问题提出再修改
          timer(3000)
            .pipe(untilDestroyed(this))
            .subscribe(_ => {
              this.goRecord();
            });
        } else {
          this.toast.show({
            message: `${this.localeService.getValue('sub_f')}, ${this.localeService.getValue('try_later')}`,
            type: 'fail',
          });
        }
        this.submitLoading = false;
      });
  }

  check(mark: boolean): boolean {
    let verify = true;

    if (!this.feedbackType) {
      verify = false;
    }
    if (!this.productType) {
      if (mark) this.formErrors['productType'] = true;
      verify = false;
    }
    if (this.clientType.length < 1) {
      if (mark) this.formErrors['clientType'] = true;
      verify = false;
    }
    if (/**this.feedbackType === 'Localization' &&*/ !this.languageCode) {
      if (mark) this.formErrors['languageCode'] = true;
      verify = false;
    }
    if (!this.title) {
      if (mark) this.formErrors['title'] = true;
      verify = false;
    }
    if (!this.detail || this.detail.length > 1000) {
      if (mark) this.formErrors['detail'] = true;
      verify = false;
    }
    return verify;
  }

  onChange(key: string) {
    this.canSubmit = this.check(false);
    switch (key) {
      case 'productType':
        this.formErrors['productType'] = !this.productType;
        break;
      case 'clientType':
        this.formErrors['clientType'] = this.clientType.length < 1;
        break;
      case 'languageCode':
        //if (this.feedbackType !== 'Localization') return;
        this.formErrors['languageCode'] = !this.languageCode;
        break;
      case 'title':
        this.formErrors['title'] = !this.title;
        break;
      case 'detail':
        this.formErrors['detail'] = !this.detail || this.detail.length > 1000;
        break;
    }
  }

  goRecord() {
    this.router.navigateByUrl('/' + this.appService.languageCode + '/feedback/record');
  }
}
