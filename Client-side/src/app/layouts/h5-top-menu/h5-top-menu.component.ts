import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { MenuItem, TopMenu } from 'src/app/pages/user-center/left-menu.config';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ThemeSwitchComponent } from 'src/app/shared/components/theme-switch/theme-switch.component';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import { ChatService } from 'src/app/shared/service/chat.service';
import { CountryUtilsService } from 'src/app/shared/service/country.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { environment } from 'src/environments/environment';

type H5TopMenuComponentUse = 'h5-topMenu' | 'h5-langSelect';

@UntilDestroy()
@Component({
  selector: 'app-h5-top-menu',
  templateUrl: './h5-top-menu.component.html',
  styleUrls: ['./h5-top-menu.component.scss'],
})
export class H5TopMenuComponent implements OnInit {
  userInfo!: AccountInforData;
  logined!: boolean;
  menuDialog?: MatDialogRef<any>;
  menuData: MenuItem[][] = JSON.parse(JSON.stringify(TopMenu));
  currentPage!: string;
  allLangData!: LangModel[];
  useFor!: H5TopMenuComponentUse;

  kycLevel: number = 0;
  kycStatusName!: string;
  messagesCount: number = 0; // 当前有多少信息未读
  currentVipLevel!: number; //当前vip等级
  isSuperVip: boolean = false;
  @Input() vipLoading!: boolean;

  /**@bounsCount 卡劵数量 */
  bounsCount: number = 0;

  /** kyc状态loading */
  kycStatusLoading: boolean = false;

  constructor(
    private appService: AppService,
    private popup: PopupService,
    private layout: LayoutService,
    private kycService: KycService,
    private countryUtils: CountryUtilsService,
    private router: Router,
    private userAssetsService: UserAssetsService,
    private cardCenterService: CardCenterService,
    private kycApi: KycApi,
    private localStorageService: LocalStorageService,
    public chatService: ChatService,
  ) {}

  ngOnInit() {
    // 订阅当前登录账号信息
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      this.userInfo = v ?? ({} as any);
      this.logined = !!v;
      if (this.logined) {
        this.initMenuData();
      }

      if (!v?.isSvip) {
        this.currentVipLevel = v?.viPGrade ?? 0;
      }
      this.isSuperVip = v?.isSvip ?? false;
    });

    // 订阅当前路由页
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(v => (this.currentPage = v));

    // 本地获取语言数据
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(x => (this.allLangData = x));

    // 接收全局打开语言选择请求
    this.appService.h5LangSelectPop$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) this.open('h5-langSelect');
    });

    this.cardCenterService.bounsCount$.pipe(untilDestroyed(this)).subscribe(bounsCount => {
      this.bounsCount = bounsCount || 0;
    });

    this.appService.noticeCounts$.pipe(untilDestroyed(this)).subscribe(e => {
      this.messagesCount = e?.All || 0;
    });

    //非H5关闭菜单
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(x => !x && this.close());
  }

  /** 获取用户当前KYC状态 */
  onGetKycStatus() {
    if (this.localStorageService.loginToken) {
      this.kycStatusLoading = true;
      this.kycApi.getUserKycStatus().subscribe(data => {
        if (data.length > 0) {
          const currentKyc = this.kycService.checkUserKycStatus(data);
          this.kycLevel = currentKyc.level;
          this.kycStatusName = currentKyc.kycStatusName;
        }
        this.kycStatusLoading = false;
      });
    }
  }

  /**
   * 跳转在线客服
   *
   * @returns
   */
  goService() {
    this.appService.toOnLineService$.next(true);
    this.close();
  }
  async initMenuData() {
    //动态增加转账制的钱包菜单
    const walletList = await this.userAssetsService.getWalletList();
    walletList
      .filter(x => x.category !== 'Main')
      .forEach(item => {
        const l1 = this.menuData.findIndex(x => x.some(y => y.icon === 'wallet'));
        const l2 = this.menuData[l1].findIndex(x => x.icon === 'wallet');
        if (!this.menuData[l1][l2].children!.find(x => x.class === item.category)) {
          this.menuData[l1][l2].children!.push({
            icon: 'icon-wallet2',
            page: `wallet/transfer/${item.category}`,
            title: item.category.toLowerCase(),
            class: item.category,
          });
        }
      });
  }

  @ViewChild('themeSwitch') themeSwitch!: ThemeSwitchComponent;
  @ViewChild('menuPopup') menuPopup!: TemplateRef<any>;

  open(to: H5TopMenuComponentUse) {
    this.useFor = to;
    if (this.menuDialog) return;
    this.menuDialog = this.popup.open(this.menuPopup, {
      inAnimation: 'fadeInRight',
      outAnimation: 'fadeOutRight',
      speed: 'fast',
      autoFocus: false,
      isFull: true,
    });

    this.onGetKycStatus();
  }

  menuClick(item: MenuItem, event: any) {
    if (item.icon == 'kefu') {
      this.appService.toOnLineService$.next(true);
      this.close();
      return;
    }
    if (item.icon == 'chat') {
      this.chatService.toggleChat(true);
      this.close();
      return;
    }
    //登出
    if (item.icon === 'exit') {
      this.appService.saveUrl();
      this.appService.logoutSubject$.next(true);
      this.close();
      return;
    }

    //切换语言
    if (item.icon === 'global') {
      this.useFor = 'h5-langSelect';
      return;
    }

    //展开子级
    if (item.children) {
      const parent: Element = event.currentTarget;
      const children: Element | null = parent.nextElementSibling;
      if (children) {
        parent.classList.toggle('expand');
        children.classList.toggle('show');
      }
      return;
    }

    this.close();
  }

  close() {
    this.menuDialog?.close();
    this.menuDialog = undefined;
  }

  jumpToLogin() {
    this.appService.saveUrl();
    this.close();
  }

  checkGroup(target: MenuItem[]): boolean {
    return target.some(item => {
      return this.checkItem(item);
    });
  }

  checkItem(target: MenuItem): boolean {
    let result;
    if (target.showOnTourist) {
      result = !target.showOnly || target.showOnly === 'h5' || (target.showOnly === 'app' && environment.isApp);
      if (target.showOnlyTourist && this.logined) result = false;
    } else {
      if (!this.logined) {
        result = false;
      } else {
        result = !target.showOnly || target.showOnly === 'h5' || (target.showOnly === 'app' && environment.isApp);
      }
    }
    if (result && target.children) result = this.checkGroup(target.children);
    if (target.icon === 'chat' && !this.chatService.chatEnabled) result = false;
    return result;
  }

  countryClassName(code: any) {
    return this.countryUtils.getcountryClassName(code);
  }

  getRouterLink(target: MenuItem): string | null {
    return !target.page || target.children ? null : target.page;
  }

  getRouterLinkActive(target: MenuItem): string {
    return !target.page || target.children ? '' : 'active';
  }

  /**
   * Kyc跳转
   */
  jumpToKyc() {
    //if (this.kycLevel > 1) return;
    this.router.navigate([this.appService.languageCode, 'userCenter', 'kyc']);
    this.close();
  }

  /**
   * 选择语言
   */
  langCode: string = this.appService.languageCode;
  selectLang(selectedLang: LangModel) {
    const targetCode = selectedLang.code.toLowerCase();
    if (this.appService.languageCode === targetCode) return;
    this.appService.selectLangFun(targetCode);
  }
}
