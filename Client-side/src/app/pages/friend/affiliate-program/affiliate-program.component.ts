import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { FriendService } from '../friend.service';

@UntilDestroy()
@Component({
  selector: 'app-affiliate-program',
  templateUrl: './affiliate-program.component.html',
  styleUrls: ['./affiliate-program.component.scss'],
})
export class AffiliateProgramComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private friendService: FriendService,
    private localeService: LocaleService
  ) {}

  /** 传入模版文字数据数据 */
  textData = {
    invite: this.localeService.getValue('agent_a'),
    textBrand: this.localeService.getValue('agent_b'),
    footerRedirect: 'referral/partner',
    footerHeadTitle: this.localeService.getValue('sup_partner'),
    footerBtnName: this.localeService.getValue('co_soon'),
    h5RightTitle: this.localeService.getValue('con_ce'),
    h5FormTitle: this.localeService.getValue('friends_t'),
    h5HeadTitle: this.localeService.getValue('agent_p'),
  };

  /** 导航 */
  navItemList: any[] = [
    { name: this.localeService.getValue('first_deposit_guid') },
    { name: this.localeService.getValue('mem_manage') },
    { name: this.localeService.getValue('affiliate_r') },
    { name: this.localeService.getValue('game_record') },
    { name: this.localeService.getValue('user_act00') },
  ];

  isH5!: boolean;

  isActiveSubTheme: number = 0; //激活当前导航

  commissionRatio: number = 0; //当月比例

  circlePercentage!: number; //指针转动

  isShowHomePage: boolean = true; //显示主页面

  defaultLink: any = {}; //默认推荐链接

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService.isShowNav$.pipe(untilDestroyed(this)).subscribe(show => (this.isShowHomePage = show));
    this.friendService.defaultLinkData$
      .pipe(
        untilDestroyed(this),
        filter(x => Object.values(x).length > 0)
      )
      .subscribe(data => {
        this.defaultLink = data;
        this.commissionRatio = data.commissionRatio;
        this.circlePercentage = Number(data.commissionRatio).subtract(1.8).minus(45);
      });
  }

  /**
   * @param idx
   * @onSelectedSubTheme 切换导航 和 主题页面
   * @idx 下标
   */
  onSelectedSubTheme(idx: number): void {
    this.isActiveSubTheme = idx;
  }
}
