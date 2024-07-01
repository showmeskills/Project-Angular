import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectTopUpDialogComponent } from 'src/app/pages/user-asset/select-top-up-dialog/select-top-up-dialog.component';
@Component({
  selector: 'orignal-dialog-top-up',
  templateUrl: './dialog-top-up.component.html',
  styleUrls: ['./dialog-top-up.component.scss'],
})
export class dialogTopUpComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<dialogTopUpComponent>, private dialog: MatDialog) {}

  ngOnInit() {}

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  open() {
    this.dialogRef.close();
    this.dialog.open(SelectTopUpDialogComponent, {
      panelClass: 'single-page-dialog-container',
    });
  }
}
