import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'orignal-jackport',
  templateUrl: './jackport.component.html',
  styleUrls: ['./jackport.component.scss'],
})
export class JackportComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<JackportComponent>) {}

  ngOnInit(): void {}

  /** 关闭弹窗 */
  close() {
    this.dialogRef.close();
  }
}
