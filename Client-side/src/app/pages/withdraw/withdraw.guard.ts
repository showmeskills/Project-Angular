import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SelectWithdrawDialogComponent } from '../user-asset/select-withdraw-dialog/select-withdraw-dialog.component';

@Injectable({ providedIn: 'root' })
export class WithdrawGuard  {
  constructor(private dialog: MatDialog) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const tree = state.url.split('/');
    if (tree[tree.length - 2] === 'withdrawal') return true; //路由是直接进入子页面的，不用选择
    this.withdrawDialog();
    return false;
  }

  withdrawDialog() {
    this.dialog.open(SelectWithdrawDialogComponent, {
      panelClass: 'single-page-dialog-container',
    });
  }
}
