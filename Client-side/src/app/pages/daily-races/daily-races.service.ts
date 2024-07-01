import { Injectable, OnDestroy, WritableSignal, signal } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { BonusInfo, ContestActivities, ContestActivitiesItem } from 'src/app/shared/interfaces/bonus.interface';
import {
  AllBetsData,
  BigWinnerData,
  CommonRealTimeData,
  GameInnerRace,
  GetLuckiestUser,
  HeroBetData,
  LuckiestBetsData,
  LuckiestUserData,
  MybetData,
  WagerRank,
} from 'src/app/shared/interfaces/gameorder.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { RacesPopupUpComponent } from './races-popup-up/races-popup-up.component';
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class DailyRacesService implements OnDestroy {
  constructor(
    private popup: PopupService,
    private layout: LayoutService,
    private bounsApi: BonusApi,
    private localeService: LocaleService,
    private appService: AppService,
  ) {}

  /** 选择活动的当前下标 */
  selectedActivitIndex: number = 0;

  /** 选择显示多少条 */
  pageSize: number = 11;

  /** 显示当前比赛 和 剩余时间 */
  topList: ContestActivitiesItem[] = [];

  /** 排名数据 */
  rankList: Array<BonusInfo> = [];

  /** loading */
  isLoading: boolean = false;

  /** 上一次选中的活动 */
  lastActivitIndex: number = -1;

  /** 上一次请求的数量 */
  lastPageSize: number = -1;

  getTableData$!: Subscription;

  /** 当前展示页面 */
  currentTable = '';

  /** 我的投注 */
  myBetData: WritableSignal<MybetData> = signal({
    titles: ['game', 'time', 'betting_money', 'odds', 'pay_amount'],
    isH5Titles: ['game', 'pay_amount'],
    data: [],
    loading: false,
  });

  /** 所有投注 */
  allBetsData: WritableSignal<AllBetsData> = signal({
    titles: ['game', 'gamer', 'betting_money', 'odds', 'pay_amount'],
    isH5Titles: ['game', 'pay_amount'],
    data: [],
    loading: false,
  });

  /** 风云榜 */
  heroBetsData: WritableSignal<HeroBetData> = signal({
    titles: ['game', 'gamer', 'betting_money', 'odds', 'pay_amount'],
    isH5Titles: ['game', 'betting_money'],
    data: [],
    loading: false,
  });

  /** 最幸运 */
  luckiestBetsdata: WritableSignal<LuckiestBetsData> = signal({
    titles: ['game', 'gamer', 'betting_money', 'odds', 'pay_amount'],
    isH5Titles: ['game', 'odds'],
    data: [],
    loading: false,
  });

  /** 大赢家 */
  bigWinnerData: WritableSignal<BigWinnerData> = signal({
    titles: ['rank_a', 'gamer', 'betting_money', 'odds', 'pay_amount'],
    isH5Titles: ['rank_a', 'gamer', 'pay_amount'],
    data: [],
    loading: false,
  });

  /** 幸运赢家 */
  luckiestUserData: WritableSignal<LuckiestUserData> = signal({
    titles: ['rank_a', 'gamer', 'betting_money', 'odds', 'pay_amount'],
    isH5Titles: ['rank_a', 'gamer', 'odds'],
    data: [],
    loading: false,
  });

  /** 第一名玩家 */
  firstUser: GetLuckiestUser[] = [];

  /** 游戏内展示 表格的下表 0 是大赢家 1是幸运赢家 */
  gameInnerIndex: number = 0;

  /** 游戏内页订阅 */
  gameInnerInfo$: BehaviorSubject<GameInnerRace | null> = new BehaviorSubject<GameInnerRace | null>(null);

  /** 收集数据 */
  collectionData: WagerRank[] = [];

  private topList$: { [key: string]: Observable<ContestActivities> } = {};

  public getDailyTitles(value: number = 0) {
    const bufferValue = window.btoa(JSON.stringify(value));
    return (
      this.topList$[bufferValue] ??
      ((this.topList$[bufferValue] = this.bounsApi.getContestTitleList().pipe(
        cacheValue(1200 * 60 * 10),
        map(x => x && this.newObj(x)),
      )),
      this.topList$[bufferValue])
    );
  }

  private newObj(v: unknown) {
    return JSON.parse(JSON.stringify(v));
  }

  /**
   * 显示排名弹窗
   *
   * @param bonusActivitiesNo
   */
  openPopup(bonusActivitiesNo?: string) {
    const isH5 = this.layout.isH5$.value;
    this.popup.open(RacesPopupUpComponent, {
      inAnimation: isH5 ? 'fadeInUp' : undefined,
      outAnimation: isH5 ? 'fadeOutDown' : undefined,
      position: isH5 ? { bottom: '0px' } : undefined,
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
      data: {
        bonusActivitiesNo,
      },
    });
  }

  /** 获取活动导航列表 */
  getTitleList() {
    if (this.topList.length > 0) return;
    this.isLoading = true;
    this.getDailyTitles().subscribe(list => {
      this.topList = list?.title || [];
      this.isLoading = false;
      if (this.topList.length > 0) this.getRank();
    });
  }

  /** 获取所有排名 */
  getRank() {
    if (this.lastActivitIndex == this.selectedActivitIndex && this.lastPageSize == this.pageSize) return;
    const params = {
      activitiesNo: this.topList[this.selectedActivitIndex]?.activitiesNo || '',
      pageIndex: 1,
      pageSize: this.pageSize - 1,
    };
    this.lastActivitIndex = this.selectedActivitIndex;
    this.lastPageSize = this.pageSize - 1;
    this.isLoading = true;
    this.getTableData$?.unsubscribe();
    this.getTableData$ = timer(0, 15 * 60 * 1000)
      .pipe(
        switchMap(() => this.bounsApi.getRank(params)),
        map((data, index) => ({ isFirst: index == 0, data })),
      )
      .subscribe(({ isFirst, data }) => {
        isFirst && (this.isLoading = false);
        this.rankList = data?.bonusInfo || [];
        // [
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'USDT',
        //     bonusUsdtMoney: 888,
        //     rankMoney: 221551.370572,
        //     rankNumber: 1,
        //     uid: '',
        //     userName: '01844463',
        //     avatar: 'avatar-5',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'CNY',
        //     bonusUsdtMoney: 688,
        //     rankMoney: 156694.63437,
        //     rankNumber: 2,
        //     uid: '',
        //     userName: '01079556',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'USDT',
        //     bonusUsdtMoney: 388,
        //     rankMoney: 146436.4075,
        //     rankNumber: 3,
        //     uid: '',
        //     userName: '01187846',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'USDT',
        //     bonusUsdtMoney: 288,
        //     rankMoney: 138977,
        //     rankNumber: 4,
        //     uid: '',
        //     userName: '01015554',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'CNY',
        //     bonusUsdtMoney: 188,
        //     rankMoney: 136524.770408,
        //     rankNumber: 5,
        //     uid: '',
        //     userName: '01188110',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'CNY',
        //     bonusUsdtMoney: 128,
        //     rankMoney: 102896.383893,
        //     rankNumber: 6,
        //     uid: '',
        //     userName: '',
        //     avatar: 'avatar-4',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'USDT',
        //     bonusUsdtMoney: 128,
        //     rankMoney: 96404.397869,
        //     rankNumber: 7,
        //     uid: '',
        //     userName: '01182824',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'USDT',
        //     bonusUsdtMoney: 128,
        //     rankMoney: 85228.559385,
        //     rankNumber: 8,
        //     uid: '',
        //     userName: '01140867',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'CNY',
        //     bonusUsdtMoney: 128,
        //     rankMoney: 77802.777523,
        //     rankNumber: 9,
        //     uid: '',
        //     userName: '01007914',
        //     avatar: 'avatar-1',
        //   },
        //   {
        //     bonusMoney: 0,
        //     bonusCurrency: 'CNY',
        //     bonusUsdtMoney: 128,
        //     rankMoney: 75606.7457,
        //     rankNumber: 10,
        //     uid: '',
        //     userName: '01149657',
        //     avatar: 'avatar-1',
        //   },
        // ];
      });
  }

  ngOnDestroy(): void {
    this.getTableData$?.unsubscribe();
  }

  /**
   * 用于 大厅 游戏页 游戏推送
   *
   * @param source
   * @param signlarMsg 推送数据
   * @returns
   */
  getRealTimeData(source: Array<CommonRealTimeData>, signlarMsg: WagerRank): any[] {
    const data = signlarMsg?.data || null;
    const page = this.layout.page$.value;
    const casinoHall = ['LiveCasino', 'SlotGame'];
    const lotteryHall = ['Lottery'];
    const language = this.appService.languageCode;
    const signalR = {
      gameName: data?.GameName[language] || data?.GameCode,
      dateTime: data?.BetTime || 0,
      betAmount: data?.BetAmount || 0,
      odds: this.onProcessOdd(data?.Odds),
      payAmount: data?.PayAmount || 0,
      currency: data?.Currency || '',
      playerName: data?.UserName || this.localeService.getValue('invisible'),
      avatar: data?.Avater || '',
      orderNum: data?.OrderNum || '',
      ranking: data?.Ranking,
      payAmountUsdt: data?.PayAmountUsdt || 0,
      gameProviderName: data?.Provider?.name || '',
    };

    const isReturnNewData =
      // home
      page === 'home' ||
      // 娱乐城
      (page?._componentName?.includes('MinigameComponent') && casinoHall.includes(data?.GameCategory)) ||
      // 彩票
      (page?._componentName?.includes('ObLotteryComponent') && lotteryHall.includes(data?.GameCategory)) ||
      // 游戏内页区分
      this.gameInnerInfo$?.value?.gameId?.includes(data?.GameCode);

    if (isReturnNewData) return [signalR, ...(source || [])];

    // 没有改动就返回当前
    return source;
  }

  /**
   * 数据处理
   *
   * @param wagerRankData
   */
  onWagerRank(wagerRankData: WagerRank) {
    const data = wagerRankData?.data || null;
    const currentTable = this.currentTable;
    const isSameUid = this.appService.userInfo$.value?.uid === wagerRankData?.data?.Uid;

    // Status 为 Settle 推送结算
    if (data && data.Status === 'Settle') {
      //风云榜 最幸运
      switch (currentTable) {
        case 'my_bet':
          if (isSameUid) {
            this.myBetData.update(item => ({
              ...item,
              data: this.getRealTimeData(item.data, wagerRankData)?.slice(0, this.pageSize) || [],
            }));
          }
          break;
        case 'all_bet':
          this.allBetsData.update(item => ({
            ...item,
            data: this.getRealTimeData(item.data, wagerRankData)?.slice(0, this.pageSize),
          }));
          break;
        case 'windy_list':
          if (Number(data?.BetUsdt || 0) >= 1000) {
            this.heroBetsData.update(item => ({
              ...item,
              data: this.getRealTimeData(item.data, wagerRankData)?.slice(0, this.pageSize),
            }));
          }
          break;
        case 'luckiest':
          if (
            data.Odds !== null &&
            Number(data?.PayoutAmount) > 0 &&
            this.onProcessThrottle(this.luckiestBetsdata().data, wagerRankData)
          ) {
            this.luckiestBetsdata.update(item => ({
              ...item,
              data: this.getRealTimeData(item.data, wagerRankData)
                ?.sort((a, b) => Number(b?.odds || 0).minus(Number(a?.odds || 0)))
                ?.slice(0, this.pageSize),
            }));
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * 三级 页面 使用 大赢家和幸运星家
   *
   * @param wagerRankData
   */
  onWagerRank3LevelGame(wagerRankData: WagerRank) {
    const data = wagerRankData?.data || null;
    if (data && data.Status === 'Settle') {
      switch (this.gameInnerIndex) {
        case 1:
          if (Number(data?.PayoutUsdt) > 0) {
            this.bigWinnerData.update(item => ({
              ...item,
              data: this.getRealTimeData(item.data, wagerRankData)
                ?.sort((a, b) => Number(b?.payAmountUsdt || 0).minus(Number(a?.payAmountUsdt || 0)))
                ?.slice(0, 3),
            }));
          }
          break;
        case 2:
          if (
            data.Odds !== null &&
            Number(data?.PayoutAmount || 0) > 0 &&
            this.onProcessThrottle(this.luckiestUserData().data, wagerRankData)
          ) {
            this.luckiestUserData.update(item => ({
              ...item,
              data: this.getRealTimeData(item.data, wagerRankData)
                ?.sort((a, b) => Number(b?.odds || 0).minus(Number(a?.odds || 0)))
                ?.slice(0, 3),
            }));
            this.firstUser = this.luckiestUserData().data?.slice(0, 1);
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * 防止数据更新时候，并未大于当前数据然后， 页面刷新
   *
   * @param data
   * @param wagerRankData
   * @returns boolean
   */
  onProcessThrottle(data: CommonRealTimeData[], wagerRankData: WagerRank): boolean {
    if (data?.find(item => Number(wagerRankData?.data?.Odds || 0) >= Number(item?.odds || 0))) return true;
    return false;
  }

  /**
   * 当cdn 图片删除时 换成 avatar-1
   *
   * @param imgElement
   */
  onImageError(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/images/settings-center/avatar-1.png';
  }

  /**
   * 过滤 odds  保留3位数字 大于 100 保留整数
   *
   * @param odd
   * @returns
   */
  onProcessOdd(odd: number | null): string | number | null {
    if (odd === null) return odd;
    if (Number(odd || 0) < 10) {
      return odd.toFixed(2);
    } else if (Number(odd || 0) >= 10 && Number(odd || 0) <= 99) {
      return odd.toFixed(1);
    } else {
      return Math.trunc(odd);
    }
  }
}
