import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { StandardPopupModule } from 'src/app/shared/components/standard-popup/standard-popup.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { UserAssetsService } from '../user-assets.service';

@Component({
  selector: 'app-clear-bonus',
  standalone: true,
  imports: [CommonModule, StandardPopupModule, PipesModule],
  templateUrl: './clear-bonus.component.html',
  styleUrls: ['./clear-bonus.component.scss'],
})
export class ClearBonusComponent implements OnInit {
  constructor(
    private appService: AppService,
    private walletApi: WalletApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private userAssetsService: UserAssetsService,
    private dialogRef: MatDialogRef<ClearBonusComponent>
  ) {}

  totalBonus: number = 0;
  loadingTotal: boolean = true;

  /** 非粘性 */
  totalNonStickyBonus: number = 0;

  async ngOnInit() {
    const walletData = await this.userAssetsService.getWalletInfor();
    this.loadingTotal = false;
    if (walletData) {
      this.totalBonus = walletData.totalBonus;
      this.totalNonStickyBonus = walletData.totalNonStickyBonus || 0;
    }
  }

  cancels = () => {
    this.dialogRef.close(false);
  };

  clearBonus = (loading$: Subject<boolean>) => {
    this.dialogRef.disableClose = true;
    loading$.next(true);
    this.walletApi.clearCredit().subscribe(async data => {
      loading$.next(false);
      if (data?.data) {
        this.dialogRef.close(true);
        this.toast.show({ message: this.localeService.getValue('bonus_success'), type: 'success' });
        const userbalance = await this.userAssetsService.getUserbalance();
        this.appService.userBalance$.next(userbalance);
      } else {
        // 2137 用户非粘性清理失败提示
        if (data?.code === '2137') {
          this.toast.show({ message: data?.message || '', type: 'fail' });
        } else {
          this.toast.show({ message: this.localeService.getValue('bonus_fail'), type: 'fail' });
        }
        this.dialogRef.disableClose = false;
      }
    });
  };
}
