import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { Subject, Subscription, combineLatest, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { ContestActivitiesItem, MyRank } from 'src/app/shared/interfaces/bonus.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DailyRacesService } from '../daily-races.service';

@UntilDestroy()
@Component({
  selector: 'app-races-popup-up',
  templateUrl: './races-popup-up.component.html',
  styleUrls: ['./races-popup-up.component.scss'],
})
export class RacesPopupUpComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<RacesPopupUpComponent>,
    private bounsApi: BonusApi,
    private appService: AppService,
    private toast: ToastService,
    private localeService: LocaleService,
    public dailyRacesService: DailyRacesService,
    @Inject(MAT_DIALOG_DATA) public data: { bonusActivitiesNo: string },
  ) {}

  myRankDetail?: MyRank | ContestActivitiesItem;
  loading!: boolean;
  rankloading!: boolean;

  /** 计时器订阅 */
  timerSubscription!: Subscription;

  /** 剩余时间 */
  remainingTime = {
    day: 0,
    hour: 0,
    min: 0,
    sec: 0,
  };

  baseInfoReady$: Subject<boolean> = new Subject();

  /** 所有接口是否准备好了 */
  ready: boolean = false;

  /** 是否已经登录 */
  isLogin!: boolean;

  ngOnInit(): void {
    this.loading = true;

    // 订阅登录
    combineLatest([
      this.appService.userInfo$.pipe(
        first(v => {
          this.isLogin = !!v;
          return !!v;
        }),
      ),
      this.baseInfoReady$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.getMyRankById();
      });

    if (this.data?.bonusActivitiesNo) {
      // 有 bonusActivitiesNo ,默认当已登录
      this.getMyRankById();
    } else {
      // 没有传入bonusActivitiesNo , 主动获取，并选择列表里的第一个
      this.dailyRacesService.getDailyTitles().subscribe(result => {
        if (result.title.length > 0) {
          this.myRankDetail = result.title[0];
          this.onStartClock();
          this.loading = false;
          this.baseInfoReady$.next(true);
          // 未登录时 显示 倒数计时弹窗
          if (!this.isLogin) this.ready = true;
        } else {
          // 无有效活动
          this.toast.show({ message: this.localeService.getValue('waiting'), type: 'fail' });
          this.close();
        }
      });
    }
  }

  /** 开始倒数计时 */
  onStartClock() {
    this.timerSubscription?.unsubscribe();
    if (!this.myRankDetail) return;
    let remainingTime = this.myRankDetail.remainingTime;
    this.timerSubscription = interval(1000)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        remainingTime -= 1000;
        if (remainingTime <= 0) this.timerSubscription?.unsubscribe();
        this.remainingTime.day = moment.duration(remainingTime).days();
        this.remainingTime.hour = moment.duration(remainingTime).hours();
        this.remainingTime.min = moment.duration(remainingTime).minutes();
        this.remainingTime.sec = moment.duration(remainingTime).seconds();
      });
  }

  /** 关闭弹窗 */
  close() {
    this.timerSubscription?.unsubscribe();
    this.dialogRef.close();
    this.ready = false;
  }

  /** 获取用户数据 */
  getMyRankById() {
    this.rankloading = true;
    this.bounsApi
      .getMyRankById({ activitiesNo: this.data?.bonusActivitiesNo || this.myRankDetail?.activitiesNo || '' })
      .subscribe(data => {
        this.rankloading = false;
        this.loading = false;
        let myRankDetail!: MyRank;
        if (data) {
          if (data?.isClose) {
            this.toast.show({ message: this.localeService.getValue('activity_close'), type: 'fail' });
            this.close();
          } else {
            if (data?.kycCheck) {
              if (data.bonusInfo) {
                const bonusInfo = {
                  ...data.bonusInfo,
                  rankNumber: Number(data.bonusInfo?.rankNumber || 0) <= 0 ? 0 : `${data.bonusInfo.rankNumber}th`,
                  bonusUsdtMoney: this.toParseInt(data.bonusInfo?.bonusUsdtMoney || 0),
                };
                myRankDetail = {
                  ...data,
                  bonusInfo,
                  isJoined: true,
                };
              } else {
                const bonusInfo = {
                  rankNumber: this.localeService.getValue('apply_rank'),
                  rankMoney: 0,
                  bonusMoney: 0,
                  bonusCurrency: 'USDT',
                };
                myRankDetail = {
                  ...data,
                  isJoined: false,
                  bonusInfo,
                };
              }
              this.myRankDetail = myRankDetail;
              this.onStartClock();
              this.ready = true;
            } else {
              this.toast.show({ message: this.localeService.getValue('not_support_contest'), type: 'fail' });
              this.close();
            }
          }
        }
      });
  }

  /**
   * 整数去掉8位小数
   *
   * @param num
   * @num 数字或者字符类型
   */
  toParseInt(num: string | number): any {
    const data = num.toString();
    if (Number(data) % 1 === 0) {
      return Number(num) * 1;
    } else {
      return num;
    }
  }
}
