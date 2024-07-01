import { Component, DestroyRef, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, filter, interval, mergeMap, of, take } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CurrencyWalletService } from 'src/app/layouts/currency-wallet/currency-wallet.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { RankList, TouramentsRecords, TournamentRankList } from 'src/app/shared/interfaces/activity.interface';
import { IDropDown } from 'src/app/shared/interfaces/bonus.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { GameListItem } from 'src/app/shared/interfaces/game.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { ActivityService } from '../../activity.service';

@Component({
  selector: 'app-tournament-details',
  templateUrl: './tournament-details.component.html',
  styleUrls: ['./tournament-details.component.scss'],
})
export class TournamentDetailsComponent implements OnInit {
  constructor(
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    private activity: ActivityApi,
    private activityService: ActivityService,
    private toast: ToastService,
    private localeService: LocaleService,
    private userAssetsService: UserAssetsService,
    private currencyWalletService: CurrencyWalletService,
  ) {}
  /** 详情数据 */
  tournamentDetails: WritableSignal<TouramentsRecords | undefined> = signal(undefined);
  renderTournamentDetail = computed(() => {
    if (this.tournamentDetails()) return this.tournamentDetails();
    return undefined;
  });

  /** 排名奖励数据 */
  rewardsRanks: WritableSignal<
    | Array<{
        rankRange?: string;
        showRange?: boolean;
        rankNumStart: number;
        rankNumEnd: number;
        amount: number;
        currency: string;
        prizeType: number;
        prizeFullName: string;
        prizeShortName: string;
      }>
    | []
  > = signal([]);
  renderOtherRanks = computed(() => {
    if (this.rewardsRanks().length > 0) {
      return this.rewardsRanks()
        .filter(item => item.rankNumEnd > 3)
        .map(item => {
          if (item.rankNumStart === item.rankNumEnd) {
            return {
              ...item,
              rankRange: item.rankNumEnd,
              showRange: false,
            };
          }
          if (item.rankNumStart < 4) {
            return {
              ...item,
              rankRange: item.rankNumEnd === 4 ? item.rankNumEnd : `4~${item.rankNumEnd}`,
              showRange: !(item.rankNumEnd === 4),
            };
          }
          return {
            ...item,
            rankRange: `${item.rankNumStart}~${item.rankNumEnd}`,
            showRange: true,
          };
        });
    }
    return null;
  });

  /** 所有排行 */
  rankLists: WritableSignal<Array<RankList>> = signal([]);
  renderAllRanks = computed(() => {
    if (this.rankLists().length > 0) return this.rankLists();
    return null;
  });
  topRankLists: WritableSignal<TournamentRankList | null> = signal(null);
  renderTopRankLists = computed(() => {
    if (this.topRankLists()) return this.topRankLists();
    return null;
  });

  /** tournament 为你推荐 */
  gameList: WritableSignal<GameListItem[]> = signal([]);
  renderGameList = computed(() => {
    if (this.gameList()) return this.gameList();
    return null;
  });

  /** 当前用户 排行 */
  userRanks: WritableSignal<RankList | null> = signal(null);
  renderUserRanks = computed(() => this.userRanks());

  /** 页码下拉 */
  dropDown: IDropDown[] = [
    { key: '10', value: 10 },
    { key: '20', value: 20 },
    { key: '30', value: 30 },
    { key: '40', value: 40 },
  ];
  pageSize: number = 10;

  /** 详情文案 */
  tournamentContent = signal('');
  renderTournamentContent = computed(() => this.tournamentContent());

  /** 活动类型 */
  tournamentType = '';

  /** 当前活动状态 */
  tournamentStatus = '';

  /** 活动编号 */
  tmpCode: string = '';

  /** 改变排行 数量loading */
  rankLoading = false;
  pageLoading = false;

  /** 提交loading */
  joinLoading = false;

  /** 默认币种 */
  defaultCurrency: WritableSignal<CurrenciesInterface | null> = signal(null);
  renderDefaultCurrency = computed(() => {
    if (this.defaultCurrency()?.isDigital) return 'USDT';
    return this.defaultCurrency()?.currency;
  });

  /** 当页面准备 */
  isReady$: Subject<boolean> = new Subject();

