import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppService } from './app.service';
import { LocalStorageService } from './shared/service/localstorage.service';
import { AccountApi } from './shared/api/account.api';
import { environment } from 'src/environments/environment';
import { DynamicAsideMenuService } from 'src/app/_metronic/core';
import { NgIf } from '@angular/common';
import { ToastComponent } from 'src/app/shared/components/toast/toast.component';
import 'src/app/shared/models/app.init';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgIf, RouterOutlet, ToastComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private appService = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected localStorageService = inject(LocalStorageService);
  private accountApi = inject(AccountApi);
  private menu = inject(DynamicAsideMenuService);

  constructor() {
    this.navigationEndSub$ = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.routeQueryParamSub$ = this.route.queryParams.subscribe((queryParams: Params) => {
        if (Object.keys(queryParams).length === 0 || !queryParams['token']) {
          this.isLoading = false;
          //this.isJumpToLogin = true;
          //this.appService.jumpToLogin();
          return;
        }
      });
    });
  }

  private getUserInfoSub!: Subscription;

  isLoading = true;
  private routeQueryParamSub$!: Subscription;
  private navigationEndSub$: Subscription;

  ngOnInit(): void {
    window['version'] = environment.version;
    if (this.localStorageService.token == '' || this.localStorageService.token == null) {
      this.appService.jumpToLogin();
    }

    this.appService.refresh.subscribe(() => {});

    this.getUserInfo();
  }

  ngOnDestroy(): void {
    this.getUserInfoSub.unsubscribe();
  }

  /**
   * 获取用户信息
   */
  getUserInfo() {
    // 如果当前页是登录页，就不获取用户数据了
    if (this.appService.publicPath.some((e) => location.pathname.replace(/^\/.*?(?=\/)/, '').startsWith(e))) return;

    this.appService.isContentLoadingSubject.next(true);

    this.getUserInfoSub = this.accountApi.getUserInfo().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.menu.loadMenu();

      // 避免接口错误，依旧覆盖userInfo数据，判断用户ID唯一值是否存在，再进行赋值；（功能关联登录重定向）
      if (res.id) {
        this.localStorageService.userInfo = res;
      }
    });
  }
}
