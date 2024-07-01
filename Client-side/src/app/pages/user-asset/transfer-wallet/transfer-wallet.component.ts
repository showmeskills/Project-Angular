import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, forkJoin, from } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { TranserWalletListParamInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  AllRateData,
  CurrencyData,
  TransferDataList,
  TransferWalletListData,
} from 'src/app/shared/interfaces/wallet.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { UserAssetsService } from '../user-assets.service';
import { WalletTransferComponent } from '../wallet-transfer/wallet-transfer.component';

interface CurrentWalletData extends TransferWalletListData {
  /**总估值（USDT） */
  totalBalance?: number;
}
interface CurrencyBalanceData extends CurrencyData {
  /**当前币种根据汇率算出的USDT估值 */
  exchangedAmount?: number;
}

@UntilDestroy()
@Component({
  selector: 'app-transfer-wallet',
  templateUrl: './transfer-wallet.component.html',
  styleUrls: ['./transfer-wallet.component.scss'],
})
export class TransferWalletComponent implements OnInit {
  constructor(
    private appService: AppService,
    private userAssetsService: UserAssetsService,
    private layout: LayoutService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  loading: boolean = false; //数据加载完成
  isH5!: boolean;
  walletGategory!: string; //游戏钱包category

  currentWallet?: CurrentWalletData;
  allRate!: AllRateData;
  /**当前顶部钱包被选中币种 */
  currentWalletCurrency: string = '';

  loadingWalletInfo: boolean = true;
  btnGroup = [
    { name: 'trans', isActive: true, page: 'transfer' },
    { name: 'trans_history', isActive: false, page: 'history' },
    { name: 'go_game', isActive: false, page: 'game' }, //enter_game
  ];

  transferDataList: TransferDataList[] = [];

  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  providerId: string = '';

  ngOnInit() {
    //订阅汇率变化
    this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(e => {
      if (!e || Object.keys(e).length < 1) return;
      this.allRate = e;
    });
    //顶部钱包当前币种
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x) this.currentWalletCurrency = x.currency;
    });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    // 订阅路由获取当前钱包类别 && 订阅余额更新
    combineLatest([
      this.route.paramMap.pipe(tap(params => (this.walletGategory = params.get('walletName')!))),
      this.appService.userBalance$.pipe(filter(v => !!v)),
    ])
      .pipe(
        untilDestroyed(this),
        tap(_ => (this.loading = true)),
        switchMap(_ => from(this.userAssetsService.getWalletList()).pipe(untilDestroyed(this)))
      )
      .subscribe((walletList: TransferWalletListData[]) => {
        this.currentWallet = walletList.find(e => e.category === this.walletGategory);
        if (this.currentWallet) {
          if (this.currentWallet.isFirst) {
            //该账户没有激活，回到总览并打开划转
            this.backToOverview();
            this.openTransferWalletDialog();
          } else {
            this.providerId = this.currentWallet.providerId;
            this.getGameWalletBalance();
            this.getWalletInforList();
          }
        } else {
          //不正确的路由,回到总览
          this.backToOverview();
        }
      });
  }

  backToOverview() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/wallet/overview`);
  }

  //当前顶部钱包币种汇率转换
  afterRate(v: number = 0, currency: string) {
    if (!this.allRate) return 0;
    const rateItem = this.allRate?.rates?.find(x => x?.currency === currency);
    if (!rateItem) return 0;
    return v.divide(rateItem.rate);
  }

  //获取当前游戏钱包实时余额
  getGameWalletBalance() {
    if (!this.currentWallet) return;

    const getList = this.currentWallet.currencies.map(x => {
      return this.userAssetsService.getTransferWalletBalance(this.providerId, x.currency);
    });

    forkJoin(getList).subscribe(resArr => {
      this.currentWallet!.currencies.forEach((x: CurrencyBalanceData, i) => {
        const res = resArr[i];
        if (res) {
          const balance = res.totalBalance;
          x.balance = balance;
          x.exchangedAmount = Number(balance).subtract(res.rate);
        }
      });
      this.currentWallet!.totalBalance = this.currentWallet!.currencies.reduce((a, b: CurrencyBalanceData) => {
        return a.add(b.exchangedAmount);
      }, 0);
      this.loading = false;
    });
  }

  //钱包转划列表
  async getWalletInforList() {
    this.loadingWalletInfo = true;
    const param: TranserWalletListParamInterface = {
      providerId: this.providerId,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    const callback = await this.userAssetsService.getTransWalletList(param);
    if (callback) {
      const { total, list } = callback;
      this.paginator.total = total;
      this.transferDataList = list;
    }
    this.loadingWalletInfo = false;
  }

  handleClick(item: any, providerCategory: number) {
    if (item.page == 'history') {
      this.router.navigate([this.appService.languageCode, 'wallet', 'history', 'deposit']);
    } else if (item.page == 'game') {
      if (this.walletGategory === 'AGSlot') {
        if (providerCategory === 4) {
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/games/${this.providerId}-${providerCategory}/0`
          );
        }
        if (providerCategory === 5) {
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/provider/${this.providerId}-${providerCategory}`
          );
        }
      } else if (this.walletGategory === 'GPIChess' || this.walletGategory === 'FCHunter') {
        this.router.navigateByUrl(
          `/${this.appService.languageCode}/casino/provider/${this.providerId}-${providerCategory}`
        );
      } else if (this.walletGategory === 'Baison') {
        if (providerCategory === 6) {
          //casino/games/Baison-6/1000
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/games/${this.providerId}-${providerCategory}/1000`
          );
        }
        if (providerCategory === 5) {
          //casino/provider/Baison-5
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/provider/${this.providerId}-${providerCategory}`
          );
        }
      } else {
        this.router.navigateByUrl(`/${this.appService.languageCode}/play/${this.providerId}-${providerCategory}`);
      }
    } else {
      this.openTransferWalletDialog();
    }
  }

  //划转弹出框
  openTransferWalletDialog() {
    this.dialog.open(WalletTransferComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: {
        category: this.walletGategory,
      },
    });
  }
}
