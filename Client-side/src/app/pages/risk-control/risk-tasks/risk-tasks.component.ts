import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import { FaceVerifyService } from 'src/app/shared/components/face-verify/face-verify.service';
import { RiskFormMap } from 'src/app/shared/interfaces/risk-control.interface';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { KycService } from '../../kyc/kyc.service';
import { RiskControlService } from '../risk-control.service';

const TASK_ICON_MAP: { [key: string]: string } = {
  '-1': 'icon-kyc-phone',
  '1': 'icon-kyc-name',
  '2': 'icon-add',
  '6': 'icon-face',
  '9': 'icon-kyc-full',
};

@Component({
  selector: 'app-risk-tasks',
  templateUrl: './risk-tasks.component.html',
  styleUrls: ['./risk-tasks.component.scss'],
})
export class RiskTasksComponent implements OnInit {
  constructor(
    private riskApi: RiskControlApi,
    public riskService: RiskControlService,
    private router: Router,
    private appService: AppService,
    private faceVerify: FaceVerifyService,
    private localStorageService: LocalStorageService,
    private kycDialogService: KycDialogService,
    private kyc: KycService,
  ) {}
  @ViewChild('stepper') stepper?: ElementRef; // stepper
  loading: boolean = false;
  showList: boolean = true;

  ngOnInit() {
    if (this.riskService.showRiskBanner$.getValue() && !this.riskService.riskTaskList.length) {
      this.loadAuthList();
    }
  }

  loadAuthList() {
    this.loading = true;
    this.riskApi.getRiskAuth().subscribe(resp => {
      if (resp) {
        this.riskService.riskTaskList = resp.data;
        this.riskService.riskTaskList.forEach((x, i) => {
          x.index = i + 1;
          x.icon = TASK_ICON_MAP[x.value];
        });
        this.loading = false;
      }
    });
  }

  close() {
    this.riskService.showAuthTask$.next(false);
  }

  /**
   * 检查是否可点击
   *
   * @param index
   * @returns
   */
  checkIfClickable(index: number): boolean {
    const previousUndone = this.riskService.riskTaskList.slice(0, index).find(x => !x.isAuthentication);
    return previousUndone ? false : true;
  }

  async jumpToPage(value: number) {
    switch (value) {
      //手机认证
      case -1:
        this.router.navigate([this.appService.languageCode, 'verification', 'enable-phone']);
        break;
      //实名认证-kyc中级
      case 1:
        // this.router.navigate([this.appService.languageCode, 'userCenter', 'kyc']);
        // const userKyc: UserKycStatus[] = await this.kyc.getKycInfor();
        // console.log('userKyc', userKyc);
        // const kycPrimary = userKyc.find((item: UserKycStatus) => item.type === 'KycPrimary');
        // const intermediate = userKyc.find((item: UserKycStatus) => item.type === 'KycIntermediat');
        // if (kycPrimary?.status !== 'S') {
        //   this.kycDialogService.openPrimaryVerifyDialog();
        // } else if (intermediate?.status !== 'S') {
        //   this.kycDialogService.openVerifyDialog(3);
        // }
        break;
      //地址认证-kyc高级
      case 2:
        this.router.navigate([this.appService.languageCode, 'userCenter', 'kyc']);
        this.kycDialogService.openVerifyDialog(5);
        break;
      //人脸识别
      case 6:
        this.faceVerify.getFaceVerify();
        break;
      //全套认证
      case 9:
        if (this.checkIfClickable(this.riskService.riskTaskList.length - 1)) {
          this.riskService.handleFormStorage(true, RiskFormMap.FULLAUDIT);
          setTimeout(() => {
            this.router.navigate([this.appService.languageCode, 'risk-control', 'upload-files']);
          }, 0);
        }
        break;
      default:
        break;
    }
  }
}
