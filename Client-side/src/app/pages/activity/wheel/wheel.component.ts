import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { Subject, Subscription, combineLatest, of, timer } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import {
  WheelCondition,
  WheelHistoryItem,
  WheelInfo,
  WheelPrizeInfo,
} from 'src/app/shared/interfaces/activity.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { CardCenterService } from '../../card-center/card-center.service';
import { MiniGameService } from '../../minigame/minigame.service';
import { ActivityService } from '../activity.service';
import { WheelMusicService } from './wheel-music.service';

@UntilDestroy()
@Component({
  selector: 'app-wheel',
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.scss'],
})
export class WheelComponent implements OnInit, OnDestroy {
  constructor(
    private dialogRef: MatDialogRef<WheelComponent>,
    private layout: LayoutService,
    private appService: AppService,
    private router: Router,
    private localeStorage: LocalStorageService,
    private audioService: WheelMusicService,
    private activityApi: ActivityApi,
    private generalService: GeneralService,
    private toast: ToastService,
    private localeService: LocaleService,
    private miniGameService: MiniGameService,
    private popupService: PopupService,
    private cardCenterService: CardCenterService,
    private activityService: ActivityService,
  ) {
    // 活动音效
    this.audioService.init();
  }

  play: boolean = false;

  originalLabelID = '';

  /** 转盘状态 0显示转盘 1中奖提示 2很遗憾没有中奖 */
  status: number = 0;

  @ViewChild('wheelWrap') wheelWrapElement!: ElementRef<HTMLDivElement>;
  @ViewChild('historyTableContainer') historyTableContainer!: ElementRef<HTMLDivElement>;

  ready$: Subject<boolean> = new Subject();
  loadingWheelInfo: boolean = true;

  logined!: boolean;
  isH5!: boolean;
  musicStatus: boolean = true;

  popShow: boolean = false;
  popShowFor: 'description' | 'history' = 'description';

  historyList: WheelHistoryItem[] = [];
  historyIsOld: boolean = false;
  loadingHistory: boolean = false;

  /** 中奖记录分页数据 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 30,
    total: 0,
  };
  languageCode = this.appService.languageCode;
  wheelInfo?: WheelInfo;
  prizeInfos: WheelPrizeInfo[] = [];
  prize?: WheelPrizeInfo;

  wheelCondition!: WheelCondition;
  loadingCondition: boolean = false;

  loadingTurn: boolean = false;

  timeDuration!: moment.Duration;
  timeEnd$: Subject<boolean> = new Subject();
  timeData = {
    day: 0,
    hour: 0,
    min: 0,
    sec: 0,
  };

  /**1-显示能抽，0-显示登录，2-显示条件 */
  get wheelStatus() {
    if (this.logined && this.wheelCondition) {
      if (this.wheelCondition.leftTimes > 0) {
        return 1;
      }
      return 2;
    } else if (!this.logined) {
      return 0;
    }
    return 3;
  }

  /**
   * time-时间，deposit-存款，tradeCount-有效交易笔数(限制最低交易金额)，trade-有效交易金额
   *
   * @returns //
   */
  get conditionStatus() {
    if (this.wheelCondition) {
      switch (this.wheelCondition.wheelType) {
        case 3:
          return 'time';
        case 1:
          return 'deposit';
        case 2:
          if (this.wheelCondition.perTransCount) return 'tradeCount';
          return 'trade';
        default:
          return '';
      }
    }
    return '';
  }

