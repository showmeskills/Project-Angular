import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { LayoutService } from 'src/app/_metronic/core';
import KTLayoutQuickSearch from 'src/assets/js/layout/extended/quick-search';
import KTLayoutQuickNotifications from 'src/assets/js/layout/extended/quick-notifications';
import KTLayoutQuickActions from 'src/assets/js/layout/extended/quick-actions';
import KTLayoutQuickCartPanel from 'src/assets/js/layout/extended/quick-cart';
import KTLayoutQuickPanel from 'src/assets/js/layout/extended/quick-panel';
import KTLayoutQuickUser from 'src/assets/js/layout/extended/quick-user';
import KTLayoutHeaderTopbar from 'src/assets/js/layout/base/header-topbar';
import { KTUtil } from 'src/assets/js/components/util';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { AccountApi } from 'src/app/shared/api/account.api';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ResetPassComponent } from 'src/app/pages/personal/reset-pass/reset-pass.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [NgIf, MatButtonModule, MatMenuModule, NgFor, LangPipe],
})
export class TopbarComponent implements OnInit, AfterViewInit, OnDestroy {
  // tobbar extras
  extraSearchDisplay!: boolean;
  extrasSearchLayout!: 'offcanvas' | 'dropdown';
  extrasNotificationsDisplay!: boolean;
  extrasNotificationsLayout!: 'offcanvas' | 'dropdown';
  extrasQuickActionsDisplay!: boolean;
  extrasQuickActionsLayout!: 'offcanvas' | 'dropdown';
  extrasCartDisplay!: boolean;
  extrasCartLayout!: 'offcanvas' | 'dropdown';
  extrasQuickPanelDisplay!: boolean;
  extrasLanguagesDisplay!: boolean;
  extrasUserDisplay!: boolean;
  extrasUserLayout!: 'offcanvas' | 'dropdown';
  private logoutSub!: Subscription;

  constructor(
    private layout: LayoutService,
    private modalService: MatModal,
    private appService: AppService,
    public route: Router,
    private authService: AuthService,
    private accountApi: AccountApi,
    public localStorageService: LocalStorageService,
    public lang: LangService
  ) {}

  userName = '';
  ngOnInit(): void {
    // topbar extras
    this.extraSearchDisplay = this.layout.getProp('extras.search.display');
    this.extrasSearchLayout = this.layout.getProp('extras.search.layout');
    this.extrasNotificationsDisplay = this.layout.getProp('extras.notifications.display');
    this.extrasNotificationsLayout = this.layout.getProp('extras.notifications.layout');
    this.extrasQuickActionsDisplay = this.layout.getProp('extras.quickActions.display');
    this.extrasQuickActionsLayout = this.layout.getProp('extras.quickActions.layout');
    this.extrasCartDisplay = this.layout.getProp('extras.cart.display');
    this.extrasCartLayout = this.layout.getProp('extras.cart.layout');
    this.extrasLanguagesDisplay = this.layout.getProp('extras.languages.display');
    this.extrasUserDisplay = this.layout.getProp('extras.user.display');
    this.extrasUserLayout = this.layout.getProp('extras.user.layout');
    this.extrasQuickPanelDisplay = this.layout.getProp('extras.quickPanel.display');
    this.userName = this.authService.userName;
  }

  ngAfterViewInit(): void {
    KTUtil.ready(() => {
      // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      // Add 'implements AfterViewInit' to the class.
      if (this.extraSearchDisplay && this.extrasSearchLayout === 'offcanvas') {
        KTLayoutQuickSearch.init('kt_quick_search');
      }

      if (this.extrasNotificationsDisplay && this.extrasNotificationsLayout === 'offcanvas') {
        // Init Quick Notifications Offcanvas Panel
        KTLayoutQuickNotifications.init('kt_quick_notifications');
      }

      if (this.extrasQuickActionsDisplay && this.extrasQuickActionsLayout === 'offcanvas') {
        // Init Quick Actions Offcanvas Panel
        KTLayoutQuickActions.init('kt_quick_actions');
      }

      if (this.extrasCartDisplay && this.extrasCartLayout === 'offcanvas') {
        // Init Quick Cart Panel
        KTLayoutQuickCartPanel.init('kt_quick_cart');
      }

      if (this.extrasQuickPanelDisplay) {
        // Init Quick Offcanvas Panel
        KTLayoutQuickPanel.init('kt_quick_panel');
      }

      if (this.extrasUserDisplay && this.extrasUserLayout === 'offcanvas') {
        // Init Quick User Panel
        KTLayoutQuickUser.init('kt_quick_user');
      }

      // Init Header Topbar For Mobile Mode
      KTLayoutHeaderTopbar.init('kt_header_mobile_topbar_toggle');
    });
  }

  resetPassword() {
    this.modalService.open(ResetPassComponent, {
      width: '500px',
      disableClose: true,
    });
  }

  ngOnDestroy(): void {
    this.logoutSub?.unsubscribe();
  }

  /**
   * 退出登陆
   */
  logOut() {
    this.logoutSub = this.accountApi.logOut().subscribe(() => {
      this.localStorageService.token = null;
      // 如果是正常登出，清除 重定向path，避免正常登入进入重定向页面（此功能关联登录重定向）
      this.localStorageService.redirectPath = null;
      this.appService.jumpToLogin();
    });
  }
}
