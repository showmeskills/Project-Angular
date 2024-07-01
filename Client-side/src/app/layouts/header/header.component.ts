import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, map } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { NotificationService } from 'src/app/pages/notification-center/notification.service';
import { VipApi } from 'src/app/shared/apis/vip.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    public appService: AppService,
    private notificationService: NotificationService,
    private vipApi: VipApi,
    private cardCenterService: CardCenterService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  isH5!: boolean;

  simple!: boolean;

  vipLoading: boolean = false;

  /** 是否是app */
  isApp?: boolean;

  /** 是否登录状态 */
  logined: boolean = false;

  showH5Logo: boolean = false;

  @Input() layoutContentMarginLeft: string = '0px';

  ngOnInit() {
    this.isApp = environment.isApp;
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.layout.page$
      .pipe(untilDestroyed(this))
      .subscribe(e => (this.simple = ['register', 'login', 'password'].includes(e)));

    this.breakpointObserver
      .observe(['(max-width: 875px)'])
      .pipe(
        untilDestroyed(this),
        map((state: BreakpointState) => state.matches),
        distinctUntilChanged(),
      )
      .subscribe(e => {
        this.showH5Logo = e;
      });

    // 登录后如果为用户名注册显示提示弹窗
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      if (!v) return;
      this.logined = true;
      this.getUserVip();
      // 获取站内信 所有信息
      this.notificationService.getNoticeCounts();

      // 获取卡券数量
      this.cardCenterService.getBonusCount();
    });
  }

  // 获取用户vip信息
  getUserVip() {
    this.vipLoading = true;
    this.vipApi.getUserVip().subscribe(vipInfo => {
      if (vipInfo) {
        this.appService.vipUserInfo$.next(vipInfo);
        this.vipLoading = false;
      }
    });
  }
}
