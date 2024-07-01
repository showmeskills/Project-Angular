import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { SupplymentaryKycAdvancedForEu } from 'src/app/shared/interfaces/kyc.interface';
import { UploadCustomizeParams, UploadPaymentParams } from 'src/app/shared/interfaces/risk-control.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycUtils } from '../kyc-contants/kyc-utils';
import { KycService } from '../kyc.service';

@Component({
  selector: 'app-add-support-documents-dialog',
  templateUrl: './add-support-documents-dialog.component.html',
  styleUrls: ['./add-support-documents-dialog.component.scss'],
})
export class AddSupportDocumentsDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AddSupportDocumentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      item: {
        id: string;
        type: string;
        document: {
          customizeName: string;
          paymentName: string;
        };
        key: string;
        documents: {
          intro: string[];
          uploads: Array<{ url: string; fileType: File | null }>;
          currentIndex: number;
          title: string;
        };
      };
    },
    private localeService: LocaleService,
    private riskApi: RiskControlApi,
    private toastService: ToastService,
    private resourceApi: ResourceApi,
    public kycService: KycService,
    private popupService: PopupService,
    private kycApi: KycApi,
    private appService: AppService,
    private kycUtils: KycUtils,
  ) {}

  /**加载*/
  submitLoading: boolean = false;

  /** 弹窗头部 */
  headerInfor: string = '';

  /**上传图片中 */
  upLoading!: boolean;

  /**选择的文件 */
  imgFile: File | null = null;

  /**选择的文件成功上传后的路径 */
  imgFileUrl: string = '';

  /**原始文件名 */
  fileNames: string[] = [];

  id: string = '';

  /** 默认 提示语言 */
  defaultRequirement = this.localeService.getValue('upload_requirement');

  /** 默认子提示语 */
  subDefaultRequirements: string[] = [
    `.  ${this.localeService.getValue('upload_requirement_inf')}`,
    `*${this.localeService.getValue('note_in')}`,
    `*${this.localeService.getValue('upl_limits')}`,
  ];

  /** 是否上传过文件 */
  isUploaded: boolean = false;

  ngOnInit() {
    this.checkHeaderContant();
  }

  checkHeaderContant() {
    this.id = this.data.item.id;
    switch (this.data.item.type) {
      case 'PaymentMethod':
        this.headerInfor =
          this.localeService.getValue('payment_method_vise') + ' ' + this.data.item?.document?.paymentName;
        this.subDefaultRequirements[0] = this.localeService
          .getValue('upload_requirement_inf')
          .replace('{{popupTitle}}', this.headerInfor);
        break;
      case 'ID':
        this.headerInfor = this.localeService.getValue('identity_document');
        break;
      case 'POA':
        this.headerInfor = this.localeService.getValue('proof_of_address_document');
        break;
      case 'Customize':
        this.headerInfor = this.data.item.document.customizeName;
        this.subDefaultRequirements[0] = this.localeService
          .getValue('upload_requirement_inf')
          .replace('{{popupTitle}}', this.headerInfor);
        break;
      case 'WealthSourceDocument':
        this.headerInfor = this.localeService.getValue(this.data.item.documents.title);
        this.subDefaultRequirements = this.data.item.documents.intro?.map((item: string) =>
          this.localeService.getValue(item),
        );
        break;
      default:
        break;
    }
  }

  /** 获取补充材料 kyc参数 */
  get advanceKycParams(): SupplymentaryKycAdvancedForEu {
    return {
      id: this.id,
      [this.data.item.key]: this.data.item.documents.uploads.map(item => item?.url),
    };
  }

  async handleSubmit() {
    const paymentMethodParam: UploadPaymentParams = {
      id: this.id,
      paymentName: this.data.item?.document?.paymentName,
      screenshotProof: this.imgFileUrl,
      originalFileName: this.fileNames[0],
    };
    const customizeParams: UploadCustomizeParams = {
      id: this.id,
      customizeName: this.data.item.type,
      customizeValue: this.imgFileUrl,
      originalFileName: this.fileNames[0],
    };
    this.submitLoading = true;
    switch (this.data.item.type) {
      case 'PaymentMethod':
        this.riskApi.postUploadPaymentMethod(paymentMethodParam).subscribe(data => {
          if (data) {
            // 需要重新获取kycstatus 数据
            this.kycService._refreshKycStatus.set('PaymentMethod');
            this.successPop();
          } else {
            this.toastService.show({ message: this.localeService.getValue('up_f'), type: 'fail' });
            this.submitLoading = false;
            this.close();
          }
        });
        break;
      case 'Customize':
        this.riskApi.postUploadCustomize(customizeParams).subscribe(data => {
          if (data) {
            // 需要重新获取kycstatus 数据
            this.kycService._refreshKycStatus.set('Customize');
            this.successPop();
          } else {
            this.toastService.show({ message: this.localeService.getValue('up_f'), type: 'fail' });
            this.submitLoading = false;
            this.close();
          }
        });
        break;
      case 'WealthSourceDocument':
        this.kycApi.onUploadAdvanceSow(this.advanceKycParams).subscribe(data => {
          if (data) {
            // 需要重新获取kycstatus 数据
            this.kycService._refreshKycStatus.set('WealthSourceDocument');
            this.successPop();
          } else {
            this.toastService.show({ message: this.localeService.getValue('up_f'), type: 'fail' });
            this.submitLoading = false;
            this.close();
          }
          this.kycUtils.userDocuments[this.data.item.key].documents.uploads = [];
        });
        break;
      default:
        break;
    }
  }

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
      this.toastService.show({
        message: this.localeService.getValue('unsupp_file'),
        type: 'fail',
        title: this.localeService.getValue('unsupp_file_title'),
      });
      target.value = '';
      return;
    }
    if (file.size > rule[fileType]) {
      this.toastService.show({ message: this.localeService.getValue('file_limerr'), type: 'fail' });
      target.value = '';
      return;
    }

    /** 非财富证明 只能传一个 文件*/
    if (this.isUploaded) {
      this.toastService.show({ message: this.localeService.getValue('unique_docs'), type: 'fail' });
      return;
    }

    //通过检验，开始上传
    this.upLoading = true;
    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      this.upLoading = false;
      if (url) {
        if (this.data.item.type !== 'WealthSourceDocument') {
          this.imgFile = file;
          this.imgFileUrl = url;
          this.fileNames.push(file.name);
          this.isUploaded = true;
        }

        if (this.data.item.type === 'WealthSourceDocument') {
          // 财富证明可以传多个
          const docs = this.data.item.documents;
          docs.uploads.push({ url, fileType: file });
          this.fileNames.push(file.name);
          docs.currentIndex = docs.uploads.length - 1;
        }
        this.toastService.show({ message: this.localeService.getValue('up_s'), type: 'success', title: '' });
      } else {
        this.toastService.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
      target.value = '';
    });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    Object.values(this.kycUtils.userDocuments).forEach(item => {
      item.documents.uploads = [];
      item.isSelected = false;
    });
  }

  successPop() {
    const currentTime = moment().format('YYYY-MM-DD');
    const formatDate = moment.utc(currentTime).format('YYYY-MM-DD [UTC]');
    //账户验证完成弹出框 升级审核中
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'success',
        icon: 'assets/svg/sand-clock-1.svg',
        content: this.localeService.getValue('kyc_in_verification'),
        info:
          '<div  style="display: flex; justify-content: center;flex-direction: column;gap: 15px;align-items: center">' +
          this.localeService.getValue('kyc_expected_date') +
          '<span style="color: #FF580E;">' +
          formatDate +
          '</span></div>',
        buttons: [{ text: this.localeService.getValue('sure_btn'), primary: true }],
        callback: () => {
          this.close();
          this.submitLoading = false;
        },
      },
    });
  }

  /**
   *
   * @returns
   */
  canSubmit() {
    if (this.data.item.type !== 'WealthSourceDocument') {
      return !this.upLoading && this.imgFileUrl;
    }
    return !this.upLoading && this.data.item.documents.uploads.length > 0;
  }
}
