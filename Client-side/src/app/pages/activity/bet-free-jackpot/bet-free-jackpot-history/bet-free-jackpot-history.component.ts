import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { FreeJackpotApi } from 'src/app/shared/apis/free-jackpot.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { HistoryDetail, HistoryList } from 'src/app/shared/interfaces/free-jackpot.interface';
import { BetFreeJackpotService } from '../bet-free-jackpot.service';
@UntilDestroy()
@Component({
  selector: 'app-bet-free-jackpot-history',
  templateUrl: './bet-free-jackpot-history.component.html',
  styleUrls: ['./bet-free-jackpot-history.component.scss'],
})
export class BetFreeJackpotHistoryComponent implements OnInit {
  constructor(
    private freeJackpotApi: FreeJackpotApi,
    private betFreeJackpotService: BetFreeJackpotService,
    private appService: AppService
  ) {}

  get betFreeData() {
    return this.betFreeJackpotService.betFreeData;
  }

  logined!: boolean;

  events: HistoryDetail[] = [];

  btnList: HistoryList[] = [];

  /** 是否显示标题 */
  isTitle: boolean = true;

  /** 是否显示独赢 */
  correctScore: number = 0;

  /** 是否显示独赢 */
  isWinLoss!: boolean;

  /** 独赢 */
  winLoss: number = 0;

  /** 大小 */
  overUnder: number = 0;

  /** 是否显示大小 */
  isOverUnder!: boolean;

  appLoading!: boolean;

  /** 当前选中的语言 */
  selectedLang: string = this.appService.languageCode;

  /** 当前选中的ActivityCode */
  currentActivityCode: string = '';

  ngOnInit() {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      // 判断是否登录
      this.logined = !!v;
      // 判断登录状态
      if (!this.logined) {
        return;
      }
      this.appLoading = true;
      this.isWinLoss = this.betFreeData.infoBase.winLoss;
      this.isOverUnder = this.betFreeData.infoBase.overUnder;
      this.freeJackpotApi.getHistoryDetailWithList(5).subscribe(res => {
        this.appLoading = false;
        if (res?.data) {
          this.btnList = res.data.activityInfos;
          this.events = res.data.userDetails ?? [];
          this.currentActivityCode = res.data.currentActivityCode;
          this.onData(this.events);
        }
      });
    });
  }

  onData(events: any) {
    for (let i = 0; i < events.length; i++) {
      if (events[i].correctScore) {
        this.correctScore++;
      }

      if (events[i].winLoss) {
        this.winLoss++;
      }

      if (events[i].overUnder) {
        this.overUnder++;
      }

      if (events[i].isSettled === false) {
        this.isTitle = false;
      }

      for (let j = 0; j < events[i].teamLangs.length; j++) {
        // 适配当前语言
        if (events[i].teamLangs[j].lang === this.selectedLang) {
          events[i].home = events[i].teamLangs[j].home;
          events[i].away = events[i].teamLangs[j].away;
        }
      }
    }
  }
  onMoreList(activityCode: string) {
    if (this.currentActivityCode === activityCode) return;
    this.currentActivityCode = activityCode;
    this.events = [];
    this.appLoading = true;
    this.winLoss = 0;
    this.overUnder = 0;
    this.correctScore = 0;
    this.isTitle = true;
    this.freeJackpotApi.getHistoryDetail(activityCode).subscribe(res => {
      this.appLoading = false;
      if (res?.data) {
        this.events = res.data;
        this.onData(this.events);
      }
    });
  }

  scoreMinus(a: number, b: number) {
    return Math.abs(Number(a).minus(Number(b)));
  }
}
