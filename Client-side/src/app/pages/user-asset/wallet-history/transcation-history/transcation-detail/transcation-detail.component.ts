import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-transcation-detail',
  templateUrl: './transcation-detail.component.html',
  styleUrls: ['./transcation-detail.component.scss'],
})
export class TranscationDetailComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TranscationDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { callback: DialogDataSubmitCallback<any>; item: any }
  ) {}

  ngOnInit() {}

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    this.data.callback(this.data.item);
  }
}
