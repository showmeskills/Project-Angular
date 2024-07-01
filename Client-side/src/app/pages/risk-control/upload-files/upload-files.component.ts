import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import { FullAuditRequest, RiskFormMap } from 'src/app/shared/interfaces/risk-control.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc/kyc.service';
import { TrxUploadList, VideoUpload } from '../risk-control.config';
import { RiskControlService } from '../risk-control.service';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss'],
})
export class UploadFilesComponent implements OnInit {
  constructor(
    private kycApi: KycApi,
    public appService: AppService,
    public kycService: KycService,
    private toastService: ToastService,
    private localeService: LocaleService,
    private riskService: RiskControlService,
    private toast: ToastService,
    private resourceApi: ResourceApi,
    private riskApi: RiskControlApi
  ) {}

  trxList = TrxUploadList;
  videoUpload = VideoUpload;
  stepOne = true;
  stepTwo = false;
  stepThree = false;
  isH5!: boolean;
  completed: boolean = false;
  backImage!: string;
  frontImage!: string;
  canReFile1: boolean = false;
  canReFile2: boolean = false;
  submitLoading: boolean = false;
  detailConfig = [
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta00`),
    },
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta01`),
    },
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta02`),
    },
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta03`),
    },
    {
      icon: 'close-simple',
      value: this.localeService.getValue(`forei_mid_deta04`),
    },
    {
      icon: 'close-simple',
      value: this.localeService.getValue(`forei_mid_deta05`),
    },
  ];

  ngOnInit() {}

  trackMethod(index: any, item: any) {
    return item.value;
  }

  /** 是否可以提交 */
  get canSubmitForm(): boolean {
    const step1Completed = !!this.frontImage && !!this.backImage;
    const step2Completed =
      !!this.trxList['bankRecord'].fileList.length && !!this.trxList['cryptoRecord'].fileList.length;

    return step1Completed || step2Completed || !!this.videoUpload['video'].videoUrl;
  }

  /**
   * 上传正反面
   *
   * @param element
   * @param event
   * @param imgElement
   * @param front
   */
  handleImgChange(event: Event, imgElement: HTMLImageElement, front?: boolean) {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    const file = target.files && target.files[0];
    if (!file) return;

    // 文件类型验证
    const fileType = file.type.toLowerCase();
    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(fileType)) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    // 文件大小验证 10M
    const fileMaxSize = 1024 * 1024 * 5;
    if (file.size > fileMaxSize) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }
    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      if (url) {
        if (front) {
          this.frontImage = url;
        } else {
          this.backImage = url;
        }
        imgElement.src = url;
        imgElement.style.display = 'block';
      } else {
        target.value = '';
        this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
    });
  }

  onSubmitPending() {
    const step1Completed = !!this.frontImage && !!this.backImage;
    const step2Completed =
      !!this.trxList['bankRecord'].fileList.length && !!this.trxList['cryptoRecord'].fileList.length;
    if (step1Completed) {
      this.stepOne = false;
      this.stepTwo = true;
    }
    if (step2Completed) {
      this.stepTwo = false;
      this.stepThree = true;
    }

    if (step1Completed && step2Completed && this.videoUpload['video'].videoUrl) {
      this.submitLoading = true;
      const params: FullAuditRequest = {
        //此表单不用id
        frontsideImage: this.frontImage,
        backsideImage: this.backImage,
        bankRecordImages: this.trxList['bankRecord'].fileList,
        cryptoCurrencyRecordImages: this.trxList['cryptoRecord'].fileList,
        videoUrl: this.videoUpload['video'].videoUrl,
      };
      this.riskApi.submitFullAudit(params).subscribe(resp => {
        if (resp.data) {
          this.submitLoading = false;
          this.completed = true;
          this.riskService.handleFormStorage(false, RiskFormMap.FULLAUDIT);
          this.riskService.checkUserRiskForm();
        }
      });
    }
  }
}
