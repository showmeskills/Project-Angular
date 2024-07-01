import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { KycService } from '../kyc.service';

@Component({
  selector: 'app-dialog-message',
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.scss'],
})
export class DialogMessageComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { createTime?: string },
    private kycService: KycService,
    private kycDialogService: KycDialogService
  ) {}

  @HostListener('click', ['$event.target'])
  public onClick(targetElement: any) {
    if (document.body.offsetWidth <= 799) {
      const targetCss = document.getElementsByClassName('cdk-overlay-container');
      targetCss[0].classList.add('kyc-dialog');
    }
  }
  time: string | any = '';
  fromPgae: number = 1; //1:中级验证-账户验证 2:证件信息不符 3:升级审核中（H5：全页面;使用位置：中级&&高级） 4:基础验证成功（H5：全页面） 5:手机号说明
  ngOnInit() {
    if (this.data) {
      this.time = this.data.createTime;
    }
    // 获取当前弹出框需显示内容
    this.kycService.dialogStepSubject.subscribe(x => {
      if (x) {
        this.fromPgae = x;
        if (x == 3 || x == 4) {
        } else {
          this.removeCss();
        }
      }
    });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * 验证弹出框
   */
  openkyc() {
    this.kycDialogService.openVerifyDialog(3);
    this.close();
  }

  removeCss() {
    const targetCss = document.getElementsByClassName('kyc-dialog');
    if (targetCss) {
      const targetCss = document.getElementsByClassName('cdk-overlay-container');
      targetCss[0].classList.remove('kyc-dialog');
    }
  }
}
