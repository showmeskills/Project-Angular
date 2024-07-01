import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { PhoneNumberService } from '../../service/phone-number-validation';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@UntilDestroy()
@Component({
  templateUrl: './auth-prompt.component.html',
  styleUrls: ['./auth-prompt.component.scss'],
})
export class AuthPromptComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dailog: MatDialogRef<AuthPromptComponent>,
    private appService: AppService,
    private phoneNumberService: PhoneNumberService
  ) {
    dailog.disableClose = false;
  }

  isCorrect = false;
  /** 用户输入的后六位手机号 */
  inputPhoneNum = '';
  /** 当前手机号 */
  phoneNum: string = '';
  /** 当前手机区号 */
  currentPhoneZone = '';
  /**展示错误*/
  showError = false;
  ngOnInit(): void {
    // 获取用户信息
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      if (!x) return;
      if (x.mobile != null) {
        this.phoneNum = x.mobile;
      }
    });
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x)
      )
      .subscribe(x => {
        this.currentPhoneZone = x.areaCode;
      });

    if (this.data?.phoneNum) this.phoneNum = this.data.phoneNum;
    if (this.data?.currentPhoneZone) this.currentPhoneZone = this.data.currentPhoneZone;

    console.log('in authPromot:', this.phoneNum, this.currentPhoneZone);
  }

  // 關閉
  dismiss() {
    const index = this.phoneNum.indexOf('*');
    //获取*之前号码
    const firstPart = this.phoneNum.substring(0, index);
    //拼接完整手机号
    const fullPhoneNumber = `${firstPart}${this.inputPhoneNum}`;
    const isVaild = this.phoneNumberService.checkVaild(fullPhoneNumber, this.currentPhoneZone);
    if (!isVaild) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.dailog.close(fullPhoneNumber);
    return;
  }

  /**
   * 輸入中
   *
   * @param code
   */
  onCodeChanged(code: string) {
    this.inputPhoneNum = code;
    if (this.inputPhoneNum.length < 6) {
      this.isCorrect = false;
    }
  }

  /**
   * 輸入完畢
   *
   * @param code
   */
  onCodeCompleted(code: string) {
    this.inputPhoneNum = code;
    if (this.inputPhoneNum.length == 6) {
      this.isCorrect = true;
    }
  }

  //取消
  close() {
    this.dailog.close('CLOSE');
  }
}
