import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { HelpCenterService } from '../../help-center/help-center.service';

@Component({
  selector: 'app-download-page',
  templateUrl: './download-page.component.html',
  styleUrls: ['./download-page.component.scss'],
})
export class DownloadPageComponent implements OnInit {
  constructor(private helpCenterService: HelpCenterService, private localeService: LocaleService) {}

  ngOnInit() {}
  /**
   * 点击打开详情页面
   *
   * @item 列表属性
   */
  toDetailPage() {
    const pageInfor = {
      articleCode: 'google2FA',
      categoryCode: 'FAQ',
      categoryId: 1029837943259205,
      categoryParentId: 0,
      id: 1155500681969733,
      title: this.localeService.getValue(`bind_google_problem`),
    };
    this.helpCenterService.jumpToDetailPage(pageInfor);
  }
  /**
   * 跳转到对应store下载 验证器
   *
   * @param appStore url 地址
   */
  jumpToGoogleAuthStore(appStore: string) {
    window.open(appStore, '_blank');
  }
}
