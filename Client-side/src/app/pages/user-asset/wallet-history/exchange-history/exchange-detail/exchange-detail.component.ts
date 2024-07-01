import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-exchange-detail',
  templateUrl: './exchange-detail.component.html',
  styleUrls: ['./exchange-detail.component.scss'],
})
export class ExchangeDetailComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ExchangeDetailComponent>,
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
