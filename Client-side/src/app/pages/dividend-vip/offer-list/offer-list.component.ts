import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { ActivityNavList, RespActivityDetail } from 'src/app/shared/interfaces/bonus.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { BetFreeJackpotService } from '../../activity/bet-free-jackpot/bet-free-jackpot.service';
import { DividendVipService } from '../dividend-vip.service';

@UntilDestroy()
@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
})
export class OfferListComponent implements OnInit, OnDestroy {
  constructor(
    private layout: LayoutService,
    private dividendVipService: DividendVipService,
    public appService: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private betFreeJackpotService: BetFreeJackpotService,
    private dataCollectionService: DataCollectionService,
  ) {}

  isH5!: boolean;

  /** 活动导航栏 */
  navList: ActivityNavList[] = [];

  /** 活动列表 */
  activitiesList: RespActivityDetail[] = [];

  /** 所有活动 */
  allActivitiesList: RespActivityDetail[] = [];

  isActiveIdx: number = 0;

  loading: boolean = false;

  logined!: boolean;

  ngOnInit(): void {
    this.dataCollectionService.setEnterTime('offerlist');
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(v => {
      this.logined = !!v;
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.getActivitiesList();
  }

  /** 获取活动列表 */
  getActivitiesList() {
    this.loading = true;
    this.dividendVipService.getActivitiesList({ equipment: 'Web' }).subscribe((data: any) => {
      this.loading = false;
      this.navList = data?.list || [];
      this.allActivitiesList = data?.list || [];
      this.activitiesList = data?.list[this.isActiveIdx]?.list || [];
    });
  }

  /**
   * 导航
   *
   * @param i 下标
   */
  onSelectNatItem(i: number) {
    this.isActiveIdx = i;
    this.activitiesList = this.allActivitiesList[i]?.list || [];
  }

  ngOnDestroy(): void {
    this.dataCollectionService.addPoint({
      eventId: 30018,
      actionValue1: this.dataCollectionService.getTimDiff('offerlist'),
    });
  }

  /**
   * 导航
   *
   * @param item 列表内容
   */
  getRouterLink(item: any) {
    if (item.labelCode === 'guessing') {
      this.betFreeJackpotService.isActivitiesNo(item.activitiesNo);
    } else {
      this.router.navigate([this.appService.languageCode, 'promotions', 'offer', item.activitiesNo]);
    }
  }
  /**
   * 根据参数自动选中
   *
   * @param item 列表内容
   */
  onSelectActivities() {
    this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe((e: any) => {
      if (e.select) {
        const index = this.allActivitiesList.findIndex(x => x.labelCode === e.select);
        if (index > -1) this.onSelectNatItem(index);
      }
    });
  }
}
