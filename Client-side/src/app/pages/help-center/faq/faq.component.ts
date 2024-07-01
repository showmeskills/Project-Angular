import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { HelpCenterService } from './../help-center.service';

@UntilDestroy()
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private helpCenterApi: HelpCenterApis,
    private helpCenterService: HelpCenterService,
    private localeService: LocaleService,
    private appService: AppService,
    private nativeAppService: NativeAppService
  ) {}

  /**@themeTitle 主题 */
  themeTitle: string = this.localeService.getValue('faq');
  isH5!: boolean;
  isLoading!: boolean; //加载动画
  faqList: any[] = []; // 所有主题
  hotFaqBeforeThreeItems: any[] = []; // 热门问题前三个
  hotFaqAfterThreeItems: any[] = []; // 热门问题后三个

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.helpCenterService.faqList$
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
        this.faqList = data;
      });
    this.loadData();
  }

  //初始化数据
  loadData() {
    this.isLoading = true;
    this.helpCenterApi.getHotFaq({ ClientType: 'Web', isFaq: true }).subscribe(hotFaq => {
      const len = Math.ceil(hotFaq.length / 2);
      this.hotFaqBeforeThreeItems = hotFaq.slice(0, len);
      this.hotFaqAfterThreeItems = hotFaq.slice(len, hotFaq.length);
      this.isLoading = false;
    });
  }

  //去详情页
  onGotoDetailsPage(item: any): void {
    this.helpCenterService.jumpToDetailPage(item);
  }

  /** 客服 */
  onLineService() {
    if (this.appService.isNativeApp) {
      this.nativeAppService.setNativeOlService();
    } else {
      this.appService.toOnLineService$.next(true);
    }
  }
}
