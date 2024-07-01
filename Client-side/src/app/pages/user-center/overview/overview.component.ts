import { Component, DestroyRef, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexTooltip,
} from 'ng-apexcharts';
import { Subject, combineLatest, of, timer } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { VipApi } from 'src/app/shared/apis/vip.api';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { TranserWalletBalanceParamInterface } from 'src/app/shared/interfaces/deposit.interface';
import { RecentTransactionsData } from 'src/app/shared/interfaces/gameorder.interface';
import { KycStatus, ProcessDetailForEu, UserVerificationForEu } from 'src/app/shared/interfaces/kyc.interface';
import { UserVipData, VipDetailListData } from 'src/app/shared/interfaces/vip.interface';
import { AllRateData, OverviewWallet, TransferwWallet } from 'src/app/shared/interfaces/wallet.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { KycService } from '../../kyc/kyc.service';
import { DealRecordService } from '../../record/deal-record/deal-record.service';
import { UserAssetsService } from '../../user-asset/user-assets.service';
import { WalletTransferComponent } from '../../user-asset/wallet-transfer/wallet-transfer.component';

/**
 * 统计表属性
 */
export class PieChartOptions {
  series: ApexNonAxisChartSeries = [];
  chart: ApexChart = {
    type: 'line',
  };
  responsive: ApexResponsive[] = [];
  labels: any;
  dataLabels: ApexDataLabels = {};
  plotOptions: ApexPlotOptions = {};
  legend: ApexLegend = {};
  colors: string[] = [];
  states: ApexStates = {};
  tooltip: ApexTooltip = {};
  stroke: any;
}
interface DefaultColor {
  color: string;
  currency: string;
}
@UntilDestroy()
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  constructor(
    private walletApi: WalletApi,
    private historyApi: HistoryApi,
    public kycService: KycService,
    private router: Router,
    private appService: AppService,
    private dialog: MatDialog,
    private layout: LayoutService,
    private helpCenterApi: HelpCenterApis,
    private currencyValuePipe: CurrencyValuePipe,
    private vipApi: VipApi,
    private dealRecordService: DealRecordService,
    private userAssetsService: UserAssetsService,
    private bounsApi: BonusApi,
    private localeService: LocaleService,
    private kycApi: KycApi,
    private destroyRef: DestroyRef,
    private piqService: PaymentIqService,
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
      this.openChart = false;
    });

    //监听币种切换、钱包余额变动
    combineLatest([
      this.appService.currentCurrency$,
      this.appService.userBalance$.pipe(filter(x => !!x)),
      this.userAssetsService.allRate,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(async ([currentCurrency, _, allRatesData]) => {
        this.isLoading = true;

        //准备汇率和当前选择币种
        this.currentWalletCurrency = currentCurrency.currency;
        const allRates: any = this.userAssetsService.getRatesBaseCurrency(allRatesData, this.currentWalletCurrency);
        if (allRates?.baseCurrency) this.allRate = allRates;

        //准备钱包总览的数据
        const walletViewData = await this.userAssetsService.getWalletInfor();

        if (walletViewData) {
          //重置
          this.selectedIndex = 0;
          this.walletArr = [];

          this.walletArr.push({
            label: this.localeService.getValue('main_acc'),
            walletInfo: walletViewData.overviewWallet,
          });

          //默认先创建主账户的饼图 selectedIndex 0
          this.onCreatePieChart();

          //准备转账制钱包数据
          walletViewData.transferWallet.forEach(async (item: TransferwWallet) => {
            if (!item.isFirst) {
              const balanceInfo = await this.getGameWalletBalance(item);
              this.walletArr.push({
                label: this.localeService.getValue(item.category),
                walletInfo: {
                  ...item,
                  ...balanceInfo,
                },
              });
            }
          });
        }
      });
  }

  isH5!: boolean;
  selectedIndex: number = 0;
  pieChart!: PieChartOptions;
  walletArr: any[] = [];
  serverCurrency: string = 'USDT'; // 接口的总资产默认币种
  walletTotalBalanceByRate!: string;
  chartReady!: boolean;
  openChart: boolean = false;
  hideAssetsValue: boolean = false; //隐藏数据
  whenHideValue: string = '*****';
  rebootChart$: Subject<boolean> = new Subject();
  allRate!: AllRateData;
  currentWalletCurrency!: string; //当前顶部钱包被选中币种

  defaultColor: DefaultColor[] = [
    { color: 'rgba(39, 117, 201, 0.8)', currency: 'USDC' },
    { color: 'rgba(235, 10, 41, 0.8)', currency: 'TRX' },
    { color: 'rgba(247, 147, 26, 0.8)', currency: 'BTC' },
    { color: 'rgba(38, 161, 123, 0.8)', currency: 'USDT' },
    { color: 'rgba(98, 126, 234, 0.8)', currency: 'ETH' },
    { color: 'rgba(255, 162, 0, 0.8)', currency: 'CNY' },
    { color: 'rgba(33, 111, 245, 0.8)', currency: 'CAD' },
    { color: 'rgba(45, 169, 234, 0.8)', currency: 'AUD' },
    { color: 'rgba(238, 203, 28, 0.8)', currency: 'EUR' },
    { color: 'rgba(188, 63, 224, 0.8)', currency: 'GBP' },
    { color: 'rgba(6, 194, 130, 0.8)', currency: 'JPY' },
    { color: 'rgba(255, 120, 86, 0.8)', currency: 'THB' },
    { color: 'rgba(33, 111, 245, 0.8)', currency: 'NZD' },
    { color: 'rgba(103, 195, 22, 0.8)', currency: 'USD' },
    { color: 'rgba(22, 75, 195, 0.8)', currency: 'VND' },
    { color: 'rgba(235, 180, 46, 0.8)', currency: 'BUSD' },
    { color: 'rgba(64, 64, 64, 0.8)', currency: 'XRP' },
    { color: 'rgba(186, 159, 51, 0.8)', currency: 'DOGE' },
    { color: 'rgba(240, 5, 0, 0.8)', currency: 'SHIB' },
    { color: 'rgba(29, 29, 29, 0.8)', currency: 'EOS' },
  ];

  newsData: any[] = []; //公告中心数据
  promotData: any[] = []; //促销活动数据
  deviceData: any[] = []; //设备管理数据
  isLoading: boolean = true;
  userInfor: any = {}; //用户信息；
  currenKycStatus: any; //用户当前kyc状态
  deviceLoading: boolean = true;
  chartDisabled: boolean = true;

  vipBenefitList: any[] = []; //vip benefit list
  userVipInfo?: UserVipData; //用户vip信息
  vipSettingInfo?: VipDetailListData; //根据当前用户vip等级返回的信息
  currentVipLevel: number = 0; //当前vip等级
  isSuperVip: boolean = false;
  recentTransactionsData: RecentTransactionsData[] = []; // 最近交易列表
  recentTransactionsLoading: boolean = false; // 最近交易loading
  /**@theme 主题颜色 */
  theme!: string;

  /**用户欧洲kyc信息*/
  userVerificationForEu?: UserVerificationForEu;
  /**非亚洲国家 默认初级前false*/
  isEurope: boolean = false;
  /**kyc中级验证状态 */
  intermediateVerificationStatus: string = '';

  /** 获取kycStatus */
  kycStatus: WritableSignal<Array<KycStatus>> = signal([]);
  kycStatus$ = toObservable(this.kycStatus).pipe(takeUntilDestroyed());

  /** 确认打开 ID 还是 POA */
  idFileStatus: number | null = null;
  poaFileStatus: number | null = null;

  /** 材料状态 loading */
  fileStatusLoading = true;

  /** 检查 piq loading */
  renderPiqCheckedLoading = computed(() => this.piqService.checkedLoading());

  ngOnInit() {
    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.theme = v === 'sun' ? 'light' : 'dark';
    });

    this.layout.resize$.pipe(untilDestroyed(this)).subscribe(_ => this.rebootChart());

    combineLatest([
      this.appService.userInfo$.pipe(filter(v => !!v)),
      this.kycApi.getUserKycStatus(),
      this.appService.vipUserInfo$.pipe(filter(v => !!v)),
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        switchMap(([userInfo, kycStatus, userVipInfo]) => {
          if (userInfo) {
            this.userInfor = userInfo;
            this.isEurope = userInfo?.isEurope;
            if (userVipInfo) {
              this.userVipInfo = userVipInfo;
              if (userInfo?.isSvip) {
                this.currentVipLevel = 10;
              } else {
                this.currentVipLevel = userInfo?.viPGrade ?? 0;
              }
              this.isSuperVip = userInfo?.isSvip;
              this.getVipSetting();
            }
          }

          this.kycStatus.set(kycStatus);
          const currentKycStatus = this.kycService.checkUserKycStatus(kycStatus);

          if (currentKycStatus) {
            this.currenKycStatus = {
              ...currentKycStatus,
              kycStatusName: ['verification', 'primary', 'intermediate', 'advanced'][currentKycStatus.level],
            };
          }

          if (currentKycStatus.level > 0 && this.isEurope && this.kycService.getSwitchEuKyc) {
            this.kycApi.getQueryUserVerificationForEu().subscribe(userVerificationForEu => {
              if (userVerificationForEu) {
                this.userVerificationForEu = userVerificationForEu;
                this.poaFileStatus = userVerificationForEu?.poaFileStatus;
                this.idFileStatus = userVerificationForEu?.idFileStatus;
              }
            });
          }

          // 过了初级之后 再触发
          if (currentKycStatus.level > 0) {
            return of(Boolean(this.isEurope && this.kycService.getSwitchEuKyc));
          }
          return of(null);
        }),
        switchMap(isEurope => {
          if (typeof isEurope === 'boolean') {
            if (isEurope && this.kycStatus()[1]) {
              return this.kycApi.postProcessdDetailForEu({ kycType: 1 });
            } else {
              return this.kycStatus$;
            }
          }
          return of(null);
        }),
      )
      .subscribe(data => {
        if (data) {
          const euStatus = data as ProcessDetailForEu;
          if (this.isEurope && euStatus?.userInfo) {
            this.intermediateVerificationStatus = euStatus.userInfo?.intermediateVerificationStatus || '';
          } else {
            const asiaKycStatus = data as Array<KycStatus>;
            this.intermediateVerificationStatus = asiaKycStatus[1]?.status || '';
          }
        }
        this.fileStatusLoading = false;
      });

    this.historyApi.getDevices(1, 10).subscribe(res => {
      this.deviceLoading = false;
      if (res?.data) {
        this.deviceData = res.data.list.slice(0, 3);
      }
    });

    //中心页显示3条公告
    this.helpCenterApi.getHomeArticle({ ClientType: 'Web' }).subscribe(data => {
      this.newsData = data;
    });

    // 促销活动， 先不做接口，取最新活动前4个
    this.bounsApi.getActivityInfo({ equipment: 'Web' }).subscribe(promotData => {
      this.promotData = promotData.list[0]?.list?.slice(0, 4) || [];
    });

    this.getLatelyData();
  }

  async onCreatePieChart() {
    if (this.hideAssetsValue) {
      this.buildChartData([1], ['**** *********'], ['var(--default-border-color)']);
      return;
    }
    const wallet: any = this.walletArr[this.selectedIndex].walletInfo;
    const series: ApexNonAxisChartSeries = [];
    const labels: string[] = [];
    const colors: string[] = [];
    let data: { series: number; labels: string; colors: string }[] = [];
    const currencies: OverviewWallet['currencies'] =
      wallet.category === 'Main' ? wallet.currencies : wallet.currenciesWithBalance;
    currencies.forEach(x => {
      const rate = this.allRate?.rates?.find(v => v.currency === x.currency)?.rate ?? 0;
      const color =
        this.defaultColor.find(v => v.currency === x.currency)?.color ||
        '#' + Math.floor(Math.random() * (2 << 23)).toString(16);
      data.push({
        series: x.balance.subtract(rate),
        labels: `${x.currency} ${this.currencyValuePipe.transform(x.balance, x.currency)}`,
        colors: color,
      });
    });
    if (
      data.length < 1 ||
      data.reduce((a, b) => {
        return a + b.series;
      }, 0) <= 0
    ) {
      //如果无数据，塞入基础数据
      series.push(1);
      labels.push(this.localeService.getValue('no_data'));
      colors.push('var(--default-border-color)');
      this.chartDisabled = true;
    } else {
      this.chartDisabled = false;
      //排序
      data.sort((a, b) => b.series - a.series);

      //是否大于6种
      if (data.length > 6) {
        const other = data.slice(6);
        const otherTotal = {
          series: other.reduce((a, b) => {
            return a + b.series;
          }, 0),
          labels: this.localeService.getValue('other00'),
          colors: 'var(--default-border-color)',
        };
        data = data.slice(0, 6);
        data.push(otherTotal);
      }

      data.forEach(x => {
        series.push(x.series);
        labels.push(x.labels);
        colors.push(x.colors);
      });
    }

    // console.log('-------准备渲染-------', series, '\n', labels, '\n', colors, '\n---------');

    this.buildChartData(series, labels, colors);
    this.isLoading = false;
  }

  buildChartData(series: ApexNonAxisChartSeries, labels: string[], colors: string[]) {
    this.rebootChart();
    this.pieChart = {
      chart: {
        id: 'userAssetsChart',
        type: 'donut',
        height: '100%',
        width: '100%',
      },
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          return `
            <div class="tooltip-box">
              <p class='color-box' style='background-color:${w.config.colors[seriesIndex]}'></p>
              <p class='currency-details'>${w.config.labels[seriesIndex]} ≈ ${this.currencyValuePipe.transform(
                series[seriesIndex],
                this.currentWalletCurrency,
              )} ${this.currentWalletCurrency}</p>
            </div>
          `;
        },
      },
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.35,
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'darken',
            value: 0.9,
          },
        },
      },
      stroke: {
        width: 0, //色块间隙
      },
      series: series,
      labels: labels,
      colors: colors,
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          // customScale: 0.65,
          donut: {
            //改变圆的粗细程度
            size: '80%',
          },
        },
      },
      legend: {
        fontSize: '14px',
        labels: {
          colors: 'var(--text-color)',
        },
        offsetX: 0,
        offsetY: 0,
        // itemMargin: {
        //   horizontal: 10,
        //   vertical: 2,
        // },
        markers: {
          width: 10,
          height: 10,
          radius: 0,
        },
      },
      responsive: [
        {
          breakpoint: 1200,
          options: {
            legend: {
              offsetX: 0,
              offsetY: 0,
              position: 'bottom',
            },
          },
        },
        {
          breakpoint: 767,
          options: {
            legend: {
              fontSize: '12px',
              offsetX: -20,
              offsetY: -20,
              position: 'right',
            },
          },
        },
      ],
    };
  }

  rebootChart() {
    this.chartReady = false;
    this.rebootChart$.next(true);
    timer(200)
      .pipe(takeUntil(this.rebootChart$))
      .subscribe(_ => {
        this.rebootChart$.next(false);
        this.chartReady = true;
      });
  }

  onHideAssetsValue(): void {
    this.hideAssetsValue = !this.hideAssetsValue;
    if (this.hideAssetsValue) {
      this.buildChartData([1], ['**** *********'], ['var(--default-border-color)']);
    } else {
      this.onCreatePieChart(); //重新生成PieChart
    }
  }

  getVipSetting() {
    this.vipApi.getVipDetailList().subscribe(res => {
      if (res) {
        this.vipSettingInfo = res.find(x => x.vipLevel === this.currentVipLevel);
        if (this.vipSettingInfo) {
          this.vipBenefitList = [
            { name: 'birthday_gif', data: this.vipSettingInfo.birthdayBonus, isPercent: false, isMoney: true },
            { name: 'pro_bene', data: this.vipSettingInfo.upgradeBonus, isPercent: false, isMoney: true },
            { name: 'rege_bene', data: this.vipSettingInfo.keepBonus, isPercent: false, isMoney: true },
            { name: 'depo_bene', data: this.vipSettingInfo.firstDepositBonus, isPercent: true, isMoney: true },
            //商户1救援金隐藏
            // { name: 'rescue_money', data: this.vipSettingInfo.rescueMoney, isPercent: true, isMoney: true },
            { name: 'login_red', data: this.vipSettingInfo.loginRedPackage, isPercent: false, isMoney: true },
            {
              name: 'withdrawal',
              data: `${this.vipSettingInfo.dayWithdrawLimitMoney}X`,
              isPercent: false,
              isMoney: false,
            },
          ];
        }
      }
    });
  }

  // 最近交易
  getLatelyData() {
    this.recentTransactionsLoading = true;
    const params = {
      page: 1, // 起始页数
      pageSize: 9, // 每页大小
    };
    this.dealRecordService.getRecentorder(params).subscribe(data => {
      this.recentTransactionsLoading = false;
      if (data) this.recentTransactionsData = data.list;
    });
  }

  toggleChart() {
    this.openChart = !this.openChart;
  }

  jumpToPage(page: string) {
    this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
  }

  jumpToKycPage(page: string) {
    this.jumpToPage(page);
    this.kycService.euMidFailedProcess(this.idFileStatus, this.poaFileStatus);
  }

  //打开划转窗口
  openWalletTransDialog(category: string): void {
    this.dialog.open(WalletTransferComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: {
        category,
      },
    });
  }

  toWalletPage(type: string) {
    if (type == 'withdraw') {
      this.router.navigate([this.appService.languageCode, 'withdrawal']);
    } else {
      this.router.navigate([this.appService.languageCode, 'deposit']);
      this.piqService.allowRoute.set(false);
    }
  }

  //前往公告中心详情页面
  toDetailPage(item: any): void {
    this.router.navigate([this.appService.languageCode, 'help-center', 'announcement', item.categoryId], {
      queryParams: {
        articleCode: item.id,
      },
    });
  }

  onSelectIndexChange($event: any) {
    this.selectedIndex = $event;
    this.onCreatePieChart();
  }

  withRate(num: number) {
    const rate = this.allRate?.rates?.find(v => v.currency === this.serverCurrency)?.rate ?? 0;
    return this.currencyValuePipe.transform(num.subtract(rate), this.currentWalletCurrency);
  }

  /**
   * 获取转账钱包信息
   *
   * @param wallet
   */
  async getGameWalletBalance(
    wallet: TransferwWallet,
  ): Promise<{ totalBalance: number; currenciesWithBalance: { currency: string; balance: number; rate: number }[] }> {
    const result: {
      totalBalance: number;
      currenciesWithBalance: { currency: string; balance: number; rate: number }[];
    } = {
      totalBalance: 0, //USDT总额
      currenciesWithBalance: [],
    };

    await Promise.all(
      wallet.currencies.map(async item => {
        const param: TranserWalletBalanceParamInterface = {
          platformGroupCode: wallet.providerId,
          currency: item.currency,
        };
        const res = await this.userAssetsService.getTranserWalletBalance(param);
        if (res) {
          result.currenciesWithBalance.push({
            currency: item.currency,
            balance: res.totalBalance,
            rate: res.rate,
          });
        }
      }),
    );

    result.totalBalance = result.currenciesWithBalance.reduce((a, b) => {
      return a.add(b.balance.subtract(b.rate));
    }, 0);

    return result;
  }
}
