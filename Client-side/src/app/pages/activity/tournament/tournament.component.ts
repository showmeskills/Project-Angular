import { Component, DestroyRef, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, combineLatest, interval, map, mergeMap, of, take } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrencyWalletService } from 'src/app/layouts/currency-wallet/currency-wallet.service';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { TouramentsRecords, TournamentRankList } from 'src/app/shared/interfaces/activity.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { UserAssetsService } from '../../user-asset/user-assets.service';
import { ActivityService } from '../activity.service';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss'],
})
export class TournamentComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private activity: ActivityApi,
    private router: Router,
    private appService: AppService,
    private toast: ToastService,
    private localeService: LocaleService,
    private activityService: ActivityService,
    private destroyRef: DestroyRef,
    private userAssetsService: UserAssetsService,
    private currencyWalletService: CurrencyWalletService,
  ) {}

  /** 是否是 H5 */
  isH5 = toSignal(this.layout.isH5$);

  /** 已经过期活动 上限6  */
  tournamentEndLists: WritableSignal<TouramentsRecords[]> = signal([]);
  renderEndLists = computed(() => {
    if (this.tournamentEndLists().length > 0) return this.tournamentEndLists();
    return null;
  });
  /** 已经开始活动  无上限*/
  tournamentStartLists: WritableSignal<TouramentsRecords[]> = signal([]);
  renderTournamentStartList = computed(() => {
    if (this.tournamentStartLists().length > 0) return this.tournamentStartLists();
    return null;
  });
  /** 未开始活动 上限4*/
  tournamentPreLists: WritableSignal<TouramentsRecords[]> = signal([]);
  renderPreLists = computed(() => {
    if (this.tournamentPreLists().length > 0) return this.tournamentPreLists();
    return null;
  });

  /** 排行榜数据 */
  rankList: WritableSignal<TournamentRankList[]> = signal([]);
  renderRankList = computed(() => this.rankList());

  tournamentLoading = signal(false);
  renderLoading = computed(() => this.tournamentLoading());
  renderEmpty = computed(() => {
    if (
      Number(this.tournamentEndLists().length || 0) > 0 ||
      Number(this.tournamentPreLists().length || 0) > 0 ||
      Number(this.tournamentStartLists().length || 0) > 0
    ) {
      return false;
    }

    return true;
  });

  /** 提交loading */
  joinLoading = false;

  /** 当前币种 */
  defaultCurrency: CurrenciesInterface | null = null;

  /** 当页面准备 */
  isReady$: Subject<boolean> = new Subject();

  ngOnInit() {
    this.tournamentLoading.set(true);
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
        this.getTournamentList();
      });

    this.isReady$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(isReady => {
          if (isReady) {
            return interval(500).pipe(takeUntilDestroyed(this.destroyRef));
          }
          return of(null);
        }),
      )
      .subscribe(value => {
        if (value !== null) {
          const leaderBoard = this.activityService.collectLeaderBoard.shift();
          if (leaderBoard) {
            const findCurrentUid = this.rankList()?.find(
              list => list?.pageTable?.records.find(record => record?.uid === leaderBoard?.Uid),
            );
            // 卡片排行
            this.rankList.update(list => {
              return list.map(item => ({
                ...item,
                pageTable:
                  item.tmpCode === leaderBoard?.TmpCode
                    ? {
                        ...item.pageTable,
                        records: findCurrentUid
                          ? // 老数据
                            item?.pageTable?.records
                              ?.map(record => {
                                if (record?.uid === leaderBoard?.Uid) {
                                  return this.activityService.singlRTournamentData(leaderBoard);
                                }
                                return record;
                              })
                              .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0)) || []
                          : // 新数据
                            [
                              ...(item?.pageTable?.records || []),
                              this.activityService.singlRTournamentData(leaderBoard),
                            ]
                              .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0))
                              .filter(item => Number(item?.rankNumber) < 6),
                      }
                    : item.pageTable,
              }));
            });
          }
        }
      });
  }

  /** 获取 所有列表 */
  getTournamentList() {
    combineLatest([this.activityService.getTournamentList(), this.appService.currentCurrency$])
      .pipe(
        map(([v, currentCurrency]) => {
          this.defaultCurrency = currentCurrency;
          const perListRecords = v.perList?.records?.map(perItem => ({
            ...perItem,
            remainingTime: this.activityService.calcUtcToLocalTime(perItem.tmpStartTime, perItem.nowTime),
            numberVos: perItem?.numberVos?.slice(0, 3) || [],
            tournamentType: 'livecasino',
            tournamentStatus: 'per',
            totalPrizeAmount: perItem?.numberVos?.reduce(
              (pre, cur) =>
                Number(pre) + Number(this.activityService.tournamentCurrencyExchange(cur.amount, cur.currency)),
              0,
            ),
          }));
          const startListRecords = v.startList?.records?.map((startItem, index) => ({
            ...startItem,
            remainingTime: this.activityService.calcUtcToLocalTime(startItem.tmpEndTime, startItem.nowTime),
            numberVos: startItem?.numberVos?.slice(0, 3) || [],
            tournamentType: index % 2 === 0 ? 'livecasino' : 'casino',
            tournamentStatus: 'start',
            totalPrizeAmount: startItem?.numberVos?.reduce(
              (pre, cur) =>
                Number(pre) + Number(this.activityService.tournamentCurrencyExchange(cur.amount, cur.currency)),
              0,
            ),
          }));
          const endListRecords = v.endList?.records?.map(endItem => ({
            ...endItem,
            tournamentType: 'livecasino',
            tournamentStatus: 'end',
          }));

          return {
            ...v,
            perList: {
              ...v.perList,
              records: perListRecords,
            },
            startList: {
              ...v.startList,
              records: startListRecords,
            },
            endList: {
              ...v.endList,
              records: endListRecords,
            },
          };
        }),
        mergeMap(data => {
          if (data.endList && Number(data.endList?.records?.length || 0) > 0) {
            this.tournamentEndLists.set(data.endList.records || []);
          }

          if (data.perList && Number(data.perList?.records?.length || 0) > 0) {
            this.tournamentPreLists.set(data.perList.records || []);
          }

          if (data.startList && Number(data.startList?.records?.length || 0) > 0) {
            this.tournamentStartLists.set(data.startList.records || []);
            return this.activity.tournamentRankList({
              tmpCodes: data.startList.records?.map(item => item.tmpCode) || [],
              current: 1,
              size: 5,
            });
          }

          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => {
        if (data) {
          const tmp: TournamentRankList[] = [];
          const startList = this.tournamentStartLists();
          startList.forEach(startList => {
            data.forEach(rankList => {
              if (rankList?.tmpCode === startList.tmpCode) {
                tmp.push(rankList);
                this.rankList.set(tmp);
              }
            });
          });
          this.activityService.collectLeaderBoard = [];
          this.isReady$.next(true);
        }
        this.tournamentLoading.set(false);
        this.activityService.tournamentTimeStamp = -1;
      });
  }

  /**
   * 跳转
   *
   * @param tempCode
   * @param records
   */
  toTournamentDetails(records: TouramentsRecords) {
    this.router.navigate([this.appService.languageCode, 'activity', 'tournament-detail'], {
      queryParams: {
        tmpCode: records.tmpCode,
        type: records.tournamentType,
        tournamentStatus: records.tournamentStatus,
      },
    });
  }

  /**
   * 报名 tournament
   *
   * @param records
   * @returns
   */
  onSubmitTournamentJoin(records: TouramentsRecords) {
    if (!this.appService.userInfo$.value) {
      this.router.navigateByUrl(`${this.appService.languageCode}/login`);
      return;
    }

    this.joinLoading = true;
    this.activity.onTournamentApply({ tmpCode: records.tmpCode }).subscribe(data => {
      if (data) {
        this.toast.show({ message: this.localeService.getValue('resp'), type: 'success' });

        this.tournamentStartLists.update(lists => {
          return lists.map(list => {
            if (list.tmpCode !== records.tmpCode) {
              return list;
            }
            return {
              ...list,
              uidCanJoin: list.tmpCode === records.tmpCode ? false : list.uidCanJoin,
            };
          });
        });
      } else {
        this.toast.show({ message: this.localeService.getValue('resp_f'), type: 'fail' });
      }
      this.joinLoading = false;
    });
  }
}
