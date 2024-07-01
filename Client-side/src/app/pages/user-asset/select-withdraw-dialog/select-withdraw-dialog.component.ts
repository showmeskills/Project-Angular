import { Component, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { DepositTypeInterface } from 'src/app/shared/interfaces/deposit.interface';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { WithdrawService } from '../../withdraw/withdraw.service';

@Component({
  selector: 'app-select-withdraw-dialog',
  templateUrl: './select-withdraw-dialog.component.html',
  styleUrls: ['./select-withdraw-dialog.component.scss'],
})
export class SelectWithdrawDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SelectWithdrawDialogComponent>,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService,
    private kycDialogService: KycDialogService,
    private withdrawService: WithdrawService
  ) {}
  withdrawGroups: DepositTypeInterface[] = [
    {
      id: 1,
      icon: 'digital-wallet',
      name: this.localeService.getValue('wd_crypto'),
      remark: this.localeService.getValue('sto_trade', '{Brand}'),
      router: 'crypto',
    },
    {
      id: 2,
      icon: 'currency-wallet',
      name: this.localeService.getValue('wd_fiat'),
      remark: this.localeService.getValue('tender_to', '{Brand}'),
      router: 'fiat',
    },
  ];
  isLoading: boolean = false;

  /** 用户信息 */
  userInfo = toSignal(this.appService.userInfo$);

  ngOnInit() {}

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  handleSelect(item: DepositTypeInterface) {
    if (!this.userInfo()?.kycGrade && item.id === 1 && this.withdrawService.kycVerifyCryptoWidthdraw) {
      this.kycDialogService.showKycError(null, 1, false);
      return;
    }

    this.router.navigate([this.appService.languageCode, 'withdrawal', item.router]);
    this.close();
  }
}
