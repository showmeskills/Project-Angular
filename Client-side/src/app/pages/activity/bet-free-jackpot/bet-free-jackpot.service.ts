import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { FreeJackpotApi } from 'src/app/shared/apis/free-jackpot.api';
import { BonusSetting } from 'src/app/shared/interfaces/free-jackpot.interface';
@Injectable({
  providedIn: 'root',
})
export class BetFreeJackpotService {
  constructor(private freeJackpotApi: FreeJackpotApi, private appService: AppService, private router: Router) {}

  betFreeData = {
    maxJackPot: 100000,
    infoBase: {
      correctScorePoints: 5,
      winLossPoints: 2,
      overUnderPoints: 1,
      winLoss: false,
      overUnder: false,
      sbv: 2.5,
      optionAmount: 8,
    },
  };

  logined!: boolean;

  /** 活动是否进行中 */
  isProcessing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  infoList: BonusSetting[] = [
    {
      activityId: 0,
      bonus: 500,
      currency: 'USDT',
      rankingMax: 1,
      rankingMin: 1,
    },
    {
      activityId: 0,
      bonus: 250,
      currency: 'USDT',
      rankingMax: 2,
      rankingMin: 2,
    },
    {
      activityId: 0,
      bonus: 150,
      currency: 'USDT',
      rankingMax: 3,
      rankingMin: 3,
    },
    {
      activityId: 0,
      bonus: 75,
      currency: 'USDT',
      rankingMax: 4,
      rankingMin: 4,
    },
    {
      activityId: 0,
      bonus: 25,
      currency: 'USDT',
      rankingMax: 5,
      rankingMin: 5,
    },
  ];

  activitiesNo: string = '1234';

  guessActivitiesList: any;

  getActivitiesIs() {
    this.router.navigate([this.appService.languageCode, 'activity', 'betfreejackpot', 'now']);
  }

  isActivitiesNo(activityCode: string) {
    this.freeJackpotApi.getActivityBaseInfo(activityCode).subscribe(res => {
      if (res?.data) {
        if (res.data.status === 1) {
          this.router.navigate([this.appService.languageCode, 'activity', 'betfreejackpot', 'now']);
        } else {
          this.router.navigate([this.appService.languageCode, 'promotions', 'offer', activityCode]);
        }
      }
    });
  }
}
