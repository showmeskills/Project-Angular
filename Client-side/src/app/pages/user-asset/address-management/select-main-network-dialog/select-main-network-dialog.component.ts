import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NwList } from '../add-address-dialog/add-address-dialog.component';

@Component({
  selector: 'app-select-main-network-dialog',
  templateUrl: './select-main-network-dialog.component.html',
  styleUrls: ['./select-main-network-dialog.component.scss'],
})
export class SelectMainNetworkDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<unknown>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      data: NwList[];
      address: string;
    },
  ) {}

  ngOnInit() {}

  handleSelect(item: NwList) {
    if (!this.checkVaild(item)) return;
    this.dialogRef.close(item);
  }
  /**
   * 確認地址與網路是否匹配
   *
   * @param item
   * @returns boolean
   */
  checkVaild(item: NwList) {
    if (!this.data.address) return true;
    return new RegExp(item.regExp).test(this.data.address);
  }
}
