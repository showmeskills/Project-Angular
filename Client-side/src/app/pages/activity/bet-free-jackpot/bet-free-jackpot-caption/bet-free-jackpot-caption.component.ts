import { Component, OnInit } from '@angular/core';
import { RespActivityDetail } from 'src/app/shared//interfaces/bonus.interface';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { StandardByCode } from 'src/app/shared/interfaces/helpCenter.interface';
import { BetFreeJackpotService } from '../bet-free-jackpot.service';

const GUESS_ACTIVITY_DESCRIPTION = 'guess_activity_description';
@Component({
  selector: 'app-bet-free-jackpot-caption',
  templateUrl: './bet-free-jackpot-caption.component.html',
  styleUrls: ['./bet-free-jackpot-caption.component.scss'],
})
export class BetFreeJackpotCaptionComponent implements OnInit {
  constructor(
    private helpCenterApi: HelpCenterApis,
    private bounsApi: BonusApi,
    private betFreeJackpotService: BetFreeJackpotService
  ) {}

  detailData!: RespActivityDetail | StandardByCode | null;

  appLoading!: boolean;

  get activitiesNo() {
    return this.betFreeJackpotService.activitiesNo;
  }

  ngOnInit() {
    this.appLoading = true;
    if (this.activitiesNo) {
      this.getOfferDetail(this.activitiesNo);
    } else {
      this.getRoutineDetail(GUESS_ACTIVITY_DESCRIPTION);
    }
  }

  getOfferDetail(bonusActivitiesNo: string) {
    this.bounsApi.getActivityDetail({ bonusActivitiesNo, equipment: 'Web' }).subscribe(res => {
      this.appLoading = false;
      this.detailData = res;
      if (!this.detailData?.content) {
        this.getRoutineDetail(GUESS_ACTIVITY_DESCRIPTION);
      }
    });
  }

  getRoutineDetail(bonusActivitiesNo: string) {
    this.helpCenterApi.getStandardByCode(bonusActivitiesNo).subscribe(res => {
      this.appLoading = false;
      if (res?.data) {
        this.detailData = res.data;
      }
    });
  }
}
