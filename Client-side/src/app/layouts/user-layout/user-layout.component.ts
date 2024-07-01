import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { WalletTransferComponent } from 'src/app/pages/user-asset/wallet-transfer/wallet-transfer.component';
import { MenuItem, UserCenterMenu, userAssetsMenu } from 'src/app/pages/user-center/left-menu.config';
import { WithdrawService } from 'src/app/pages/withdraw/withdraw.service';
import { PaymentIqService } from 'src/app/shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit {
  menuConfig!: MenuItem[];
  menusVisible: boolean = true;

  constructor(
    private layout: LayoutService,
    private dialog: MatDialog,
    private withdrawService: WithdrawService,
    private appService: AppService,
    private piqService: PaymentIqService,
  ) {}

  ngOnInit() {
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(e => this.onPageChange(e));

    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((x: AccountInforData | null) => {
      const userInfo = x ?? ({} as any);

      // 判断国家开启自我约束功能
      UserCenterMenu.forEach(e => {
        if (e.showOnlyCountry && (userInfo?.areaCode == '+599' || this.appService.countryCode == 'CW')) {
          e.showOnlyCountry = false;
        }
      });
    });
  }

  onPageChange(_: any) {
    const componentTree = this.layout.getComponentTree();
    // 安全中心、Kyc 都不显示导航
    this.menusVisible =
      componentTree.find(x => x._componentName == 'AccountSafetyComponent') ||
      componentTree.find(x => x._componentName == 'KycComponent')
        ? false
        : true;
    //判断切换导航数据
    this.menuConfig = componentTree.find(x => x._componentName == 'UserAssetsComponent')
      ? userAssetsMenu
      : UserCenterMenu;
  }

  clickItem(item: MenuItem) {
    if (item.icon === 'duihuan') {
      //打开划转窗口
      this.dialog.open(WalletTransferComponent, {
        disableClose: true,
        autoFocus: false,
        panelClass: 'custom-dialog-container',
        data: {
          category: 'Main',
        },
      });
    }

    if (item.icon === 'chongzhi') {
      this.piqService.allowRoute.set(false);
    }
  }

  getRouterLinkActive(target: any) {
    return !target.page || target.children ? '' : 'active';
  }

  getRouterLink(page: string) {
    if (page) {
      return `/${this.appService.languageCode}/` + page;
    } else {
      return null;
    }
  }
}
