import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SelectDepositBonusService } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.service';
import { PaymentIqService } from '../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { SelectTopUpDialogComponent } from '../user-asset/select-top-up-dialog/select-top-up-dialog.component';

@Injectable({ providedIn: 'root' })
export class TopUpGuard {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private appService: AppService,
    private piqService: PaymentIqService,
    private selectDepositBonusService: SelectDepositBonusService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const tree = state.url.split('/');

    if (tree[tree.length - 2] === 'deposit') {
      if (typeof this.appService.userInfo$.value?.isEurope === 'boolean') {
        if (this.appService.userInfo$.value?.isEurope && this.selectDepositBonusService.switchEuBonusFlow) {
          if (!this.piqService.allowRoute()) {
            if (this.piqService.selectDepositMethod() === 'fiat') {
              this.piqService.checkKycForPaymentIq();
            } else if (this.piqService.selectDepositMethod() === 'crypto') {
              this.piqService.checkKycForCrypto();
            }
          }
          return this.piqService.allowRoute();
        } else {
          return true;
        }
      } else {
        return this.router.createUrlTree([this.appService.languageCode]);
      }
    }

    //路由是直接进入子页面的，不用选择
    if (tree[tree.length - 1] === 'deposit#choose') {
      this.topUpDialog('/coupon');
      return false;
    }

    // 法币直接前往充值，数字货币显示选择弹窗
    if (this.appService.currentCurrency$.value) {
      if (this.appService.currentCurrency$.value.isDigital) {
        this.topUpDialog();
      } else {
        return this.router.createUrlTree([this.appService.languageCode, 'deposit', 'fiat']);
      }
    } else {
      return this.router.createUrlTree([this.appService.languageCode]);
    }

    return false;
  }

  topUpDialog(turnTo?: string) {
    this.dialog
      .open(SelectTopUpDialogComponent, { panelClass: 'single-page-dialog-container' })
      .afterClosed()
      .subscribe(state => {
        if (state === 'icon' && turnTo) {
          this.router.navigateByUrl(`${this.appService.languageCode}${turnTo}`);
        }
      });
  }
}
