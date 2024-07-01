import { Component, OnInit } from '@angular/core';
import { KycService } from '../kyc.service';
import { MatDialogRef } from '@angular/material/dialog';
import { BankCardsUtils } from 'src/app/shared/service/bankCard';

@Component({
  selector: 'app-bank-cards-options-dialog',
  templateUrl: './bank-cards-options-dialog.component.html',
  styleUrls: ['./bank-cards-options-dialog.component.scss'],
})
export class BankCardsOptionsDialogComponent implements OnInit {
  constructor(
    private bankCardUtils: BankCardsUtils,
    private kycService: KycService,
    public dialogRef: MatDialogRef<BankCardsOptionsDialogComponent>
  ) {}

  sectionRefs: any = {};
  bankCardLists: any = {};
  bankCardKeys: any = []; //全部银行卡key
  selectedKey: any; //选中的key
  ngOnInit() {
    this.bankCardLists = this.bankCardUtils.BANKS;
    this.bankCardKeys = Object.keys(this.bankCardLists);
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * 点击首字母选择
   *
   * @param event
   */
  handleAlphabetSelect(event: any) {
    const elemId = event.target.id;
    const targetDom = document.getElementById(elemId) as HTMLElement;
    targetDom.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy() {
    //离开页面返回 中级验证中国区弹出框
    this.kycService.showMidChinaPage.next(true);
  }

  handelBankSelect(item: any) {
    console.log(item);
    item.checked = !item.checked;
    this.kycService.bankCardSubject.next(item.value);
    this.close();
  }
}
