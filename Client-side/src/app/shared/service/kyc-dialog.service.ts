import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { KycApi } from '../apis/kyc-basic.api';
import { StandardPopupComponent } from '../components/standard-popup/standard-popup.component';
import { UserVerificationForEu } from '../interfaces/kyc.interface';
import { LocaleService } from './locale.service';
import { PopupService } from './popup.service';

@Injectable({
  providedIn: 'root',
})
export class KycDialogService {
  constructor(
    private dialog: MatDialog,
    // private kycService: KycService,
    private appService: AppService,
    private router: Router,
    private popupService: PopupService,
    private localeService: LocaleService,
    private kycApi: KycApi,
  ) {}

  /**
   * 验证弹出框
   *
   * @param step
   */
  //初级账户验证完成 弹出框 H5下全屏页面露出顶部导航
  openVerifyDialog(step: number) {
    let panelCss = 'custom-dialog-container';
    if (document.body.offsetWidth <= 799) {
      panelCss = 'kyc-dialog-container'; //----------H5环境进入页面，
    }
    import('src/app/pages/kyc/verify-dialog/verify-dialog.component').then(({ VerifyDialogComponent }) => {
      this.dialog
        .open(VerifyDialogComponent, {
          disableClose: true,
          autoFocus: false,
          panelClass: panelCss,
          data: { step },
        })
        .afterClosed()
        .subscribe(() => {
          // this.kycService.refreshKycSubject$.next(true);
        });
    });
  }
  /**
   * 初级认证弹出框
   */
  async openPrimaryVerifyDialog() {
    //获取用户kyc的信息
    this.kycApi.getUserKycStatus().subscribe(data => {
      if (data[0].status == 'I' || data[0].status == 'R') {
        //I:未认证 (初级直接通过，不存在P的状态)
        let panelCss = 'custom-dialog-container';
        if (document.body.offsetWidth <= 799) {
          panelCss = 'kyc-dialog-container'; //----------H5环境进入页面，
        }
        import('src/app/pages/kyc/verify-dialog/verify-dialog.component').then(({ VerifyDialogComponent }) => {
          this.dialog
            .open(VerifyDialogComponent, {
              panelClass: panelCss,
              autoFocus: false,
              disableClose: true,
              id: 'kyc-dialog',
              data: { step: 1 },
            })
            .afterClosed()
            .subscribe(() => {
              // this.kycService.refreshKycSubject$.next(true);
            });
        });
      }
    });
  }

  /**
   *中级kyc弹出框
   *
   * @param payload
   * @param payload.status
   * @param payload.isFailedProcess 区分补充材料,可以正常失败后提交的接口
   */
  openMidVerifyDialog(payload?: { status: 'ID' | 'POA'; isFailedProcess: boolean }) {
    let panelCss = 'custom-dialog-container';
    if (document.body.offsetWidth <= 799) {
      panelCss = 'kyc-dialog-container'; //----------H5环境进入页面，
    }
    import('src/app/pages/kyc/verify-dialog/verify-dialog.component').then(({ VerifyDialogComponent }) => {
      this.dialog
        .open(VerifyDialogComponent, {
          panelClass: panelCss,
          autoFocus: false,
          disableClose: true,
          id: 'kyc-dialog',
          data: { step: 3, supplymentaryDocs: payload?.status, isFailedProcess: payload?.isFailedProcess },
        })
        .afterClosed()
        .subscribe(() => {});
    });
  }

  //补充文件 ID和POA
  openAddDocuments(status: 'ID' | 'POA') {
    let panelCss = 'custom-dialog-container';
    if (document.body.offsetWidth <= 799) {
      panelCss = 'kyc-dialog-container'; //----------H5环境进入页面，
    }
    import('src/app/pages/kyc/verify-dialog/verify-dialog.component').then(({ VerifyDialogComponent }) => {
      this.dialog
        .open(VerifyDialogComponent, {
          panelClass: panelCss,
          autoFocus: false,
          disableClose: true,
          id: 'kyc-dialog',
          data: { step: 3, supplymentaryDocs: status },
        })
        .afterClosed()
        .subscribe(() => {
          // this.kycService.refreshKycSubject$.next(true);
        });
    });
  }

