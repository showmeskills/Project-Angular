import { animate, style, transition, trigger } from '@angular/animations';
import { Platform } from '@angular/cdk/platform';
import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@UntilDestroy()
@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('0.2s ease-in-out', style({ transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('0.2s ease-in-out', style({ transform: 'translateY(100%)' }))]),
    ]),
    trigger('inOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('0s', style({ transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('0s', style({ transform: 'translateY(100%)' }))]),
    ]),
  ],
})
export class BottomMenuComponent implements OnInit {
  isH5!: boolean;
  hide!: boolean;
  active: boolean = true;

  constructor(
    public layout: LayoutService,
    private popup: PopupService,
    private appService: AppService,
    private localeService: LocaleService,
    private platform: Platform,
    private deviceService: DeviceDetectorService,
  ) {}

  toolsData: any = [
    { id: 1, name: this.localeService.getValue('menu'), icon: 'icon-bottom-menu', page: null },
    { id: 2, name: this.localeService.getValue('search'), icon: 'icon-bottom-search', page: null },
    {
      id: 3,
      name: this.localeService.getValue('activity'),
      icon: 'icon-bottom-activity',
      page: `/${this.appService.languageCode}/promotions/offer`,
    },
    { id: 4, name: this.localeService.getValue('h5_cs'), icon: 'icon-kefu', page: null },
    {
      id: 5,
      name: this.localeService.getValue('wallet'),
      icon: 'icon-wallet3',
      page: `/${this.appService.languageCode}/wallet`,
    },
  ];

  originalHeight = 0;
  androidHandle = () => {
    const tagName = document.activeElement?.tagName;
    const curHeight = document.documentElement.clientHeight || document.body.clientHeight;
    if (curHeight > this.originalHeight && (tagName === 'INPUT' || tagName === 'TEXTAREA')) {
      //android软键盘弹出
      this.active = false;
      this.layout.h5Keyboard$.next(true);
    } else if (!this.active) {
      //android软键盘收起
      this.active = true;
      this.layout.h5Keyboard$.next(false);
    }
  };
  iosFocusinHandle = () => {
    const tagName = document.activeElement?.tagName;
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      // ios软键盘弹起
      this.active = false;
      this.layout.h5Keyboard$.next(true);
    } else if (!this.active) {
      // 不是真的输入框（软键盘已收起），重置
      this.active = true;
      this.layout.h5Keyboard$.next(false);
    }
  };
  iosFocusoutHandle = () => {
    if (!this.active) {
      // 软键盘已收起，重置
      this.active = true;
      this.layout.h5Keyboard$.next(false);
    }
  };

  ngOnInit() {
    // 订阅当前路由页
    this.layout.page$
      .pipe(untilDestroyed(this))
      .subscribe(v => (this.hide = ['register', 'login', 'password'].includes(v)));
    // 订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      document.body.removeEventListener('focusin', this.iosFocusinHandle);
      document.body.removeEventListener('focusout', this.iosFocusoutHandle);
      window.removeEventListener('resize', this.androidHandle);
      this.isH5 = e;
      const isMobile = this.deviceService.isMobile();
      // h5模式且是移动设备时候才生效
      if (e && isMobile) {
        if (this.platform.IOS) {
          document.body.addEventListener('focusin', this.iosFocusinHandle);
          document.body.addEventListener('focusout', this.iosFocusoutHandle);
        } else {
          this.originalHeight = document.documentElement.clientHeight || document.body.clientHeight;
          window.addEventListener('resize', this.androidHandle);
        }
      } else {
        this.active = true;
        this.layout.h5Keyboard$.next(false);
      }
    });
  }

  handleClick(item: any) {
    if (item.id === 4) {
      this.appService.toOnLineService$.next(true);
    }
    if (item.id === 1) {
      this.layout.leftMenuState$.next(true);
    }
    if (item.id === 2) {
      //正常import会导致加载Swiper
      import('src/app/pages/minigame/search-game/search-game.component').then(({ SearchGameComponent }) => {
        this.popup.open(SearchGameComponent, {
          disableClose: true,
          speed: 'faster',
          hasBackdrop: false,
          autoFocus: false,
          inAnimation: 'fadeInRight',
          outAnimation: 'fadeOutRight',
          isFull: true,
          panelClass: 'mask-penetration',
        });
      });
    }
  }
}
