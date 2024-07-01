import { Component, DestroyRef, HostListener, OnInit, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { KycStatus } from 'src/app/shared/interfaces/kyc.interface';
import { KycValidationService } from 'src/app/shared/service/kyc-validation';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc.service';

@UntilDestroy()
@Component({
  selector: 'app-advance-kyc',
  templateUrl: './advance-kyc.component.html',
  styleUrls: ['./advance-kyc.component.scss'],
})
export class AdvanceKycComponent implements OnInit {
  constructor(
    private appService: AppService,
    public kycService: KycService,
    public dialogRef: MatDialogRef<AdvanceKycComponent>,
    private kycApi: KycApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private popupService: PopupService,
    private resourceApi: ResourceApi,
    private destroyRef: DestroyRef,
  ) {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      if (!x) return;
      this.userInfor = x;
    });
  }
  userInfor!: AccountInforData;

  address: string = ''; //地址
  postcode: string = ''; //邮编
  city: string = ''; //城市
  countryISO: string = ''; //区号
  isPage1: boolean = true; //初始页面：验证类型选择

  /**选择的文件 */
  imgFile: File | null = null;
  /**选择的文件成功上传后的路径 */
  imgFileUrl: string = '';

  showNotice: boolean = false;
  cityVaild: boolean = false;
  postCodeValid: boolean = false;
  submitLoading: boolean = false; //提交中
  detailConfig = {
    title: this.localeService.getValue('detail_config00'),
    detailList: [
      '•' + this.localeService.getValue('detail_config01'),
      '•' + this.localeService.getValue('detail_config02'),
      '•' + this.localeService.getValue('detail_config03'),
      '•' + this.localeService.getValue('detail_config04'),
      '•' + this.localeService.getValue('detail_config05'),
    ],
  };
  noticeConfig = {
    title: this.localeService.getValue('notice_config00') + ':',
    list: [
      '- ' + this.localeService.getValue('notice_config01'),
      '- ' + this.localeService.getValue('notice_config02'),
      '- ' + this.localeService.getValue('notice_config03'),
      '- ' + this.localeService.getValue('notice_config04'),
      '- ' + this.localeService.getValue('notice_config05'),
      '- ' + this.localeService.getValue('notice_config06'),
      '- ' + this.localeService.getValue('notice_config07'),
      '- ' + this.localeService.getValue('notice_config08'),
      '- ' + this.localeService.getValue('notice_config09'),
    ],
  };
  initLoading: boolean = true;

  /** 所有KYC 状态 */
  kycStatus$: Observable<Array<KycStatus>> = toObservable(this.kycService._kycStatus).pipe(
    takeUntilDestroyed(),
    filter(v => v.length > 0),
  );

  /** 是否已提交 */
  isSubmitted: WritableSignal<boolean> = signal(false);

  ngOnInit() {
    // 自动带入信息
    this.kycApi.getKycContactInfo().subscribe(res => {
      if (res?.data) {
        const { address, city, zipCode } = res.data;
        this.address = address || '';
        this.city = city || '';
        this.onCityInput();
        this.postcode = zipCode || '';
        this.onPostInput();
      }
      this.initLoading = false;
    });

    this.kycStatus$.subscribe(kycStatus => {
      if (!this.isSubmitted()) return;
      if (kycStatus) {
        const advanceCreateTime = kycStatus?.find(item => item?.type === 'KycAdvanced')?.createTime;
        const formatDate = moment(advanceCreateTime).add(3, 'd').format('YYYY-MM-DD');
        this.submitLoading = false;
        //账户验证完成弹出框 升级审核中
        this.kycService.successPop(formatDate, () => {
          this.close();
        });
      }
    });

    // 获取当前国家代码（泰国/越南；
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x),
      )
      .subscribe(x => {
        //获取当前手机区号
        this.countryISO = x.iso;
      });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    this.isSubmitted.set(false);
  }

  /**
   * 城市规则验证
   *
   * @param element 地方输入框
   */
  onCityInput() {
    //规则：地址大于2位
    this.cityVaild = !KycValidationService._hasSpecialCharacters(this.city);
  }

  /**
   * 邮编规则验证
   *
   * @param element
   */
  onPostInput() {
    this.postCodeValid = KycValidationService.validatePostCodeWithNationalityItem(this.countryISO, this.postcode);
  }

  //check 继续btn  valid status
  canSubmit() {
    if (this.isPage1) {
      return (
        this.address.length > 4 &&
        this.postCodeValid &&
        this.postcode.length !== 0 &&
        this.cityVaild &&
        this.city.length !== 0
      );
    } else {
      return !this.upLoading && this.imgFileUrl;
    }
  }

  /**上传图片中 */
  upLoading!: boolean;

  /**上传文件 */
  selectFile(event: Event) {
    this.imgFile = null;
    this.imgFileUrl = '';
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    const file = target.files && target.files[0];
    if (!file) return;
    const rule: any = {
      'image/png': 1024 * 1024 * 5,
      'image/jpg': 1024 * 1024 * 5,
      'image/jpeg': 1024 * 1024 * 5,
      'application/pdf': 1024 * 1024 * 5,
    };
    const fileType = file.type.toLowerCase();
    if (!rule[fileType]) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }
    if (file.size > rule[fileType]) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    //通过检验，开始上传
    this.upLoading = true;
    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      this.upLoading = false;
      if (url) {
        this.imgFile = file;
        this.imgFileUrl = url;
        this.toast.show({ message: this.localeService.getValue('up_s'), type: 'success', title: '' });
      } else {
        this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
      target.value = '';
    });
  }

  //继续按钮
  // enter键操作
  @HostListener('body:keydown.enter', ['$event'])
  async handleNext() {
    if (!this.canSubmit()) {
      return;
    }
    if (this.isPage1) {
      //进入page2
      this.isPage1 = false;
    } else {
      this.postKycAdance();
    }
  }

  async postKycAdance() {
    if (this.submitLoading) return;
    this.submitLoading = true;

    const advanceCallBack = await this.kycApi.postAdanced(
      this.countryISO,
      '',
      this.postcode,
      this.city.trim(),
      this.address.trim(),
      this.imgFileUrl,
    );
    if (advanceCallBack?.data) {
      this.isSubmitted.set(true);
      this.kycService._refreshKycStatus.set('asia-advance-kyc');
    } else {
      this.toast.show({ message: advanceCallBack.message, type: 'fail', title: '' });
      this.submitLoading = false;
    }
  }

  back() {
    this.isPage1 = true;
    this.imgFile = null;
    this.imgFileUrl = '';
  }

  openNotice() {
    this.showNotice = !this.showNotice;
  }
}
