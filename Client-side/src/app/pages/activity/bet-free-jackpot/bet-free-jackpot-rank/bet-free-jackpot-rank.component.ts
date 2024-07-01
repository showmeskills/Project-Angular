import { Component, OnInit } from '@angular/core';
import { FreeJackpotApi } from 'src/app/shared/apis/free-jackpot.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { HistoryList, LeaderUserRank } from 'src/app/shared/interfaces/free-jackpot.interface';
import { BetFreeJackpotService } from '../bet-free-jackpot.service';

@Component({
  selector: 'app-bet-free-jackpot-rank',
  templateUrl: './bet-free-jackpot-rank.component.html',
  styleUrls: ['./bet-free-jackpot-rank.component.scss'],
})
export class BetFreeJackpotRankComponent implements OnInit {
  constructor(private freeJackpotApi: FreeJackpotApi, private betFreeJackpotService: BetFreeJackpotService) {}

  get activitiesNo() {
    return this.betFreeJackpotService.activitiesNo;
  }

  btnList: HistoryList[] = [];

  selfdata!: LeaderUserRank;

  maindata: LeaderUserRank[] = [];

  leaderboardDetails: LeaderUserRank[] = [];

  loading: boolean = true;

  /** 当前选中的ActivityCode */
  currentActivityCode: string = '';

  /** 分页数据 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 15,
    total: 0,
  };

  ngOnInit() {
    this.freeJackpotApi.getLeaderBoardList(5).subscribe(res => {
      if (res?.data) {
        this.btnList = res.data.activityInfos || [];
        if (this.btnList.length > 0) {
          this.currentActivityCode = this.btnList[0].activityCode;
        } else {
          this.currentActivityCode = this.activitiesNo;
        }
        this.loadData();
      }
    });
  }

  loadData() {
    this.loading = true;
    this.freeJackpotApi
      .getLeaderBoard(this.currentActivityCode, this.paginator.pageSize, this.paginator.page)
      .subscribe(res => {
        this.loading = false;
        if (res?.data) {
          this.paginator.total = res.data.totalAmount;
          this.selfdata = res.data.userRank;
          this.leaderboardDetails = res.data.leaderboardDetails || [];
          this.maindata.push(...this.leaderboardDetails);
        }
      });
  }

  reset() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.maindata = [];
  }

  checkToLoad(activityCode: string) {
    if (this.currentActivityCode === activityCode) return;
    this.currentActivityCode = activityCode;
    this.reset();
    this.loadData();
  }
}