  ngOnInit(): void {
    this.pageLoading = true;
    combineLatest([
      this.currencyWalletService.defaultToFiat$.pipe(
        filter(v => Number(v.rates?.length || 0) > 0),
        take(1),
      ),
      this.userAssetsService.allRate.pipe(
        filter(v => v?.rates?.length > 0),
        take(1),
      ),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getDetails();
      });

    // 推送数据处理
    this.isReady$
      .pipe(
        mergeMap(isReady => {
          if (isReady) {
            return interval(500).pipe(takeUntilDestroyed(this.destroyRef));
          }
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(value => {
        if (value !== null) {
          const leaderBoard = this.activityService.collectLeaderBoard.shift();
          const currentUserRank = this.activityService.collectCurrentUser.shift();
          if (leaderBoard && leaderBoard?.TmpCode === this.tournamentDetails()?.tmpCode) {
            const currentUidInRank = this.rankLists()?.find(list => list?.uid === leaderBoard?.Uid);
            this.rankLists.update(list => {
              return currentUidInRank
                ? list
                    .map(item => {
                      // 同ID 更新
                      if (item.uid === leaderBoard.Uid) {
                        return this.activityService.singlRTournamentData(leaderBoard);
                      }
                      // 原来的数据
                      return item;
                    })
                    .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0))
                    .slice(0, this.pageSize)
                : [...list, this.activityService.singlRTournamentData(leaderBoard)]
                    .filter(item => Number(item?.rankNumber || 0) < Number(this.pageSize + 1))
                    .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0))
                    .slice(0, this.pageSize);
            });

            // 卡片排行榜
            const currentCardUid = this.topRankLists()?.pageTable?.records?.find(list => list?.uid === leaderBoard.Uid);

            this.topRankLists.update(item => {
              if (item) {
                return {
                  ...item,
                  pageTable: {
                    ...item.pageTable,
                    records: currentCardUid
                      ? // 老数据
                        item?.pageTable?.records
                          ?.map(table => {
                            if (table.uid === leaderBoard.Uid) {
                              return this.activityService.singlRTournamentData(leaderBoard);
                            }
                            return table;
                          })
                          .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0)) || []
                      : // 新数据
                        [...(item?.pageTable?.records || []), this.activityService.singlRTournamentData(leaderBoard)]
                          .filter(item => Number(item?.rankNumber) < 6)
                          .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0)),
                  },
                };
              }
              return item;
            });
          }
          if (currentUserRank && currentUserRank?.TmpCode === this.tournamentDetails()?.tmpCode) {
            this.userRanks.set(this.activityService.singlRTournamentData(currentUserRank));
          }
        }
      });
  }

  getDetails() {
    this.pageLoading = true;
    this.route.queryParams
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(params => {
          if (params?.tmpCode && params?.type && params?.tournamentStatus) {
            this.tournamentType = params.type;
            this.tournamentStatus = params.tournamentStatus;
            this.tmpCode = params.tmpCode;
            return combineLatest([
              this.activity.tournamentRankList({ tmpCodes: [params.tmpCode], current: 1, size: 10 }),
              this.activity.onNewRankCheckApply({ tmpCodes: [params.tmpCode] }),
              this.appService.currentCurrency$,
            ]);
          }
          this.router.navigateByUrl(`${this.appService.languageCode}/activity/tournament`);
          return of([null, null, null]);
        }),
      )
      .subscribe(([details, checkJoins, currentCurrency]) => {
        if (details && details.length > 0 && checkJoins) {
          const detail = details?.find(item => item.tmpCode === this.tmpCode);
          this.defaultCurrency.set(currentCurrency);
          this.tournamentDetails.set({
            nowTime: detail?.nowTime || 0,
            tmpCode: detail?.tmpCode || '',
            activityName: detail?.activityName || '',
            activitySubName: detail?.activitySubName || '',
            activitySlogan: detail?.activitySlogan || '',
            activityContent: detail?.activityContent || '',
            activityThumbnails: detail?.activityThumbnails || '',
            gameLists: detail?.gameLists || [],
            tmpEndTime: detail?.tmpEndTime || 0,
            tmpStartTime: detail?.tmpStartTime || 0,
            uidCanJoin: checkJoins[0]?.canJoin || false,
            numberVos: detail?.numberVos?.slice(0, 3) || [],
            remainingTime:
              this.tournamentStatus === 'start'
                ? this.activityService.calcUtcToLocalTime(detail?.tmpEndTime || 0, detail?.nowTime || 0)
                : this.tournamentStatus === 'per'
                  ? this.activityService.calcUtcToLocalTime(detail?.tmpStartTime || 0, detail?.nowTime || 0)
                  : 0,
            tournamentType: this.tournamentType,
            totalPrizeAmount: detail?.numberVos?.reduce(
              (pre, cur) =>
                Number(pre) + Number(this.activityService.tournamentCurrencyExchange(cur.amount, cur.currency)),
              0,
            ),
            tournamentStatus: this.tournamentStatus,
            rangeNumberVos: detail?.rangeNumberVos || [],
          });
          this.rewardsRanks.set(detail?.rangeNumberVos || []);
          this.gameList.set(detail?.gameLists || []);
          this.rankLists.set(detail?.pageTable?.records || []);
          this.topRankLists.set(detail || null);
          this.userRanks.set(detail?.currentUserRank || null);
          this.tournamentContent.set(detail?.activityContent || '');
          // 清空数据 开始 订阅 推送
          this.activityService.collectLeaderBoard = [];
          this.activityService.collectCurrentUser = [];
          if (this.tournamentStatus === 'start') {
            this.isReady$.next(true);
          }
        } else {
          this.router.navigateByUrl(`${this.appService.languageCode}/activity/tournament`);
        }
        this.pageLoading = false;
      });
  }

  /**
   * 点击游戏
   *
   * @param item
   * @param item.webRedirectUrl
   * @param item.providerCatId
   * @param item.gameId
   */
  clickGameItem(item: { webRedirectUrl?: string; providerCatId: string; gameId: string }) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }

  /**
   * 下拉数量 请求
   *
   * @param event 数量
   */
  onValueChange(event: number) {
    this.pageSize = event;
    this.rankLoading = true;
    this.activity.tournamentRankList({ tmpCodes: [this.tmpCode], current: 1, size: event }).subscribe(data => {
      if (data.length > 0) {
        const detail = data?.find(item => item.tmpCode === this.tmpCode);
        this.rankLists.set(detail?.pageTable?.records || []);
        // 切换时 清空数据
        this.activityService.collectLeaderBoard = [];
        this.activityService.collectCurrentUser = [];
      }
      this.rankLoading = false;
    });
  }

  /**
   * 报名 tournament
   *
   * @param records
   * @returns
   */
  onSubmitTournamentJoin(records: TouramentsRecords | undefined) {
    if (!this.appService.userInfo$.value) {
      this.router.navigateByUrl(`${this.appService.languageCode}/login`);
      return;
    }

    if (records) {
      this.joinLoading = true;
      this.activity.onTournamentApply({ tmpCode: records.tmpCode }).subscribe(data => {
        if (data) {
          this.toast.show({ message: this.localeService.getValue('resp'), type: 'success' });
          this.tournamentDetails.update(item => {
            if (item) {
              return {
                ...item,
                uidCanJoin: records.tmpCode === item?.tmpCode ? false : true,
              };
            }
            return item;
          });
        } else {
          this.toast.show({ message: this.localeService.getValue('resp_f'), type: 'fail' });
        }
        this.joinLoading = false;
      });
    }
  }
  // mockAmount = 1000;
  // mockSore = 500;
  // mockPush() {
  //   this.mockAmount += 1000;
  //   this.mockSore += 50;
  //   this.activityService.collectLeaderBoard.push(
  //     {
  //       PrizeId: '877',
  //       IsEqualPosition: false,
  //       RankNumber: 1,
  //       RankScore: this.mockSore,
  //       TenantWinOrLost: -725,
  //       Uid: '01000264',
  //       UserName: 'AAA',
  //       UidActiveFlow: 400,
  //       UidBetMoney: 400,
  //       UidWinOrLost: 725,
  //       Amount: 1000.0,
  //       Currency: 'CNY',
  //       PrizeType: 1,
  //       PrizeFullName: 'Cash-100CNY',
  //       PrizeShortName: 'Cash-100CNY',
  //       IsChange: true,
  //       TmpCode: '1970719144269125',
  //     },
  //     {
  //       PrizeId: '877',
  //       IsEqualPosition: false,
  //       RankNumber: 2,
  //       RankScore: this.mockSore,
  //       TenantWinOrLost: -725,
  //       Uid: '01000263',
  //       UserName: 'BBB',
  //       UidActiveFlow: 400,
  //       UidBetMoney: 400,
  //       UidWinOrLost: 725,
  //       Amount: 1000.0,
  //       Currency: 'CNY',
  //       PrizeType: 1,
  //       PrizeFullName: 'Cash-100CNY',
  //       PrizeShortName: 'Cash-100CNY',
  //       IsChange: true,
  //       TmpCode: '1970719144269125',
  //     },
  //     {
  //       PrizeId: '877',
  //       IsEqualPosition: false,
  //       RankNumber: 3,
  //       RankScore: this.mockSore,
  //       TenantWinOrLost: -725,
  //       Uid: '01000262',
  //       UserName: 'CCC',
  //       UidActiveFlow: 400,
  //       UidBetMoney: 400,
  //       UidWinOrLost: 725,
  //       Amount: 1000.0,
  //       Currency: 'CNY',
  //       PrizeType: 1,
  //       PrizeFullName: 'Cash-100CNY',
  //       PrizeShortName: 'Cash-100CNY',
  //       IsChange: true,
  //       TmpCode: '1970719144269125',
  //     },
  //     {
  //       PrizeId: '877',
  //       IsEqualPosition: false,
  //       RankNumber: 4,
  //       RankScore: this.mockSore,
  //       TenantWinOrLost: -725,
  //       Uid: '01000261',
  //       UserName: 'DDD',
  //       UidActiveFlow: 400,
  //       UidBetMoney: 400,
  //       UidWinOrLost: 725,
  //       Amount: 1000.0,
  //       Currency: 'CNY',
  //       PrizeType: 1,
  //       PrizeFullName: 'Cash-100CNY',
  //       PrizeShortName: 'Cash-100CNY',
  //       IsChange: true,
  //       TmpCode: '1970719144269125',
  //     },
  //     {
  //       PrizeId: '877',
  //       IsEqualPosition: false,
  //       RankNumber: 5,
  //       RankScore: this.mockSore,
  //       TenantWinOrLost: -725,
  //       Uid: '01000260',
  //       UserName: 'EEE',
  //       UidActiveFlow: 400,
  //       UidBetMoney: 400,
  //       UidWinOrLost: 725,
  //       Amount: 1000.0,
  //       Currency: 'CNY',
  //       PrizeType: 1,
  //       PrizeFullName: 'Cash-100CNY',
  //       PrizeShortName: 'Cash-100CNY',
  //       IsChange: true,
  //       TmpCode: '1970719144269125',
  //     },
  //     {
  //       PrizeId: '877',
  //       IsEqualPosition: false,
  //       RankNumber: 6,
  //       RankScore: this.mockSore,
  //       TenantWinOrLost: -725,
  //       Uid: '01000259',
  //       UserName: 'FFF',
  //       UidActiveFlow: 400,
  //       UidBetMoney: 400,
  //       UidWinOrLost: 725,
  //       Amount: 1000.0,
  //       Currency: 'CNY',
  //       PrizeType: 1,
  //       PrizeFullName: 'Cash-100CNY',
  //       PrizeShortName: 'Cash-100CNY',
  //       IsChange: true,
  //       TmpCode: '1970719144269125',
  //     }
  //   );

  //   setTimeout(() => {
  //     this.activityService.collectLeaderBoard.push(
  //       {
  //         PrizeId: '877',
  //         IsEqualPosition: false,
  //         RankNumber: 6,
  //         RankScore: this.mockSore,
  //         TenantWinOrLost: -725,
  //         Uid: '01000260',
  //         UserName: 'EEE',
  //         UidActiveFlow: 400,
  //         UidBetMoney: 400,
  //         UidWinOrLost: 725,
  //         Amount: 1000.0,
  //         Currency: 'CNY',
  //         PrizeType: 1,
  //         PrizeFullName: 'Cash-100CNY',
  //         PrizeShortName: 'Cash-100CNY',
  //         IsChange: true,
  //         TmpCode: '1970719144269125',
  //       },
  //       {
  //         PrizeId: '877',
  //         IsEqualPosition: false,
  //         RankNumber: 5,
  //         RankScore: this.mockSore,
  //         TenantWinOrLost: -725,
  //         Uid: '01000259',
  //         UserName: 'XXXX',
  //         UidActiveFlow: 400,
  //         UidBetMoney: 400,
  //         UidWinOrLost: 725,
  //         Amount: 1000.0,
  //         Currency: 'CNY',
  //         PrizeType: 1,
  //         PrizeFullName: 'Cash-100CNY',
  //         PrizeShortName: 'Cash-100CNY',
  //         IsChange: true,
  //         TmpCode: '1970719144269125',
  //       }
  //     );
  //   }, 2000);
  // }
}
