import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map } from 'rxjs/operators';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { HelpCenterService } from './../help-center.service';
@UntilDestroy()
@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
})
export class AnnouncementComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private helpCenterService: HelpCenterService,
    private localeService: LocaleService
  ) {}

  themeTitle: string = this.localeService.getValue('ann_center');
  isH5!: boolean;
  accouncementList: any[] = []; // 公告数组
  isLoading!: boolean; //加载动画
  newArticleListBeforeFourItems: any[] = []; //左边文章list
  newArticleListAfterFourItems: any[] = []; //右边文章list

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.helpCenterService.announcementList$
      .pipe(
        untilDestroyed(this),
        map(x => {
          return x.map((item: any) => {
            return {
              ...item,
              description: this.helpCenterService.deleteHtmlPTag(item.description),
            };
          });
        })
      )
      .subscribe(data => {
        this.accouncementList = data;
      });

    this.helpCenterService.latestAnnouncement$
      .pipe(
        untilDestroyed(this),
        filter(x => x.length > 0)
      )
      .subscribe(data => {
        const len = Math.ceil(data.length / 2);
        this.newArticleListBeforeFourItems = data.slice(0, len);
        this.newArticleListAfterFourItems = data.slice(len, data.length);
      });
  }

  //去详情页
  onGotoDetailsPage(item: any): void {
    this.helpCenterService.jumpToDetailPage(item);
  }
}
