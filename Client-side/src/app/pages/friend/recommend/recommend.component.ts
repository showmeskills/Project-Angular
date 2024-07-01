import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { FriendService } from '../friend.service';

@UntilDestroy()
@Component({
  selector: 'app-recommend',
  templateUrl: './recommend.component.html',
  styleUrls: ['./recommend.component.scss'],
})
export class RecommendComponent implements OnInit, OnDestroy {
  constructor(
    private layout: LayoutService,
    public location: Location,
    private friendService: FriendService,
    private localeService: LocaleService,
    private dataCollectionService: DataCollectionService
  ) {}

  /**@textData 传入模版文字数据数据 */
  textData = {
    invite: this.localeService.getValue('invite_f'),
    textBrand: this.localeService.getValue('invite_f_a'),
    footerRedirect: 'referral/application/affiliate',
    footerHeadTitle: this.localeService.getValue('agent_p'),
    footerBtnName: this.localeService.getValue('join_now'),
    h5RightTitle: this.localeService.getValue('concept'),
    h5FormTitle: this.localeService.getValue('defa_rec'),
    h5HeadTitle: this.localeService.getValue('concept'),
  };

  /**@navItemList 导航 */
  navItemList: any[] = [
    { name: this.localeService.getValue('aff_re_t') },
    { name: this.localeService.getValue('recom_retu00') },
    { name: this.localeService.getValue('user_act00') },
  ];

  /**@isActiveSubTheme 当前激活的子主题 */
  isActiveSubTheme: number = 0;

  isH5!: boolean;

  /**@defaultLink 默认推荐链接 */
  defaultLink: any = {};

  ngOnInit(): void {
    this.dataCollectionService.setEnterTime('referralFriend');
    this.friendService.defaultLinkData$
      .pipe(untilDestroyed(this))
      .subscribe(defaultLink => (this.defaultLink = defaultLink));
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  /**
   * @param idx
   * @onSelectedSubTheme 切换导航 和 主题页面
   * @idx 下标
   */
  onSelectedSubTheme(idx: number): void {
    this.isActiveSubTheme = idx;
  }

  afterCopyInviteUrl() {
    this.dataCollectionService.addPoint({ eventId: 30016 });
  }

  ngOnDestroy(): void {
    this.dataCollectionService.addPoint({
      eventId: 30014,
      actionValue1: this.dataCollectionService.getTimDiff('referralFriend'),
      actionValue2: 1,
    });
  }
}
