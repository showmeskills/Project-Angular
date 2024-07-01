import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LayoutInitService, LayoutService } from 'src/app/_metronic/core';
import KTLayoutContent from 'src/assets/js/layout/base/content';
import { filter } from 'rxjs/operators';

import { animate, style, transition, trigger } from '@angular/animations';
import { EditorToolService } from 'src/app/components/ueditor/tools/tools.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ToastComponent } from 'src/app/shared/components/toast/toast.component';
import { ScriptsInitComponent } from '../scripts-init/scripts-init.component';
import { BlockUiComponent } from 'src/app/shared/components/block-ui/block-ui.component';
import { FooterComponent } from '../footer/footer.component';
import { SubheaderWrapperComponent } from '../../_metronic/partials/layout/subheader/subheader-wrapper/subheader-wrapper.component';
import { HeaderComponent } from '../header/header.component';
import { StickyContainerDirective } from 'src/app/shared/directive/sticky-auto.directive';
import { AsideDynamicComponent } from '../aside-dynamic/aside-dynamic.component';
import { HeaderMobileComponent } from '../header-mobile/header-mobile.component';
import { NgIf, NgClass, AsyncPipe } from '@angular/common';

// const menuItems: MenuItem[] = [
//   {
//     name: "仪表盘", icon: "dashboard", path: "/dashboard", open: true,
//     children: [
//       { name: "分析页", path: "/dashboard/analysis" },
//     ]
//   },
//   {
//     name: "用户管理", icon: "user", path: "/user",
//     children: [
//       { name: "用户列表", path: "/user/list" },
//     ]
//   }, {
//     name: "示例页面", icon: "table", path: "/example",
//     children: [
//       { name: "列表页", path: "/example/list" },
//       { name: "表单页", path: "/example/form" },
//     ]
//   }
// ];
let obs: ResizeObserver | undefined;

