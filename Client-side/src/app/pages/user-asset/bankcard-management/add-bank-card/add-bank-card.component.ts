import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { BankCardApi } from 'src/app/shared/apis/bank-card.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { AddBankCardPost, VerifyInfoParams } from 'src/app/shared/interfaces/bank-card.interface';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { SelectBankDialogComponent } from '../select-bank-dialog/select-bank-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-add-bank-card',
  templateUrl: './add-bank-card.component.html',
  styleUrls: ['./add-bank-card.component.scss'],
})
export class AddBankCardComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<AddBankCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private bankCardApi: BankCardApi,
    private dialog: MatDialog,
    private toast: ToastService,
    private general2faverifyService: General2faverifyService,
    private localeservice: LocaleService
  ) {}

  name: string = ''; //用户kyc认证姓名
  selectedBank: any; //选择银行卡
  selectedCurrency: any; //选择币种
  /** 用户卡号 */
  userBankCard: string = '';
  isBankOpen: boolean = false; //银行选项列表开启
  isOpen: boolean = false; //币种选项列表开启
  /** 用户卡号是否验证通过 */
  bankCardIsValid!: boolean;

  /** 输入银行卡号验证 */
  verifyBankCard$: Subject<VerifyInfoParams> = new Subject();

  /** 银行卡验证loading */
  verifyLoading: boolean = false;

  ngOnInit() {
    this.name = this.data.kycName;

    this.verifyBankCard$
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(),
        tap(() => (this.verifyLoading = true)),
        switchMap(v => this.bankCardApi.getBankCardVerifyInfo(v))
      )
      .subscribe(res => {
        this.verifyLoading = false;
        if (res?.data) {
          this.selectedBank = {
            bankCode: res.data?.bankCode || '',
            bankNameEn: res.data?.bankNameEn || '',
            bankNameLocal: res.data?.bankNameLocal || '',
            isSelected: true,
          };
        } else {
          this.selectedBank = null;
        }
      });
  }

  //选择币种
  handleSelectCurrencyType() {
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: { isDigital: false },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.getCurrencyDialogCallBack(result);
      });
  }

  getCurrencyDialogCallBack(callback: any) {
    this.selectedCurrency = callback;
    this.onBankCardInput();
  }

  //选择银行卡
  showBankOptions() {
    if (!this.selectedCurrency?.currency) return;
    this.dialog.open(SelectBankDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: this.getBankDialogCallBack.bind(this),
        currency: this.selectedCurrency.currency,
      },
    });
  }

  getBankDialogCallBack(callback: any) {
    this.selectedBank = callback;
    if (this.checkCardNumberValidate(this.userBankCard)) {
      this.bankCardIsValid = true;
    } else {
      this.bankCardIsValid = false;
    }
  }

  //Enter事件保存
  save() {
    if (!this.canSubmit()) return;
    //2fa认证
    this.general2faverifyService.launch('AddBankCard').subscribe(res => {
      if (res.status) this.addBankCard(res.key);
    });
  }

  //添加请求
  async addBankCard(key: string) {
    const post: AddBankCardPost = {
      currencyType: this.selectedCurrency.currency,
      name: this.name,
      bankCode: this.selectedBank.bankCode,
      cardNum: this.userBankCard,
      key: key,
    };

    const result = await firstValueFrom(this.bankCardApi.addBankCard(post));
    this.dialogRef.close(result.success);
    this.toast.show({
      message: result?.success
        ? this.localeservice.getValue('add_card_s')
        : result.code === '1002'
        ? this.localeservice.getValue('card_exist')
        : this.localeservice.getValue('addbank_f'),
      type: result?.success ? 'success' : 'fail',
    });
  }

  checkCardNumberValidate(userBankCard: string): boolean {
    /** 正常卡 8 - 30 位 */
    const carcCheck = userBankCard.length > 7 && userBankCard.length < 31 && /^[0-9]*$/.test(userBankCard);

    /** VND盾 ACB 银行 5 - 9 位 */
    const vndAcbBank = userBankCard.length > 4 && userBankCard.length < 10 && /^[0-9]*$/.test(userBankCard);

    switch (this.selectedBank?.bankCode) {
      case 'ACB':
        return vndAcbBank;
      default:
        return carcCheck;
    }
  }

  /**
   * 用户规则验证
   *
   * @param element 用户银行卡输入框
   */
  onBankCardInput() {
    const userBankCard = String(this.userBankCard).replace(/ /g, '');

    if (this.checkCardNumberValidate(userBankCard)) {
      //从验证需要api获取验证
      this.bankCardIsValid = true;
      this.verifyBankCard$.next({
        currencyType: this.selectedCurrency.currency,
        cardNum: this.userBankCard,
      });
    } else {
      this.bankCardIsValid = false;
    }
  }

  /**
   * 注册按钮是否可以点击
   */
  canSubmit(): boolean {
    if (
      this.selectedCurrency != null &&
      this.selectedBank != null &&
      this.userBankCard &&
      !this.verifyLoading &&
      this.bankCardIsValid
    ) {
      return true;
    }
    return false;
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }
}
