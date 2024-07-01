import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
})
export class ErrorDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { callback: DialogDataSubmitCallback<any>; errorCode: string; errorMsg?: string },
    private kycDialogService: KycDialogService,
    private localeSerivce: LocaleService
  ) {}

  title: string = this.localeSerivce.getValue('hint');
  message: string = '';
  submitTxt: string = this.localeSerivce.getValue('verification');

  ngOnInit() {
    console.log('error code---->', this.data.errorCode);
    switch (this.data.errorCode) {
      case '2048':
        this.message = this.localeSerivce.getValue('unsupp_pay'); //需要跟后端和pm确认此处逻辑，暂时显示api回传信息
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
      case '2049': // 2049 支付方式不可用
        this.title = this.localeSerivce.getValue('unavai_pay');
        this.message = this.localeSerivce.getValue('sent_abc');
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
      case '2050':
        this.title = this.localeSerivce.getValue('safety_rem00');
        this.message = this.localeSerivce.getValue('sent_abcd');
        break;
      case '2051':
        this.message = this.localeSerivce.getValue('sent_ab');
        this.submitTxt = this.localeSerivce.getValue('online_cs');
        break;
      case '2052':
        this.title = this.localeSerivce.getValue('unavai_pay');
        this.message = this.localeSerivce.getValue('sent_abc'); //此处地区需要完善，
        this.submitTxt = this.localeSerivce.getValue('online_cs');
        break;
      case '2061':
        this.message = this.localeSerivce.getValue('sent_abe'); //此处错误来自 法币存款请求api返回的错误
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
      case '2053': //后端不返回,只是合并错误弹窗
        this.title = this.localeSerivce.getValue('sent_abe');
        this.message = this.localeSerivce.getValue('sent_abf');
        break;
      case '2038': //数字货币地址错误
        this.message = this.localeSerivce.getValue('sent_abg'); //此处错误来自 法币存款请求api返回的错误
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
      case '2060':
        this.message = this.localeSerivce.getValue('sent_abh'); //此处错误来自 法币存款请求api返回的错误
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
      case '2044':
        this.message = String(this.data.errorMsg); //此处错误来自 法币存款请求api返回的错误
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
      case '2042':
        this.message = String(this.data.errorMsg); //此处错误来自 法币存款请求api返回的错误
        this.submitTxt = this.localeSerivce.getValue('i_ha_kn00');
        break;
    }

    //	2048,支付方式不支持该币种
    //  2049,支付方式不可用
    //  2050,kyc 验证等级不够
    //  2051,kyc 验证名字不符合
    //  2052,kyc 验证地区不符合
    //  2053,kyc verify超过额度
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    this.data.callback(false);
  }
  //认证 or go to customer service
  toKycVerify(type: string): void {
    if (type == '去认证') {
      //跳转kyc页面
      //this.router.navigate([this.appService.languageCode, 'userCenter', 'kyc'], { fragment: 'open' });
      this.kycDialogService.openPrimaryVerifyDialog();
    } else if (type == '在线客服') {
    }
    this.close();
  }
}
