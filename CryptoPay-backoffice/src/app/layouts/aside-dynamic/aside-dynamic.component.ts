import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/auth/auth.service';
import { DynamicAsideMenuService, LayoutService } from 'src/app/_metronic/core';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { VersionComponent } from 'src/app/shared/components/version/version.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgClass, NgIf, NgFor, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-aside-dynamic',
  templateUrl: './aside-dynamic.component.html',
  styleUrls: ['./aside-dynamic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    IconSrcDirective,
    NgIf,
    AngularSvgIconModule,
    NgFor,
    NgTemplateOutlet,
    VersionComponent,
    LangPipe,
  ],
})
export class AsideDynamicComponent implements OnInit, OnDestroy {
  menuConfig: any;
  subscriptions: Subscription[] = [];

  disableAsideSelfDisplay!: boolean;
  headerLogo!: string;
  brandSkin!: string;
  ulCSSClasses!: string;
  asideMenuHTMLAttributes: any = {};
  asideMenuCSSClasses!: string;
  asideMenuDropdown: any;
  brandClasses!: string;
  asideMenuScroll = 1;
  asideSelfMinimizeToggle = false;
  // version!: string;

  currentUrl!: string;

  constructor(
    private layout: LayoutService,
    private router: Router,
    private menu: DynamicAsideMenuService,
    private authService: AuthService,
    private appService: AppService,
    private cdr: ChangeDetectorRef,
    private lang: LangService
  ) {}

  ngOnInit(): void {
    // this.version = environment.version;
    // load view settings
    this.disableAsideSelfDisplay = this.layout.getProp('aside.self.display') === false;
    this.brandSkin = this.layout.getProp('brand.self.theme');
    this.headerLogo = this.getLogo();
    this.ulCSSClasses = this.layout.getProp('aside_menu_nav');
    this.asideMenuCSSClasses = this.layout.getStringCSSClasses('aside_menu');
    this.asideMenuHTMLAttributes = this.layout.getHTMLAttributes('aside_menu');
    this.asideMenuDropdown = this.layout.getProp('aside.menu.dropdown') ? '1' : '0';
    this.brandClasses = this.layout.getProp('brand');
    this.asideSelfMinimizeToggle = this.layout.getProp('aside.self.minimize.toggle');
    this.asideMenuScroll = this.layout.getProp('aside.menu.scroll') ? 1 : 0;
    // this.asideMenuCSSClasses = `${this.asideMenuCSSClasses} ${this.asideMenuScroll === 1 ? 'scroll my-4 ps ps--active-y' : ''}`;

    // router subscription
    const getUrl = (url: string) => {
      if (this.lang.supportLang.some((e) => url.startsWith('/' + e))) {
        this.currentUrl = url.match(/^\/(.*?)(\/(.*?)$)/)?.[2] || url;
      } else {
        this.currentUrl = url;
      }
    };

    getUrl(this.router.url.split(/[?#]/)[0]);

    const routerSubscr = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        getUrl(event.url);

        this.cdr.detectChanges();
      });
    this.subscriptions.push(routerSubscr);

    // menu load
    const menuSubscr = this.menu.menuConfig$.subscribe((res) => {
      if (!res || !res?.items) return;
      this.menuConfig = { items: cloneDeep(res.items) };
      this.cdr.detectChanges();
    });
    this.subscriptions.push(menuSubscr);
  }

  private getLogo() {
    if (this.brandSkin === 'light') {
      return './assets/media/logos/logo-dark.png';
    } else {
      return './assets/media/logos/logo-light.png';
    }
  }

  isMenuItemActive(path: string, item?: any) {
    if (!this.currentUrl || !path) {
      return false;
    }

    if (this.currentUrl === path) {
      return true;
    }

    // ps: 他下面不一定是自己的子菜单，会调用其他组件的子菜单情况
    // if (this.currentUrl.indexOf(path + '/') > -1) {
    //   return true;
    // }

    if (Array.isArray(item?.submenu)) {
      let flag = item.submenu.some((k) => this.currentUrl.startsWith(k.page));

      if (!flag) {
        flag = item.submenu.some((e) => {
          const flag = e?.thirdmenu?.some((k) => this.currentUrl.startsWith(k.page));
          if (!flag) return e.page === this.currentUrl;

          return true;
        });
      }

      return flag;
    }

    return false;
  }

  isMenuItemActive2(path: string, item?: any) {
    let component = path;

    if (!this.currentUrl || !path) {
      return false;
    }

    if (this.currentUrl === component) {
      return true;
    }

    if (Array.isArray(item?.thirdmenu)) {
      return item.thirdmenu.some((k) => this.currentUrl.startsWith(k.page));
    }

    // 判断当前path 是否存在导航配置中 不存在再使用startsWith 进行匹配
    if (path && !this.menu.findByPath(this.currentUrl)) {
      return this.currentUrl.startsWith(path);
    }

    return false;
  }

  navigateTo(path) {
    if (!Array.isArray(path)) {
      path = [path];
    }

    this.router.navigate(path);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
