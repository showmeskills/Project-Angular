import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterLinkActive, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService, DynamicHeaderMenuService } from 'src/app/_metronic/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgClass, NgFor, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-header-menu-dynamic',
  templateUrl: './header-menu-dynamic.component.html',
  styleUrls: ['./header-menu-dynamic.component.scss'],
  standalone: true,
  imports: [NgIf, NgClass, NgFor, NgTemplateOutlet, RouterLinkActive, RouterLink, AngularSvgIconModule],
})
export class HeaderMenuDynamicComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  currentUrl!: string;
  menuConfig: any;

  ulCSSClasses!: string;
  rootArrowEnabled!: boolean;
  headerMenuDesktopToggle!: string;

  constructor(
    private layout: LayoutService,
    private router: Router,
    private menu: DynamicHeaderMenuService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ulCSSClasses = this.layout.getStringCSSClasses('header_menu_nav');
    this.rootArrowEnabled = this.layout.getProp('header.menu.self.rootArrow');
    this.headerMenuDesktopToggle = this.layout.getProp('header.menu.desktop.toggle');

    // router subscription
    this.currentUrl = this.router.url.split(/[?#]/)[0];
    const routerSubscr = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.url;
        this.cdr.detectChanges();
      });
    this.subscriptions.push(routerSubscr);

    // menu load
    const menuSubscr = this.menu.menuConfig$.subscribe((res) => {
      this.menuConfig = res;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(menuSubscr);
  }

  isMenuItemActive(path) {
    if (!this.currentUrl || !path) {
      return false;
    }

    if (this.currentUrl === path) {
      return true;
    }

    if (this.currentUrl.indexOf(path) > -1) {
      return true;
    }

    return false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
