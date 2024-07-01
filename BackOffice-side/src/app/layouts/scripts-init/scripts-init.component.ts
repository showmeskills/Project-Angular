import { Component, OnInit, AfterViewInit } from '@angular/core';
import { KTUtil } from 'src/assets/js/components/util';
import KTLayoutAsideToggle from 'src/assets/js/layout/base/aside-toggle';
import KTLayoutStickyCard from 'src/assets/js/layout/base/sticky-card';
import KTLayoutStretchedCard from 'src/assets/js/layout/base/stretched-card';
import { LayoutService } from 'src/app/_metronic/core';
import KTLayoutBrand from 'src/assets/js/layout/base/brand';
import KTLayoutAside from 'src/assets/js/layout/base/aside';
import KTLayoutAsideMenu from 'src/assets/js/layout/base/aside-menu';

@Component({
  selector: 'app-scripts-init',
  templateUrl: './scripts-init.component.html',
  standalone: true,
})
export class ScriptsInitComponent implements OnInit, AfterViewInit {
  asideSelfMinimizeToggle = false;

  constructor(private layout: LayoutService) {}

  ngOnInit(): void {
    this.asideSelfMinimizeToggle = this.layout.getProp('aside.self.minimize.toggle');
  }

  ngAfterViewInit() {
    KTUtil.ready(() => {
      // Init Brand Panel For Logo
      KTLayoutBrand.init('kt_brand');
      // Init Aside
      KTLayoutAside.init('kt_aside');
      // Init Aside Menu
      KTLayoutAsideMenu.init('kt_aside_menu');

      if (this.asideSelfMinimizeToggle) {
        // Init Aside Menu Toggle
        KTLayoutAsideToggle.init('kt_aside_toggle');
      }

      // Init Sticky Card
      KTLayoutStickyCard.init('kt_page_sticky_card');
      // Init Stretched Card
      KTLayoutStretchedCard.init('kt_page_stretched_card');
    });
  }
}