  ngOnInit() {
    this.localeStorage.wheelShown = true;
    this.musicStatus = this.localeStorage.wheelMusic ? true : false;
    this.audioService.playWheelAudio();

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));

    this.miniGameService.getOriginalProviderID().subscribe(v => (this.originalLabelID = v));

    combineLatest([this.appService.userInfo$.pipe(tap(v => (this.logined = !!v))), this.ready$])
      .pipe(untilDestroyed(this))
      .subscribe(([logined]) => {
        if (logined) {
          this.checkCanTurn();
        }
      });

    this.timeEnd$.pipe(untilDestroyed(this), delay(1000)).subscribe(() => {
      this.checkCanTurn();
    });

    this.getWheelInfo();
  }

  /**获取活动资讯 */
  getWheelInfo() {
    this.loadingWheelInfo = true;
    this.activityService.getturntableinformation().subscribe(res => {
      if (res?.data && res?.data.length != 0) {
        this.loadingWheelInfo = false;
        this.wheelInfo = res.data[0];
        this.prizeInfos = this.wheelInfo?.prizeInfos as WheelPrizeInfo[];
        this.ready$.next(true);
      } else {
        // 无有效活动
        this.loadingWheelInfo = false;
        this.wheelInfo = undefined;
        this.close();
        this.popupService.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'warn',
            content: this.localeService.getValue('hint'),
            buttons: [{ text: this.localeService.getValue('confirm_button') }],
            description: this.localeService.getValue('whe_no_act_d'),
          },
        });
      }
    });
  }

  /**查询次数和条件 */
  checkCanTurn() {
    if (!this.wheelInfo) return;
    this.loadingCondition = true;
    this.activityApi.getturntablegaptospin(this.wheelInfo.activityCode).subscribe(res => {
      this.loadingCondition = false;
      if (res?.data) {
        this.wheelCondition = res.data;
        if (this.wheelStatus === 2 && this.conditionStatus === 'time') {
          this.onStartClock();
        }
      } else {
        // this.deActive();
        if (this.logined && this.wheelInfo?.available) {
          this.wheelCondition = {
            ...this.wheelCondition,
            leftTimes: 1,
          };
        }
      }
    });
  }

  /**获取历史 */
  getHistory(init = false) {
    this.loadingHistory = true;
    const rang = this.generalService.getStartEndDateArray('90days');
    if (init) {
      this.historyIsOld = true;
      this.paginator.page = 1;
      this.paginator.total = 0;
    }
    this.activityApi
      .getturntableprizehistory(rang[0], rang[1], this.paginator.page, this.paginator.pageSize)
      .subscribe(res => {
        this.loadingHistory = false;
        if (res?.data) {
          this.paginator.total = res.data.total;
          if (init) {
            this.historyList = res.data.histories;
            this.historyIsOld = false;
          } else {
            this.historyList.push(...res.data.histories);
          }
        }
      });
  }

  /**
   * 关闭
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * 音效
   */
  music() {
    this.musicStatus = !this.musicStatus;
    this.localeStorage.wheelMusic = this.musicStatus;
    this.audioService.playWheelAudio();
  }

  openPop(type: 'description' | 'history') {
    this.popShowFor = type;
    if (this.popShowFor === 'history') {
      this.historyTableContainer?.nativeElement.scrollTo({ left: 0, top: 0 });
      this.getHistory(true);
    }
    this.popShow = true;
  }

  closehistory(e?: Event) {
    if (e && e.currentTarget !== e.target) return;
    if (this.popShow) {
      this.popShow = false;
    }
  }

  /**
   * 点击抽奖，转盘开始
   */
  onWheelPlay() {
    if (!this.wheelInfo) return;
    const degMap: { [key: number]: number } = {
      1: 1080 + 30 * 10,
      2: 1080 + 30 * 11,
      3: 1080 + 30 * 12,
      4: 1080 + 30 * 1,
      5: 1080 + 30 * 2,
      6: 1080 + 30 * 3,
      7: 1080 + 30 * 4,
      8: 1080 + 30 * 5,
      9: 1080 + 30 * 6,
      10: 1080 + 30 * 7,
      11: 1080 + 30 * 8,
      12: 1080 + 30 * 9,
    };
    this.loadingTurn = true;
    this.activityApi
      .turntablerun(this.wheelInfo.activityCode)
      .pipe(
        switchMap(res => {
          this.loadingTurn = false;
          if (!res?.data) {
            // 活动规则没达到条件
            if (res?.message) {
              return of(res.message);
            }
            // 活动失效
            return of(undefined);
          } else if (res?.data?.snNo > 0) {
            // 请求成功
            this.play = true;
            return of(res.data).pipe(delay(600));
          } else {
            // 接口失败
            return of(null);
          }
        }),
        switchMap(wheelPrize => {
          if (wheelPrize) {
            if (typeof wheelPrize !== 'string') {
              this.wheelWrapElement.nativeElement.style.transform = `rotate(-${degMap[wheelPrize.snNo]}deg)`;
              this.wheelWrapElement.nativeElement.style.transition = `transform 3s cubic-bezier(0,.47,.31,1.03)`;
              return of(wheelPrize).pipe(delay(3500));
            } else {
              return of(wheelPrize);
            }
          } else {
            return of(wheelPrize);
          }
        }),
      )
      .subscribe(res => {
        if (res) {
          if (typeof res === 'string') {
            // 活动规则没达到条件
            this.loadingTurn = false;
            this.toast.show({
              message: res,
              title: this.localeService.getValue('hint'),
              type: 'fail',
            });
            return;
          }
          const prize = this.prizeInfos[res.snNo - 1];
          if (prize.prizeType === 99) {
            // 未中奖
            this.status = 2;
            this.prize = undefined;
          } else {
            // 中奖了
            this.status = 1;
            this.prize = prize;
            // 更新 非粘性页面
            if (prize?.prizeType === 8) this.cardCenterService._reloadNonSticky.set(true);
          }
        } else {
          if (res === undefined) {
            // 活动失效
            this.deActive();
          } else {
            // 接口失败
            this.toast.show({
              message: this.localeService.getValue('req_excep') + this.localeService.getValue('try_later'),
              title: '',
              type: 'fail',
            });
          }
        }
      });
  }

  /**活动失效 */
  deActive() {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('hint'),
        buttons: [{ text: this.localeService.getValue('confirm_button'), primary: true }],
        description: this.localeService.getValue('act_lapse_p_desc'),
        callback: () => {
          this.getWheelInfo();
        },
      },
    });
  }

  /** 计时器订阅 */
  timerSubscription!: Subscription;

  /** 开始倒数计时 */
  onStartClock() {
    this.timerSubscription?.unsubscribe();
    this.timeDuration = moment.duration(this.wheelCondition.nextTime - Date.now());
    this.timerSubscription = timer(0, 1000)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.timeDuration.subtract(1000, 'ms');
        if (this.timeDuration.asMilliseconds() <= 0) {
          this.timerSubscription?.unsubscribe();
          this.timeEnd$.next(true);
        } else {
          this.timeData = {
            day: this.timeDuration.days(),
            hour: this.timeDuration.hours(),
            min: this.timeDuration.minutes(),
            sec: this.timeDuration.seconds(),
          };
        }
      });
  }

  goToGame() {
    this.dialogRef.close();
    this.router.navigateByUrl(`${this.appService.languageCode}/casino/category/${this.originalLabelID}`);
  }

  goToAgain() {
    this.checkCanTurn();
    this.status = 0;
    this.play = false;
    this.wheelWrapElement.nativeElement.style.transform = `rotate(0deg)`;
    this.wheelWrapElement.nativeElement.style.transition = 'none';
  }

  jumpToLogin() {
    this.dialogRef.close();
    this.appService.jumpToLogin();
  }

  ngOnDestroy(): void {
    this.audioService.closeWheelAudio();
  }

  checkSize(el1: HTMLElement, el2: HTMLElement) {
    setTimeout(() => {
      const el1w = el1.offsetWidth;
      const el2w = el2.offsetWidth;
      if (el2w > el1w) {
        try {
          // @ts-ignore
          el2.style.zoom = el1w / el2w - 0.01;
        } catch (error) {
          /* empty */
        }
      }
    });
  }
}
