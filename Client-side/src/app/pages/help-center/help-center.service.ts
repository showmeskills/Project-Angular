import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class HelpCenterService {
  constructor(
    private appService: AppService,
    private router: Router,
    private localeService: LocaleService,
    private toast: ToastService
  ) {}
  /** 常见问题 */
  faqList$: BehaviorSubject<any> = new BehaviorSubject([]);

  /** 公告中心 */
  announcementList$: BehaviorSubject<any> = new BehaviorSubject([]);

  /** 最近发布文章 */
  latestArtilceList$: BehaviorSubject<any> = new BehaviorSubject([]);

  /** 热门文章 */
  hotArtilceList$: BehaviorSubject<any> = new BehaviorSubject([]);

  /**最新公告 */
  latestAnnouncement$: BehaviorSubject<any> = new BehaviorSubject([]);

  /** 常见问题List订阅 */
  faqArticleListById$!: Observable<any>;

  /**
   * 去除p 标签
   *
   * @param str string html
   * @returns
   */
  deleteHtmlPTag(str: string) {
    str = str.replace(/<.*?>/gi, '');
    return str;
  }

  /**
   * 详情页面
   *
   * @param item
   * @item list中的数据
   */
  jumpToDetailPage(item: any) {
    this.router.navigate(
      [this.appService.languageCode, 'help-center', item.categoryCode.toLowerCase(), item.categoryId],
      {
        queryParams: {
          articleCode: item.id,
        },
      }
    );
  }

  checkSearchContent() {
    this.toast.show({
      message: this.localeService.getValue('sen_ee'),
      title: this.localeService.getValue('hint'),
      type: 'fail',
    });
  }
}
