import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styleUrls: ['./result-dialog.component.scss'],
})
export class ResultDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data:
      | {
          callback: DialogDataSubmitCallback<any>;
          status: string;
          fromWallet: string;
          toWallet: string;
          date: number;
          orderId: string;
          amount: string;
          curreny: string;
        }
      | undefined
  ) {}

  ngOnInit(): void {}

  /**
   * 关闭弹窗
   */
  // enter键操作
  @HostListener('document:keydown.enter', ['$event'])
  close(): void {
    this.dialogRef.close();
  }
}
