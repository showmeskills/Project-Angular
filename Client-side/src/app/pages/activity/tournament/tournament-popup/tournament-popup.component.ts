import { Point } from '@angular/cdk/drag-drop';
import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, interval, map, mergeMap, of, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { TournamentRankList } from 'src/app/shared/interfaces/activity.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ActivityService } from './../../activity.service';

@Component({
  selector: 'app-tournament-popup',
  templateUrl: './tournament-popup.component.html',
  styleUrls: ['./tournament-popup.component.scss'],
})
export class TournamentPopupComponent implements OnInit, OnDestroy {
  constructor(
    private activity: ActivityApi,
    private appService: AppService,
    private router: Router,
    private activityService: ActivityService,
    private destroyRef: DestroyRef,
    @Optional() private dialogRef: MatDialogRef<TournamentPopupComponent>,
    private layout: LayoutService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: {
      gameTypeDto: { gameCategory: string; gameCode: string; gameProvider: string };
    }
  ) {}

  /** 是否是 H5 */
  isH5 = toSignal(this.layout.isH5$);

  /** 接口参数 */
  @Input() gameTypeDto?: { gameCategory: string; gameCode: string; gameProvider: string };

  /** 开关 */
  show: boolean = false;

  /** 默认弹窗位置 */
  defaultDragPosition: Point = { x: 20, y: 20 };

  /** 检测 活动范围 */
  intersectChange$: Subject<boolean> = new Subject();

  /** 档案排名数据 */
  tournament: WritableSignal<TournamentRankList[]> = signal([]);
  renderTournament = computed(() => this.tournament());
  /** 多个同名次处理 找到当前用户在列表中 不展示*/
  renderUserRank = computed(() => {
    if (!this.tournament()[this.currentIndex()]?.currentUserRank) {
      return false;
    }

    if (
      this.tournament()[this.currentIndex()]?.pageTable?.records?.find(
        record => record?.uid === this.tournament()[this.currentIndex()]?.currentUserRank?.uid
      )
    ) {
      return false;
    }

    return true;
  });

  /** 当前竞赛坐标 */
  currentIndex: WritableSignal<number> = signal(0);
  renderCurrentIndex = computed(() => this.currentIndex());

  /** 加载loading */
  loading = false;

  /** 显示 当前用户币种 */
  defaultCurrency = toSignal(this.appService.currentCurrency$);
  renderDefaultCurrency = computed(() => {
    if (this.defaultCurrency()?.isDigital) return 'USDT';
    return this.defaultCurrency()?.currency;
  });

  /** 当页面准备 */
  isReady$: Subject<boolean> = new Subject();

  ngOnInit(): void {
    // web 拖拽
    this.activityService.tournamentRankPanel$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(x => {
          this.show = x;
        })
      )
      .subscribe(state => {
        if (state) {
          this.getRanks();
        }
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        if (value !== null) {
          const leaderBoard = this.activityService.collectLeaderBoard.shift();
          const currentUserRank = this.activityService.collectCurrentUser.shift();
          if (leaderBoard) {
            this.tournament.update(item => {
              return item?.map(list => {
                if (list?.tmpCode === leaderBoard?.TmpCode) {
                  return {
                    ...list,
                    pageTable: {
                      ...list.pageTable,
                      records: list?.pageTable?.records?.find(record => record?.uid === leaderBoard?.Uid)
                        ? // 老数据
                          list?.pageTable?.records
                            ?.map(record => {
                              if (leaderBoard.Uid === record.uid) {
                                return this.activityService.singlRTournamentData(leaderBoard);
                              }
                              return record;
                            })
                            .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0))
                            .slice(0, 10)
                        : //新数据处理
                          [...(list?.pageTable?.records || []), this.activityService.singlRTournamentData(leaderBoard)]
                            .filter(item => Number(item?.rankNumber) < 11)
                            .sort((a, b) => Number(a?.rankNumber || 0).minus(b?.rankNumber || 0))
                            .slice(0, 10),
                    },
                  };
                }
                return list;
              });
            });
          }
          if (currentUserRank) {
            this.tournament.update(item => {
              return item?.map(list => {
                if (list?.tmpCode === currentUserRank?.TmpCode) {
                  return {
                    ...list,
                    currentUserRank: this.activityService.singlRTournamentData(currentUserRank),
                  };
                }
                return list;
              });
            });
          }
        }
      });
  }

  /** 获取 排行数据 */
  getRanks() {
    this.loading = true;
    this.activity
      .tournamentRankList({
        gameTypeDto: {
          gameCategory: this.gameTypeDto?.gameCategory || this.data.gameTypeDto.gameCategory || '',
          gameCode: this.gameTypeDto?.gameCode || this.data.gameTypeDto?.gameCode || '',
          gameProvider: this.gameTypeDto?.gameProvider || this.data.gameTypeDto?.gameProvider || '',
        },
        current: 1,
        size: 10,
      })
      .pipe(
        map(v => {
          return v
            ?.filter(
              item =>
                Number(item.tmpEndTime || 0) > Number(item.nowTime || 0) &&
                Number(item.tmpStartTime || 0) <= Number(item.nowTime || 0)
            )
            ?.map((item, index) => {
              return {
                ...item,
                remainingTime: this.activityService.calcUtcToLocalTime(item?.tmpEndTime, item?.nowTime),
                tournamentType: index % 2 === 0 ? 'livecasino' : 'casino',
                tournamentStatus: 'start',
              };
            });
        })
      )
      .subscribe(data => {
        this.tournament.set(data || []);
        // 清空数据 开始 订阅 推送
        this.activityService.collectLeaderBoard = [];
        this.activityService.collectCurrentUser = [];
        this.isReady$.next(true);
        this.loading = false;
      });
  }

  closePopup() {
    this.activityService.tournamentRankPanel$.next(false);
    if (this.isH5()) {
      this.dialogRef.close();
    }
  }

  onGoTournament() {
    this.closePopup();
    this.router.navigate([this.appService.languageCode, 'activity', 'tournament-detail'], {
      queryParams: {
        tmpCode: this.tournament()[this.currentIndex()].tmpCode,
        type: this.tournament()[this.currentIndex()].tournamentType,
        tournamentStatus: this.tournament()[this.currentIndex()].tournamentStatus,
      },
    });
  }

  next() {
    if (this.currentIndex() !== this.tournament().length - 1) {
      this.currentIndex.update(item => (item += 1));
      // 清空数据 开始 订阅 推送
      this.activityService.collectLeaderBoard = [];
      this.activityService.collectCurrentUser = [];
    }
  }

  previous() {
    if (this.currentIndex() !== 0) {
      this.currentIndex.update(item => (item -= 1));
      // 清空数据 开始 订阅 推送
      this.activityService.collectLeaderBoard = [];
      this.activityService.collectCurrentUser = [];
    }
  }

  ngOnDestroy(): void {
    this.currentIndex.set(0);
    this.activityService.tournamentRankPanel$.next(false);
  }
}
