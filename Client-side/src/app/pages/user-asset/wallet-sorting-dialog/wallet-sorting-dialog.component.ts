import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocaleService } from 'src/app/shared/service/locale.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-wallet-sorting-dialog',
  templateUrl: './wallet-sorting-dialog.component.html',
  styleUrls: ['./wallet-sorting-dialog.component.scss'],
})
export class WalletSortingDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<WalletSortingDialogComponent>,
    private localeService: LocaleService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ishideSmallAmount: boolean;
      callback: (data: any) => void;
      hideMinAmount: (hide: boolean) => void;
    }
  ) {}

  ishideSmallAmount: boolean = false;

  optionsConfig = [
    {
      title: this.localeService.getValue('curr'),
      up: false,
      down: false,
      type: 'currency',
      sortRange: '',
      index: 0,
    },
    {
      title: this.localeService.getValue('all'),
      up: false,
      down: false,
      type: 'number',
      sortRange: 'totalAmount',
      index: 1,
    },
    {
      title: this.localeService.getValue('ava'),
      up: false,
      down: false,
      type: 'number',
      sortRange: 'canUseAmount',
      index: 2,
    },
    {
      title: this.localeService.getValue('in_order'),
      up: false,
      down: false,
      type: 'number',
      sortRange: 'freezeAmount',
      index: 3,
    },
  ];

  ngOnInit() {
    this.ishideSmallAmount = this.data.ishideSmallAmount;
  }

  handleUp(item: any) {
    this.removePreOption();
    item.up = true;
    item.down = false;
    this.data.callback(item);
  }

  handleDown(item: any) {
    this.removePreOption();
    item.down = true;
    item.up = false;
    this.data.callback(item);
  }

  removePreOption() {
    const pre = this.optionsConfig.filter(e => e.up || e.down)[0];
    if (pre) {
      this.optionsConfig[pre.index].down = false;
      this.optionsConfig[pre.index].up = false;
    }
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }
}
