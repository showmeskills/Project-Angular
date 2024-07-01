import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { HelpCenterService } from './help-center.service';
@UntilDestroy()
@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss'],
})
export class HelpCenterComponent implements OnInit {
  constructor(private helpCenterApi: HelpCenterApis, private helpCenterService: HelpCenterService) {}

  ngOnInit(): void {
    combineLatest([
      this.helpCenterApi.getCategoryInfo({ CategoryType: 'FAQ', IsChchildren: true }),
      this.helpCenterApi.getCategoryInfo({ CategoryType: 'Announcement', IsChchildren: true }),
      this.helpCenterApi.getLatestArticle({ ClientType: 'Web', isAnnouncement: false }),
      this.helpCenterApi.getHotFaq({ ClientType: 'Web', isFaq: false }),
      this.helpCenterApi.getLatestArticle({ ClientType: 'Web', isAnnouncement: true }),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([faq, announcement, lastestArticle, hotArtilceList, latestAnnouncement]) => {
        this.helpCenterService.faqList$.next(faq);
        this.helpCenterService.announcementList$.next(announcement);
        this.helpCenterService.latestArtilceList$.next(lastestArticle);
        this.helpCenterService.hotArtilceList$.next(hotArtilceList);
        this.helpCenterService.latestAnnouncement$.next(latestAnnouncement);
      });
  }
}
