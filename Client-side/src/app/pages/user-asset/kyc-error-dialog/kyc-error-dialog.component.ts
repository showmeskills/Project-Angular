import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-kyc-error-dialog',
  templateUrl: './kyc-error-dialog.component.html',
  styleUrls: ['./kyc-error-dialog.component.scss'],
})
export class KycErrorDialogComponent implements OnInit {
  constructor(
    private kycDialogService: KycDialogService,
    public dialogRef: MatDialogRef<KycErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { callback: DialogDataSubmitCallback<any>; message: string; errorCode: number }
  ) {}

  ngOnInit() {
    this.dialogRef.disableClose = false;
  }
  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  toKycVerify(): void {
    // this.router.navigate([this.appService.languageCode, 'userCenter', 'kyc'], { fragment: 'open' });
    this.kycDialogService.openPrimaryVerifyDialog();
    this.close();
  }
}
