import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import {
  Router,
  NavigationStart,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  NavigationEnd,
  NavigationCancel,
  RouterLink,
} from '@angular/router';
import { LayoutService } from 'src/app/_metronic/core';
import KTLayoutHeader from 'src/assets/js/layout/base/header';
import KTLayoutHeaderMenu from 'src/assets/js/layout/base/header-menu';
import { KTUtil } from 'src/assets/js/components/util';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { TopbarComponent } from '../topbar/topbar.component';
import { HeaderMenuDynamicComponent } from './header-menu-dynamic/header-menu-dynamic.component';
import { HeaderMenuComponent } from './header-menu/header-menu.component';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { NgClass, NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgbProgressbar,
    RouterLink,
    HeaderMenuComponent,
    HeaderMenuDynamicComponent,
    TopbarComponent,
    AsyncPipe,
  ],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  headerContainerCSSClasses!: string;
  headerMenuSelfDisplay!: boolean;
  headerMenuSelfStatic!: boolean;
  asideSelfDisplay!: boolean;
  headerLogo!: string;
  headerSelfTheme!: string;
  headerMenuCSSClasses!: string;
  headerMenuHTMLAttributes: any = {};
  routerLoaderTimout: any;

  @ViewChild('ktHeaderMenu', { static: true }) ktHeaderMenu!: ElementRef;
  loader$: Observable<number>;

  private loaderSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(private layout: LayoutService, private router: Router) {
    this.loader$ = this.loaderSubject;
    // page progress bar percentage
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // set page progress bar loading to start on NavigationStart event router
        this.loaderSubject.next(10);
      }
      if (event instanceof RouteConfigLoadStart) {
        this.loaderSubject.next(65);
      }
      if (event instanceof RouteConfigLoadEnd) {
        this.loaderSubject.next(90);
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        // set page progress bar loading to end on NavigationEnd event router
        this.loaderSubject.next(100);
        if (this.routerLoaderTimout) {
          clearTimeout(this.routerLoaderTimout);
        }
        this.routerLoaderTimout = setTimeout(() => {
          this.loaderSubject.next(0);
        }, 300);
      }
    });
    this.unsubscribe.push(routerSubscription);
  }

  ngOnInit(): void {
    this.headerContainerCSSClasses = this.layout.getStringCSSClasses('header_container');
    this.headerMenuSelfDisplay = this.layout.getProp('header.menu.self.display');
    this.headerMenuSelfStatic = this.layout.getProp('header.menu.self.static');
    this.asideSelfDisplay = this.layout.getProp('aside.self.display');
    this.headerSelfTheme = this.layout.getProp('header.self.theme') || '';
    this.headerLogo = this.getLogoURL();
    this.headerMenuCSSClasses = this.layout.getStringCSSClasses('header_menu');
    this.headerMenuHTMLAttributes = this.layout.getHTMLAttributes('header_menu');
  }

  private getLogoURL(): string {
    let result = 'logo-light.png';

    if (this.headerSelfTheme && this.headerSelfTheme === 'light') {
      result = 'logo-dark.png';
    }

    if (this.headerSelfTheme && this.headerSelfTheme === 'dark') {
      result = 'logo-dark.png';
    }

    return `./assets/media/logos/${result}`;
  }

  ngAfterViewInit(): void {
    if (this.ktHeaderMenu) {
      for (const key in this.headerMenuHTMLAttributes) {
        if (this.headerMenuHTMLAttributes.hasOwnProperty(key)) {
          this.ktHeaderMenu.nativeElement.attributes[key] = this.headerMenuHTMLAttributes[key];
        }
      }
    }

    KTUtil.ready(() => {
      // Init Desktop & Mobile Headers
      KTLayoutHeader.init('kt_header', 'kt_header_mobile');
      // Init Header Menu
      KTLayoutHeaderMenu.init('kt_header_menu', 'kt_header_menu_wrapper');
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    if (this.routerLoaderTimout) {
      clearTimeout(this.routerLoaderTimout);
    }
  }
}
