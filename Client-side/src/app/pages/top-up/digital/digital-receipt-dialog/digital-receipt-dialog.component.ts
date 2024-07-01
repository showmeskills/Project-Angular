import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocaleService } from 'src/app/shared/service/locale.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-digital-receipt-dialog',
  templateUrl: './digital-receipt-dialog.component.html',
  styleUrls: ['./digital-receipt-dialog.component.scss'],
})
export class DigitalReceiptDialogComponent implements OnInit {
  constructor(
    private localeService: LocaleService,
    public dialogRef: MatDialogRef<DigitalReceiptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { callback: DialogDataSubmitCallback<any>; item: any; type: string }
  ) {}
  time: string = '';
  header: string = '';
  typeName: string = '';

  ngOnInit() {
    if (this.data.type == 'digital') {
      this.header = this.localeService.getValue(`dep_det`);
      this.typeName = this.localeService.getValue(`recharge_num00`);
    } else {
      this.header = this.localeService.getValue(`withdraw_d`);
      this.typeName = this.localeService.getValue(`withdraw_n`);
    }
    // const iniDa = new Date(this.data.item.date);
    // this.time = moment(new Date(iniDa)).format("YYYY-MM-DD");
  }
  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    this.data.callback(this.data.item);
  }
}
