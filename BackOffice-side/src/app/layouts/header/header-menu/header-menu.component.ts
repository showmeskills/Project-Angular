import { Component, OnInit } from '@angular/core';
import { Location, NgClass, NgIf } from '@angular/common';
import { LayoutService } from 'src/app/_metronic/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLinkActive, RouterLink } from '@angular/router';

function getCurrentURL(location) {
  return location.split(/[?#]/)[0];
}

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  standalone: true,
  imports: [NgClass, RouterLinkActive, RouterLink, NgIf, AngularSvgIconModule],
})
export class HeaderMenuComponent implements OnInit {
  ulCSSClasses!: string;
  rootArrowEnabled!: boolean;
  location: Location;
  headerMenuDesktopToggle!: string;

  constructor(
    private layout: LayoutService,
    private loc: Location
  ) {
    this.location = this.loc;
  }

  ngOnInit(): void {
    this.ulCSSClasses = this.layout.getStringCSSClasses('header_menu_nav');
    this.rootArrowEnabled = this.layout.getProp('header.menu.self.rootArrow');
    this.headerMenuDesktopToggle = this.layout.getProp('header.menu.desktop.toggle');
  }

  getMenuItemActive(url) {
    return this.checkIsActive(url) ? 'menu-item-active' : '';
  }

  checkIsActive(url) {
    const location = this.location.path();
    const current = getCurrentURL(location);
    if (!current || !url) {
      return false;
    }

    if (current === url) {
      return true;
    }

    if (current.indexOf(url) > -1) {
      return true;
    }

    return false;
  }
}
