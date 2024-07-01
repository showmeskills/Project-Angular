import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, distinctUntilChanged, map, takeUntil, timer } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { NotificationService } from 'src/app/pages/notification-center/notification.service';
import { orderMenu } from 'src/app/pages/user-center/left-menu.config';
import { VipApi } from 'src/app/shared/apis/vip.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-header-level2-menu',
  templateUrl: './header-level2-menu.component.html',
  styleUrls: ['./header-level2-menu.component.scss'],
})
export class HeaderLevel2MenuComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    public appService: AppService,
    private notificationService: NotificationService,
    private vipApi: VipApi,
    private cardCenterService: CardCenterService,
    private breakpointObserver: BreakpointObserver,
    private miniGameService: MiniGameService,
  ) {}

  isH5!: boolean;

  simple!: boolean;

  vipLoading: boolean = false;

  /** 是否是app */
  isApp?: boolean;

  /** 是否登录状态 */
  logined: boolean = false;

  showH5Logo: boolean = false;

  showPop$: Subject<boolean> = new Subject();

  orderMenuData = orderMenu;

  @Input() layoutContentMarginLeft: string = '0px';
  @Input() hideHead: boolean = false;

  orderPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetX: 6 },
  ];

  navigationMenus: {
    name: string;
    icon: string;
    routerLink: string;
    menuIcon: string;
    show: boolean;
    linkActive: boolean;
    children: {
      labelName: string;
      ident: string;
      routerLink: string;
      menuIcon: string;
      icon: string;
    }[];
  }[] = [];

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

    this.miniGameService.homeScenesSub$
      .pipe(
        untilDestroyed(this),
        map(v => {
          const headerMenu = v?.navigationMenus || [];
          return headerMenu.map(x => {
            const link = this.miniGameService.getLinkByMethod(x);
            return {
              name: x?.name || '',
              icon: x?.icon || '',
              routerLink: link ? `/${this.appService.languageCode}/${this.miniGameService.getLinkByMethod(x)}` : '',
              menuIcon: x?.menuIcon || '',
              show: false,
              linkActive: false,
              children: [
                ...(x.infoExpandList?.map(expendList => ({
                  labelName: expendList?.labelName || '',
                  ident: expendList?.labelCode || '',
                  routerLink: `/${this.appService.languageCode}/${this.miniGameService.getLinkByMethod(expendList)}`,
                  menuIcon: expendList?.menuIcon || '',
                  icon: expendList?.icon || '',
                })) || []),
              ],
            };
          });
        }),
      )
      .subscribe(data => {
        this.navigationMenus = data;
      });
  }

  showPop(i: number, skipRepeat: boolean = true) {
    if (this.isH5) return;
    if (skipRepeat && this.navigationMenus[i].show) return;
    this.closePop();
    this.showPop$.next(true);
    this.navigationMenus[i].show = true;
  }
  clickshowPop(v: number) {
    const show = this.navigationMenus[v].show;
    this.closePop();
    this.showPop$.next(!show);
    this.navigationMenus[v].show = !show;
  }
  closePop(time: number = 0) {
    if (time > 0) {
      timer(time)
        .pipe(takeUntil(this.showPop$))
        .subscribe(() => {
          this.navigationMenus.forEach(x => (x.show = false));
        });
    } else {
      this.navigationMenus.forEach(x => (x.show = false));
    }
  }
}
