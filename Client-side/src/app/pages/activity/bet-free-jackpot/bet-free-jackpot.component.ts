import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { FreeJackpotApi } from 'src/app/shared/apis/free-jackpot.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { ActivityBaseInfo, BonusSetting } from 'src/app/shared/interfaces/free-jackpot.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ActivityService } from '../activity.service';
import { BetFreeJackpotService } from './bet-free-jackpot.service';
@UntilDestroy()
@Component({
  selector: 'app-bet-free-jackpot',
  templateUrl: './bet-free-jackpot.component.html',
  styleUrls: ['./bet-free-jackpot.component.scss'],
})
export class BetFreeJackpotComponent implements OnInit {
  constructor(
    private freeJackpotApi: FreeJackpotApi,
    public betFreeJackpotService: BetFreeJackpotService,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService,
    private activityService: ActivityService,
  ) {}

  loadingList: boolean = true;

  baseInfo?: ActivityBaseInfo;

  baseSetting: BonusSetting[] = [];

  /** 大奖 */
  maxJackPot: number = 100000;

  /** 保底排名 */
  maxRankNum: number = 5;

  /** 保底奖金 */
  maxRankBonus: number = 1000;

  logined!: boolean;

  appLoading!: boolean;

  timeData: any = {
    leftd: '0',
    lefth: '0',
    leftm: '0',
    lefts: '0',
  };

  timerCount: any = null;

  activitiesNo: string = '';

  titleText: string = this.localeService.getValue('usdt_bk_jop_new_tip', this.maxRankBonus, this.maxRankNum);

  btnText: string = this.localeService.getValue('free_to_pt_jop');

  ngOnInit() {
    this.appLoading = true;
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      // 判断是否登录
      this.logined = !!v;
      this.activityService.getRecentActivity().subscribe(res => {
        this.appLoading = false;
        if (res?.data) {
          //判断是否有活动，并取得活动id
          if (res.data.haveRunningActivity === false) {
            this.activitiesNo = res.data.recentActivityId;
            this.betFreeJackpotService.activitiesNo = this.activitiesNo;
          } else {
            this.activitiesNo = res.data.runningActivityId;
            this.betFreeJackpotService.activitiesNo = this.activitiesNo;
          }
          // 判断是否有activitiesNo
          if (!this.activitiesNo) {
            this.betFreeJackpotService.isProcessing$.next(false);
            this.router.navigate([this.appService.languageCode, 'activity', 'betfreejackpot', 'now']);
            return;
          }
          // 判断登录状态
          if (!this.logined) {
            this.betFreeJackpotService.isProcessing$.next(false);
            this.router.navigate([this.appService.languageCode, 'activity', 'betfreejackpot', 'caption']);
            return;
          }
          this.loadData();
        }
      });
    });
  }

  goLogin() {
    if (this.appService.isNativeApp) {
      this.nativeAppService.setNoLogin();
    } else {
      this.appService.jumpToLogin();
    }
  }

  loadData() {
    this.appLoading = true;
    forkJoin([
      this.freeJackpotApi.getActivityBaseInfo(this.activitiesNo),
      this.freeJackpotApi.getBonusSetting(this.activitiesNo),
    ]).subscribe(([resInfo, resSetting]) => {
      this.appLoading = false;
      if (resInfo?.data) {
        this.baseInfo = resInfo.data;
        this.betFreeJackpotService.betFreeData.infoBase.sbv = this.baseInfo.sbv;
        this.betFreeJackpotService.betFreeData.infoBase.winLoss = this.baseInfo.winLoss;
        this.betFreeJackpotService.betFreeData.infoBase.overUnder = this.baseInfo.overUnder;
        // 判断活动是否进行中
        if (this.baseInfo.status !== 1) {
          this.betFreeJackpotService.isProcessing$.next(false);
          this.router.navigate([this.appService.languageCode, 'activity', 'betfreejackpot', 'now']);
          return;
        }
        this.betFreeJackpotService.isProcessing$.next(true);

        if (this.baseInfo.isJoined) {
          this.btnText = this.localeService.getValue('free_to_see_jop');
        } else {
          this.btnText = this.localeService.getValue('free_to_pt_jop');
        }
        // 获取并判断时间
        if (Number(this.baseInfo.endTime) < new Date().getTime()) return;
        this.timerCount = setInterval(() => {
          this.ontime();
        }, 1000);
      }

      if (resSetting?.data) {
        this.onData(resSetting.data);
      }
    });
  }

  /** 加载倒计时 */
  ontime() {
    if (!this.baseInfo) return;
    // 开始时间
    const nowtime = new Date();
    // 结束时间
    const endtime = Number(this.baseInfo.endTime);
    const lefttime = endtime - nowtime.getTime();
    if (lefttime <= 0) {
      // 倒计时结束并清零
      clearTimeout(this.timerCount);
      this.timeData.leftd = 0;
      this.timeData.lefth = 0;
      this.timeData.leftm = 0;
      this.timeData.lefts = 0;
      this.betFreeJackpotService.isProcessing$.next(false);
      return;
    }
    this.timeData.leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24));
    this.timeData.lefth = Math.floor((lefttime / (1000 * 60 * 60)) % 24);
    this.timeData.leftm = Math.floor((lefttime / (1000 * 60)) % 60);
    this.timeData.lefts = Math.floor((lefttime / 1000) % 60);
  }
  /**
   * 处理需要的数据
   *
   * @param list 列表内容
   */
  onData(list: BonusSetting[]) {
    if (!this.baseInfo) return;
    this.baseSetting = [];
    this.maxRankNum = 0;
    this.maxRankBonus = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].rankingMax === 0 && list[i].rankingMin === 0) {
        this.maxJackPot = list[i].bonus;
      } else {
        this.maxRankNum = this.maxRankNum < list[i].rankingMax ? list[i].rankingMax : this.maxRankNum;
        this.maxRankBonus = this.maxRankBonus + list[i].bonus;
        this.baseSetting.push(list[i]);
      }
    }

    this.titleText = this.localeService.getValue('usdt_bk_jop_new_tip', this.maxRankBonus, this.maxRankNum);
    // 共享服务注入数据
    this.betFreeJackpotService.infoList = this.baseSetting;
    this.betFreeJackpotService.betFreeData.infoBase = this.baseInfo;
    this.betFreeJackpotService.betFreeData.maxJackPot = this.maxJackPot;
  }
}