  /**
   * 存提kyc验证提示弹出框
   * 进入kyc首页 用户自选认证方式，避免已通过全部认证，从站内信打开验证弹框；中级kyc【审核中】状态下打开验证弹框
   */
  kycVarificationNoticeDialog() {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('safety_rem00'),
        buttons: [{ text: this.localeService.getValue('verification_acc'), primary: true }],
        description: this.localeService.getValue('verification_acc_notice'),
        callback: () => {
          this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
          // this.openMidVerifyDialog();
        },
        closeIcon: true,
      },
      disableClose: false,
    });
  }

  /**
   * 查看运营人员在后台对用户发起中/高级验证请求提示弹出框
   *
   * @param desc
   * @param isMid
   */
  authenicationIntermediateNoticeDialog(desc: string = 'auth_acc_notice', isMid: boolean = true) {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('rem'),
        buttons: [
          { text: this.localeService.getValue('sure_btn'), primary: false },
          { text: this.localeService.getValue('verify_now'), primary: true },
        ],
        description: this.localeService.getValue(desc),
        callback: async () => {
          this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
          if (isMid) {
            this.kycApi.getUserKycStatus().subscribe(data => {
              if (data[0].status == 'I' || data[0].status == 'R') {
                this.openPrimaryVerifyDialog();
              } else if (data[0].status == 'S' || (data[1] && data[1].status !== 'S' && data[1].status !== 'P')) {
                this.openMidVerifyDialog();
              }
              if (data[1] && data[1].status == 'P') {
                this.statusNoticePopup();
              }
            });
          } else {
            this.openVerifyDialog(5);
          }
        },
        closeIcon: true,
      },
      disableClose: true,
    });
  }

  /**
   * 需kyc认证相关弹窗
   *
   * @param code
   * 2050 | null => kyc 验证等级不够
   * 2051 => kyc 验证名字不符合
   * 2052 => kyc 验证地区不符合
   * @param level 如果是验证等级不够的错误，则代表需要什么等级的验证
   * 1 => 需初级
   * 2 => 需中级
   * 3 => 需高级
   * @param openDialog 是走路由 还是 打开弹窗
   */
  async showKycError(code: number | null, level: number = 0, openDialog: boolean = true) {
    this.dialog.closeAll();
    switch (code) {
      case null:
      case 2050:
        if (level == 1) {
          //kyc初级
          this.popupService.open(StandardPopupComponent, {
            speed: 'faster',
            disableClose: true,
            data: {
              type: 'warn',
              content: this.localeService.getValue('safety_rem00'),
              buttons: [{ text: this.localeService.getValue('verification'), primary: true }],
              description: this.localeService.getValue(['', 'kyc_error00', 'kyc_error02', ''][level]),
              closeIcon: true,
              callback: () => {
                if (openDialog) {
                  this.openPrimaryVerifyDialog();
                } else {
                  this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
                }
              },
            },
          });
        } else if (level == 2) {
          this.kycApi.getUserKycStatus().subscribe(data => {
            if (data.length > 1) {
              //检查中级kyc状态
              if (data[1].status == 'I' || data[1].status == 'R') {
                this.popupService.open(StandardPopupComponent, {
                  speed: 'faster',
                  data: {
                    type: 'warn',
                    content: this.localeService.getValue('safety_rem00'),
                    buttons: [{ text: this.localeService.getValue('verification'), primary: true }],
                    description: this.localeService.getValue(['', 'kyc_error00', 'kyc_error02', ''][level]),
                    callback: () => {
                      this.openMidVerifyDialog();
                    },
                  },
                });
              } else if (data[1].status == 'P') {
                this.statusNoticePopup();
              }
            } else {
              //检查初级kyc状态
              if (data[0].status == 'S') {
                this.popupService.open(StandardPopupComponent, {
                  speed: 'faster',
                  data: {
                    type: 'warn',
                    content: this.localeService.getValue('safety_rem00'),
                    buttons: [{ text: this.localeService.getValue('verification'), primary: true }],
                    description: this.localeService.getValue(['', 'kyc_error00', 'kyc_error02', ''][level]),
                    callback: () => {
                      this.openMidVerifyDialog();
                    },
                  },
                });
              }
            }
          });
        }
        break;
      case 2051:
      case 2052:
        this.popupService.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'warn',
            content: this.localeService.getValue('not_ava'),
            buttons: [{ text: this.localeService.getValue('online_cs'), primary: true }],
            description: this.localeService.getValue('kyc_error01'),
            callback: () => {
              this.appService.toOnLineService$.next(true);
            },
          },
        });
        break;
      default:
        break;
    }
  }

  /**
   * kyc等级状态
   * 初级：1 ==> primaryVerificationStatus
   * 中级：2 ==> intermediateVerificationStatus
   * 高级：3 ==> advancedVerificationStatus
   *
   * @param statusInfor kyc信息
   * status I:去认证
   * status P:审核中
   * status S:通过
   * status D:拒接
   * @param level
   * @returns
   * false:不能打开验证弹出框
   * true:可以打开验证弹出框
   */
  checkKycVaildStatus(statusInfor: UserVerificationForEu, level: number) {
    const levelMap: string[] = [
      '',
      'primaryVerificationStatus',
      'intermediateVerificationStatus',
      'advancedVerificationStatus',
    ];
    const current = levelMap[level];
    const matchItem = statusInfor[current];
    return matchItem !== 'P' && matchItem !== 'S';
  }

  /**提示弹框 */
  statusNoticePopup() {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('rem'),
        buttons: [{ text: this.localeService.getValue('sure_btn'), primary: false }],
        description: this.localeService.getValue('status_notice'),
        callback: () => {
          return;
        },
        closeIcon: true,
      },
      disableClose: false,
    });
  }
}
