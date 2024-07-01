import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { FriendService } from './friend.service';
interface NavList {
  name: string;
  page: string;
  icon: string;
  disabled: boolean;
}
@UntilDestroy()
@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss'],
})
export class FriendComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private friendService: FriendService,
    private router: Router,
    private appService: AppService,
    private friendApi: FriendApi,
    private activatedRoute: ActivatedRoute,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService,
  ) {}

  isH5!: boolean;

  /** 路由导航 */
  navList: NavList[] = [
    {
      name: 'earn_to',
      page: `/${this.appService.languageCode}/referral/home`,
      icon: 'icon-friend',
      disabled: false,
    },
    {
      name: 'agent_p',
      page: `/${this.appService.languageCode}/referral/application/affiliate`,
      icon: 'icon-agent',
      disabled: false,
    },
    // {
    //   name: 'sup_partner',
    //   page: `/${this.appService.languageCode}/referral/partner`,
    //   icon: 'icon-partner',
    //   disabled: false,
    // },
  ];

  /** 当前激活路由下标 */
  isActiveRouter: number = 0;

  /** h5 的时候切换页面 隐藏导航 */
  isShowNav: boolean = true;

  /** 加载动画 */
  loading: boolean = true;

  /** 是否准备好 */
  ready: boolean = false;

  ngOnInit(): void {
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(() => {
      this.activatedRoute.routeConfig?.children?.forEach((route, i) => {
        if (this.layout.getComponentTree()[3] === route.component) {
          this.isActiveRouter = i - 1;
          this.nativeAppService.setNativeTitle(this.navList[this.isActiveRouter]?.name || '');
        }
      });
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.friendService.isShowNav$.pipe(untilDestroyed(this)).subscribe(isShowNav => (this.isShowNav = isShowNav));
    // 外层已有路由守卫，故这里不需要检查登录
    combineLatest([
      this.friendApi.getDefault(),
      this.friendService.getGameType(),
      this.friendService.getAgentApplyStatus(),
      this.friendApi.getList({ page: 1, pageSize: 10 }),
      this.friendService.getUserAgentStatus(),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([data, gameType, agentApplyStatus, recommendList, isAgentLogon]) => {
        if (isAgentLogon) {
          this.navList[0].disabled = true;
          this.navList[1].page = `/${this.appService.languageCode}/referral/affiliate`;
          this.jumpToPage(1, `/${this.appService.languageCode}/referral/affiliate`);
        } else {
          this.jumpToPage(0, `/${this.appService.languageCode}/referral/home`);
        }
        this.ready = true; //准备完毕
        this.friendService.defaultLinkData$.next(data || {});
        this.friendService.gameType$.next(gameType ?? []);
        this.friendService.agentApplyStatus$.next(agentApplyStatus);
        this.friendService.getRcommendList$.next(recommendList);
        this.loading = false;
      });
  }

  /**
   * @param idx
   * @param page
   * @jumpToPage 跳转路由
   * @idx 下标
   * @page 页面名称
   */
  jumpToPage(idx: number, page: string): void {
    if (page === this.navList[this.isActiveRouter].page) return; //如果相同不再执行
    this.router.navigateByUrl(page);
    this.isActiveRouter = idx;
  }
}
