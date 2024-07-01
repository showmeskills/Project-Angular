import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { HelpCenterService } from '../help-center.service';

@UntilDestroy()
@Component({
  selector: 'app-help-center-home',
  templateUrl: './help-center-home.component.html',
  styleUrls: ['./help-center-home.component.scss'],
})
export class HelpCenterHomeComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private helpCenterService: HelpCenterService
  ) {}

  isH5!: boolean;
  selfServiceList: any[] = [
    { name: 'reset_uname', url: 'assets/images/help-center/reset-username.svg' },
    { name: 'reset_pwd', url: 'assets/images/help-center/reset-pwd.svg' },
    { name: 'reset_veri', url: 'assets/images/help-center/reset-phone-verify.svg' },
    { name: 'reset_auth', url: 'assets/images/help-center/reset-2fa.svg' },
  ]; // 自助服务数组

  latestArtilceList: any[] = []; // 最新发布文章
  hotArticleList: any[] = []; //热门文章列表
  userInfor: any; //用户信息

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      this.userInfor = x ?? ({} as any);
    });
    this.helpCenterService.latestArtilceList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.latestArtilceList = data;
    });
    this.helpCenterService.hotArtilceList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.hotArticleList = data;
    });
  }

  //主页去详情
  onToDetailPage(item: any): void {
    this.helpCenterService.jumpToDetailPage(item);
  }
  //去往其他页面
  jumpTopage(idx: number): void {
    switch (idx) {
      case 0:
        this.router.navigate([this.appService.languageCode, 'userCenter', 'security', 'reset-name']);
        return;
      case 1:
        this.router.navigate([this.appService.languageCode, 'userCenter', 'security', 'reset-password']);
        return;
      case 2:
        if (this.userInfor.isBindMobile) {
          this.router.navigate([this.appService.languageCode, 'verification', 'reset-phone']);
        } else {
          this.router.navigate([this.appService.languageCode, 'verification', 'enable-phone']);
        }
        return;
      case 3:
        if (this.userInfor.isBindGoogleValid) {
          this.router.navigate([this.appService.languageCode, 'verification', 'disable-google']);
        } else {
          this.router.navigate([this.appService.languageCode, 'verification', 'enable-google']);
        }
        return;
    }
  }
}
