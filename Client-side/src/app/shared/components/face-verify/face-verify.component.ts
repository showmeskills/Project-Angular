import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from '../../service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-face-verify',
  templateUrl: './face-verify.component.html',
  styleUrls: ['./face-verify.component.scss'],
  host: {
    '[class.radius]': '!hasToVerify',
  },
})
export class FaceVerifyComponent implements OnInit, OnDestroy {
  constructor(
    private dialogRef: MatDialogRef<FaceVerifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { redirectUrl: string; country: string },
    private layout: LayoutService,
    private router: Router,
    private appService: AppService
  ) {}

  isH5!: boolean;

  /** 是否 展示 验证iframe */
  hasToVerify: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /** 点击确认 */
  onConfirm() {
    if (!this.isH5) {
      this.dialogRef.close();
      return;
    }

    if (this.isH5) {
      if (this.data.country !== 'CHN' || this.data.redirectUrl.indexOf('tencent')) {
        window.open(this.data.redirectUrl, '__blank');
        this.close();
      } else {
        this.hasToVerify = true;
      }
    }
  }

  /** 关闭 弹窗 */
  close() {
    this.dialogRef.close();
    this.router.navigateByUrl(`/${this.appService.languageCode}`);
  }

  ngOnDestroy(): void {
    this.hasToVerify = false;
  }
}