@Component({
  selector: 'app-layout',
  templateUrl: './basic-layout.component.html',
  styleUrls: ['./basic-layout.component.scss'],
  animations: [
    trigger('opacity-transition', [
      transition(':enter', [style({ opacity: 0 }), animate('100ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
    ]),
  ],
  standalone: true,
  imports: [
    NgIf,
    HeaderMobileComponent,
    NgClass,
    AsideDynamicComponent,
    StickyContainerDirective,
    HeaderComponent,
    SubheaderWrapperComponent,
    RouterOutlet,
    FooterComponent,
    BlockUiComponent,
    ScriptsInitComponent,
    ToastComponent,
    AsyncPipe,
  ],
})
export class BasicLayoutComponent implements OnInit, AfterViewInit {
  constructor(
    private initService: LayoutInitService,
    private layout: LayoutService,
    private appService: AppService,
    private router: Router,
    public editorTool: EditorToolService,
    public lang: LangService
  ) {
    this.initService.init();
  }

  // Public variables
  selfLayout = 'default';
  asideSelfDisplay!: true;
  asideMenuStatic!: true;
  contentClasses = '';
  contentContainerClasses = '';
  subheaderDisplay = true;
  contentExtended!: false;
  asideCSSClasses!: string;
  asideHTMLAttributes: any = {};
  headerMobileClasses = '';
  headerMobileAttributes: any = {};
  footerDisplay!: boolean;
  footerCSSClasses!: string;
  headerCSSClasses!: string;
  headerHTMLAttributes: any = {};
  // offcanvases
  extrasSearchOffcanvasDisplay = false;
  extrasNotificationsOffcanvasDisplay = false;
  extrasQuickActionsOffcanvasDisplay = false;
  extrasCartOffcanvasDisplay = false;
  extrasUserOffcanvasDisplay = false;
  extrasQuickPanelDisplay = false;
  extrasScrollTopDisplay = false;
  @ViewChild('ktAside', { static: true }) ktAside!: ElementRef;
  @ViewChild('ktHeaderMobile', { static: true }) ktHeaderMobile!: ElementRef;
  @ViewChild('ktHeader', { static: true }) ktHeader!: ElementRef;
  @ViewChild('ktWrapper') set _(v: ElementRef<HTMLDivElement>) {
    obs && obs.disconnect();
    obs = new ResizeObserver((entries) => {
      this.layout.contentTop$.next(entries[0].target?.['offsetTop'] || 110);
    });
    obs.observe(v.nativeElement);
  }

  isLoading = false;
  loadingMsg = 'Loading...';

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.subscribe((x) => {
      setTimeout(async () => {
        this.loadingMsg = (await this.lang.getOne('common.loading')) || 'Loading...';

        // 在开发模式下会触发绑定值检查，这里通过异步解决
        if (typeof x === 'boolean') {
          this.isLoading = x;
        } else {
          this.isLoading = x.loading;

          if (x.msgLang) {
            x.msg = (await this.lang.getOne(x.msgLang)) || '';
          }

          if (x.msg) {
            this.loadingMsg = x.msg;
          }
        }
      });
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.isLoading = false;
    });
    this.selfLayout = this.layout.getProp('self.layout');
    this.asideSelfDisplay = this.layout.getProp('aside.self.display');
    this.asideMenuStatic = this.layout.getProp('aside.menu.static');
    this.subheaderDisplay = this.layout.getProp('subheader.display');
    this.contentClasses = this.layout.getStringCSSClasses('content');
    this.contentContainerClasses = this.layout.getStringCSSClasses('content_container');
    this.contentExtended = this.layout.getProp('content.extended');
    this.asideHTMLAttributes = this.layout.getHTMLAttributes('aside');
    this.asideCSSClasses = this.layout.getStringCSSClasses('aside');
    this.headerMobileClasses = this.layout.getStringCSSClasses('header_mobile');
    this.headerMobileAttributes = this.layout.getHTMLAttributes('header_mobile');
    this.footerDisplay = this.layout.getProp('footer.display');
    this.footerCSSClasses = this.layout.getStringCSSClasses('footer');
    this.headerCSSClasses = this.layout.getStringCSSClasses('header');
    this.headerHTMLAttributes = this.layout.getHTMLAttributes('header');
    // offcanvases
    if (this.layout.getProp('extras.search.display')) {
      this.extrasSearchOffcanvasDisplay = this.layout.getProp('extras.search.layout') === 'offcanvas';
    }

    if (this.layout.getProp('extras.notifications.display')) {
      this.extrasNotificationsOffcanvasDisplay = this.layout.getProp('extras.notifications.layout') === 'offcanvas';
    }

    if (this.layout.getProp('extras.quickActions.display')) {
      this.extrasQuickActionsOffcanvasDisplay = this.layout.getProp('extras.quickActions.layout') === 'offcanvas';
    }

    if (this.layout.getProp('extras.cart.display')) {
      this.extrasCartOffcanvasDisplay = this.layout.getProp('extras.cart.layout') === 'offcanvas';
    }

    if (this.layout.getProp('extras.user.display')) {
      this.extrasUserOffcanvasDisplay = this.layout.getProp('extras.user.layout') === 'offcanvas';
    }

    this.extrasQuickPanelDisplay = this.layout.getProp('extras.quickPanel.display');

    this.extrasScrollTopDisplay = this.layout.getProp('extras.scrolltop.display');
  }

  ngAfterViewInit(): void {
    if (this.ktAside) {
      for (const key in this.asideHTMLAttributes) {
        if (this.asideHTMLAttributes.hasOwnProperty(key)) {
          this.ktAside.nativeElement.attributes[key] = this.asideHTMLAttributes[key];
        }
      }
    }

    if (this.ktHeaderMobile) {
      for (const key in this.headerMobileAttributes) {
        if (this.headerMobileAttributes.hasOwnProperty(key)) {
          this.ktHeaderMobile.nativeElement.attributes[key] = this.headerMobileAttributes[key];
        }
      }
    }

    if (this.ktHeader) {
      for (const key in this.headerHTMLAttributes) {
        if (this.headerHTMLAttributes.hasOwnProperty(key)) {
          this.ktHeader.nativeElement.attributes[key] = this.headerHTMLAttributes[key];
        }
      }
    }
    // Init Content
    KTLayoutContent.init('kt_content');
  }
}
