import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { BankCardApi } from 'src/app/shared/apis/bank-card.api';
import { SystemBankCard } from 'src/app/shared/interfaces/bank-card.interface';

export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-select-bank-dialog',
  templateUrl: './select-bank-dialog.component.html',
  styleUrls: ['./select-bank-dialog.component.scss'],
})
export class SelectBankDialogComponent implements OnInit {
  constructor(
    private bankApi: BankCardApi,
    public dialogRef: MatDialogRef<SelectBankDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: DialogDataSubmitCallback<any>;
      currency: string;
    }
  ) {}
  @ViewChild('iSearch', { static: false }) private searchElement!: ElementRef;
  searchBank: string = '';
  newAllBankData: any = [];
  bankCardData: SystemBankCard[] = [];
  /** 是否加载中 */
  isLoading: boolean = true;
  /** 银行卡选择数据缓存 */
  static bankCacheData: any = {};

  async ngOnInit() {
    const result =
      SelectBankDialogComponent.bankCacheData[this.data.currency] ??
      (await firstValueFrom(this.bankApi.getSystemBank(this.data.currency)));
    if (result?.data) {
      SelectBankDialogComponent.bankCacheData[this.data.currency] = result;
      this.isLoading = false;
      this.bankCardData = result.data;
    }
  }

  filter(card: SystemBankCard[]): SystemBankCard[] {
    const s = this.searchBank.trim().toLowerCase();
    return card.filter(x => {
      return x.bankNameLocal.indexOf(s) !== -1;
    });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }
  /**
   * Input Focus事件
   *
   * @param element
   */
  onFocus(element: any) {
    element.isFocus = true;
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlur(element: any) {
    //延迟200MS，防止clear无法点击
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }
  /**
   * 清除输入框的内容
   *
   * @param element
   */
  handleClean(element: any) {
    element.value = '';
    element.focus();
    element.dispatchEvent(new InputEvent('input'));
    if (element.timer) {
      clearTimeout(element.timer);
    }
  }

  /**
   * 搜索
   *
   * @param element 搜索
   */
  onSearchInput(element: any) {
    element.isValid = false;
  }

  //选择
  handleSelect(item: any) {
    item.isSelected = !item.isSelected;
    this.data.callback(item);
    this.close();
  }
}
