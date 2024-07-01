import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { SettingsApi } from 'src/app/shared/apis/settings.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { InvisibleMode, MainThemeList } from 'src/app/shared/interfaces/settings.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from './../../shared/service/toast.service';
import { SettingDialogComponent } from './setting-dialog/setting-dialog.component';
import { SettingsService } from './settings.service';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  isH5!: boolean;

  betModeList: any[] = [
    { id: 'euro', name: 'european' },
    { id: 'asia', name: 'asian' },
  ];

  allLangData: any[] = [];

  /** 默认注码 */
  selectedCurrency: any = [];

  /** 主题list */
  mainThemeList: MainThemeList[] = [
    {
      title: this.localeService.getValue('profile'),
      subThemeList: [
        {
          settingIcon: 'img-avator',
          settingTitle: this.localeService.getValue('avatar'),
          settingDesc: this.localeService.getValue('select_pro'),
          settingItem: { url: '' },
          setIdx: 0,
          isShowNormal: false,
          loading: false,
          btnNormal: true,
          isShowCorrectIcon: true,
        },
        {
          settingIcon: 'img-language',
          settingTitle: this.localeService.getValue('de_lang'),
          settingDesc: this.localeService.getValue('lang_tip'),
          settingItem: [],
          setIdx: 3,
          isShowNormal: true,
          btnNormal: true,
          isShowCorrectIcon: true,
        },
        {
          settingIcon: 'img-default-currency',
          settingTitle: this.localeService.getValue('default_currency'),
          settingDesc: this.localeService.getValue('default_currency_text'),
          settingItem: { currency: '' },
          setIdx: 10,
          isShowNormal: false,
          btnNormal: true,
          isCurrency: true,
          isShowCorrectIcon: true,
        },
        {
          settingIcon: 'img-invisible',
          settingTitle: this.localeService.getValue('invisible_mode'),
          settingDesc: this.localeService.getValue('invisible_desc'),
          settingItem: [{ name: '', active: true }],
          setIdx: 11,
          isShowNormal: true,
          btnNormal: true,
          isShowCorrectIcon: true,
        },
      ],
    },
    {
      title: this.localeService.getValue('settings'),
      subThemeList: [
        // {
        //   settingIcon: 'img-notify',
        //   settingTitle: this.localeService.getValue('order_reminder'),
        //   settingDesc: this.localeService.getValue('rem_tip'),
        //   settingItem: [],
        //   setIdx: 1,
        //   isShowNormal: true,
        //   loading: false,
        //   btnNormal: true
        // },
        {
          settingIcon: 'img-coupon',
          settingTitle: this.localeService.getValue('setting_coupon'),
          settingDesc: this.localeService.getValue('coupon_for_tip'),
          settingItem: [{ name: this.localeService.getValue('coupon_content'), active: true }],
          setIdx: 8,
          isShowNormal: true,
          btnNormal: false,
          isEnableCreit: false,
          loading: false,
          isShowCorrectIcon: true,
        },
        // {
        //   settingIcon: 'img-betting',
        //   settingTitle: this.localeService.getValue('setting_betting'),
        //   settingDesc: this.localeService.getValue('betting_for_tip'),
        //   settingItem: [],
        //   setIdx: 9,
        //   isShowNormal: true,
        //   btnNormal: true,
        // },
        // {
        //   settingIcon: 'img-rate',
        //   settingTitle: this.localeService.getValue('odd_set'),
        //   settingDesc: this.localeService.getValue('accept_game_odds'),
        //   settingItem: [
        //     { name: 'accept_odds', active: true }
        //   ],
        //   setIdx: 2,
        //   loading: false,
        //   isShowNormal: true,
        //   btnNormal: true,
        // },
        // {
        //   settingIcon: 'img-rate-style',
        //   settingTitle: this.localeService.getValue('odd_format'),
        //   settingDesc: this.localeService.getValue('odd_for_tip'),
        //   settingItem: [],
        //   setIdx: 4,
        //   isShowNormal: true,
        //   btnNormal: true
        // },
        // {
        //   settingIcon: 'img-view-style',
        //   settingTitle: this.localeService.getValue('vie_format'),
        //   settingDesc: this.localeService.getValue('vie_for_tip'),
        //   settingItem: [],
        //   setIdx: 5,
        //   isShowNormal: true,
        //   btnNormal: true
        // }
      ],
    },
    {
      title: this.localeService.getValue('noti_set'),
      subThemeList: [
        {
          settingIcon: 'img-language',
          settingTitle: this.localeService.getValue('noti_lang'),
          settingDesc: this.localeService.getValue('noti_tip'),
          settingItem: [],
          setIdx: 6,
          isShowNormal: true,
          loading: false,
          btnNormal: true,
          isShowCorrectIcon: true,
        },
        {
          settingIcon: 'img-color-clock',
          settingTitle: this.localeService.getValue('insite_noti'),
          settingDesc: this.localeService.getValue('noti_set_tip'),
          settingItem: [],
          setIdx: 7,
          isShowNormal: true,
          loading: false,
          btnNormal: true,
          isShowCorrectIcon: true,
        },
      ],
    },
  ];

  constructor(
    private layout: LayoutService,
    public location: Location,
    private toast: ToastService,
    private appService: AppService,
    private popup: PopupService,
    private accountApi: AccountApi,
    private localeService: LocaleService,
    private settingsService: SettingsService,
    private settingsApi: SettingsApi,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(x => {
      this.allLangData = x;
      this.setActiveLang(this.appService.languageCode);
    });
    //订阅用户上传头像
    this.appService.userInfo$
      .pipe(
        untilDestroyed(this),
        map(x => x?.avater)
      )
      .subscribe(avater => {
        this.mainThemeList[0].subThemeList[0].settingItem.url = avater || '';
      });
    //订阅 视图格式
    // this.appService.betMode$.pipe(untilDestroyed(this)).subscribe(e => {
    //   this.mainThemeList[1].subThemeList[5].settingItem = this.betModeList.filter(x => x.id === e).map((item: any) => ({ ...item, active: true }));
    // })
    //订阅 赔率格式
    // this.appService.oddsType$.pipe(untilDestroyed(this)).subscribe(e => {
    //   this.mainThemeList[1].subThemeList[4].settingItem = this.appService.oddsTypeList.filter(x => x.id === e).map(item => ({ ...item, active: true }));
    // })
    //订阅 默认货币
    this.appService.currentCurrency$
      .pipe(
        untilDestroyed(this),
        filter(v => v !== undefined)
      )
      .subscribe(currency => {
        this.mainThemeList[0].subThemeList[2].settingItem.currency = currency.currency;
      });

    this.settingsService.setDefaultCurrencyLoading$
      .pipe(untilDestroyed(this))
      .subscribe(loading => (this.mainThemeList[0].subThemeList[2].loading = loading));

    this.settingsService.enableCredit$.pipe(untilDestroyed(this)).subscribe(isEnableCredit => {
      this.mainThemeList[1].subThemeList[0].isEnableCreit = isEnableCredit;
      if (!isEnableCredit) {
        this.mainThemeList[1].subThemeList[0].settingItem = [
          { name: this.localeService.getValue('no_coupon_content'), active: true },
        ];
        this.mainThemeList[1].subThemeList[0].isShowCorrectIcon = false;
      } else {
        this.mainThemeList[1].subThemeList[0].settingItem = [
          { name: this.localeService.getValue('coupon_content'), active: true },
        ];
        this.mainThemeList[1].subThemeList[0].isShowCorrectIcon = true;
      }
    });

    this.loadNoticeSetting();

    this.settingsService.invisibleMode$
      .pipe(
        untilDestroyed(this),
        filter(x => x?.length > 0)
      )
      .subscribe(data => {
        let invibleMode: string = '';
        switch (data) {
          case InvisibleMode.SHOWUSERNAME:
            invibleMode = this.localeService.getValue('show_username');
            break;
          case InvisibleMode.SHOWUID:
            invibleMode = this.localeService.getValue('show_uid');
            break;
          case InvisibleMode.INVISIBILITY:
            invibleMode = this.localeService.getValue('fully_invisible');
            break;
        }
        this.mainThemeList[0].subThemeList[3].settingItem[0].name = invibleMode;
      });
  }

  /**获取通知 配置 */
  loadNoticeSetting() {
    this.mainThemeList[0].subThemeList[0].loading = true;
    this.settingsApi.getNoticeConfig().subscribe(noticeConfig => {
      this.mainThemeList[0].subThemeList[0].loading = false;
      if (noticeConfig?.data) {
        const langName =
          noticeConfig.data.language.length > 0
            ? this.allLangData.filter(item => item.code === noticeConfig.data.language)[0].name
            : this.localeService.getValue('not_set');
        this.mainThemeList[2].subThemeList[0].settingItem = [{ name: langName, active: true }];
        const noticeTypeList = noticeConfig.data.noticeTypeList;
        this.mainThemeList[2].subThemeList[1].settingItem = [];
        if (noticeTypeList.length > 0) {
          noticeTypeList.forEach((item: string) => {
            switch (item) {
              case 'System':
                this.mainThemeList[2].subThemeList[1].settingItem.push({
                  name: this.localeService.getValue('sys_noti'),
                  enName: item,
                  active: true,
                });
                break;
              case 'Transaction':
                this.mainThemeList[2].subThemeList[1].settingItem.push({
                  name: this.localeService.getValue('trade_noti'),
                  enName: item,
                  active: true,
                });
                break;
              case 'Information':
                this.mainThemeList[2].subThemeList[1].settingItem.push({
                  name: this.localeService.getValue('news_noti'),
                  enName: item,
                  active: true,
                });
                break;
              case 'Activity':
                this.mainThemeList[2].subThemeList[1].settingItem.push({
                  name: this.localeService.getValue('activities_noti'),
                  enName: item,
                  active: true,
                });
                break;
            }
          });
          this.mainThemeList[2].subThemeList[1].isShowCorrectIcon = true;
        } else {
          this.mainThemeList[2].subThemeList[1].settingItem.push({
            name: this.localeService.getValue('not_set'),
            active: true,
          });
          this.mainThemeList[2].subThemeList[1].isShowCorrectIcon = false;
        }
      }
    });
  }

  //打开弹窗设置
  onSetting(i: number, settingTitle: string, settingItem: any): void {
    switch (i) {
      case 0:
        this.openSettingDialog(i, settingTitle, '', settingItem, true);
        return;
      case 1:
      case 2:
      case 9:
        this.commingSoon();
        return;
      case 4:
      case 5:
        this.openSettingDialog(i, settingTitle, 'odd_for_tip', settingItem, false);
        return;
      case 6:
      case 3:
        const description = i === 3 ? 'lang_tip' : 'noti_lang_tip';
        this.openSettingDialog(i, settingTitle, description, settingItem, false);
        return;
      case 7:
        const newSettingItem = [
          { name: 'sys_noti', enName: 'System', active: false },
          { name: 'trade_noti', enName: 'Transaction', active: false },
          { name: 'news_noti', enName: 'Information', active: false },
          { name: 'activities_noti', enName: 'Activity', active: false },
        ];
        newSettingItem.forEach(item => {
          settingItem.forEach((type: any) => {
            if (item.enName === type.enName) item.active = true;
          });
        });
        this.openSettingDialog(i, settingTitle, 'enable_noti_tip', newSettingItem, false);
        return;
      case 10:
        this.dialog
          .open(SelectCurrencyComponent, {
            panelClass: 'custom-dialog-container',
            data: {
              isShowAllCurrencies: true,
              showBalance: false,
            },
          })
          .afterClosed()
          .subscribe((selectedCurrency: CurrenciesInterface | undefined) => {
            if (selectedCurrency) {
              const { currency } = selectedCurrency;
              const hasSelectedCurrency = this.mainThemeList[0].subThemeList[2].settingItem.currency;
              if (hasSelectedCurrency === currency) return;
              this.settingsService.setUserDefaultCurrency({ defaultCurrencyType: currency }, currency);
            }
          });
        return;
      case 11:
        this.openSettingDialog(i, settingTitle, 'invisible_desc', settingItem, false);
        return;
      default:
        return;
      //case 9:
      // this.openSettingDialog(i, settingTitle, 'betting_for_tip', settingItem, false);
      // return;
    }
  }

  //打开平台设置弹窗
  openSettingDialog(
    i: number,
    title: string,
    settingDesc: string,
    settingItem: any,
    isMulptiBtns: boolean | null
  ): void {
    this.popup.open(SettingDialogComponent, {
      inAnimation: this.isH5 ? 'fadeInUp' : undefined,
      outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
      position: this.isH5 ? { bottom: '0px' } : undefined,
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
      data: {
        settingidx: i,
        title,
        settingDesc,
        settingItem,
        isMulptiBtns,
        callback: this.dialogCallback.bind(this),
      },
    });
  }

  //窗口callback
  dialogCallback(data: any): void {
    switch (data.settingidx) {
      case 0:
        if (data.success) {
          this.getUserInfo();
        }
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        const { code } = data.settingItem[0];
        this.setActiveLang(code);
        this.selectLang(this.allLangData.find(x => x.name == data.lang));
        data.success = true;
        break;
      case 6:
      case 7:
        if (data.success) {
          this.loadNoticeSetting();
        }
        break;
      default:
        break;
    }
    const titleLocale = this.localeService.getValue(data.title);
    if (data.success) {
      const successLocale = this.localeService.getValue('set_s');
      this.toast.show({ message: `${titleLocale} ${successLocale}`, type: 'success' });
    } else {
      const failLocale = this.localeService.getValue('set_f');
      this.toast.show({ message: `${titleLocale} ${failLocale}`, type: 'fail' });
    }
  }

  // 刷新用户信息
  async getUserInfo() {
    this.mainThemeList[0].subThemeList[0].loading = true;
    const accountInfor = await firstValueFrom(this.accountApi.getUserAccountInfor());
    if (accountInfor.success) {
      this.mainThemeList[0].subThemeList[0].loading = false;
      this.appService.userInfo$.next(accountInfor.data);
    }
  }

  setActiveLang(activeLangCode: string) {
    this.mainThemeList[0].subThemeList[1].settingItem = this.allLangData
      .map(item => {
        return {
          ...item,
          active: activeLangCode.toLowerCase() == item.code.toLowerCase() ? true : false,
        };
      })
      .filter(item => item.active === true);
  }

  selectLang(selectedLang: LangModel) {
    const targetCode = selectedLang.code.toLowerCase();
    if (this.appService.languageCode === targetCode) return;
    this.appService.selectLangFun(targetCode);
  }

  /**
   * 使用抵用券开发
   *
   * @param value toggle 值
   */
  toggle(value: any) {
    console.log(value);
    this.mainThemeList[1].subThemeList[0].loading = true;
    this.settingsApi.setModifyCredit({ isEnable: value?.checked }).subscribe(data => {
      this.mainThemeList[1].subThemeList[0].loading = false;
      if (data) {
        this.toast.show({ message: this.localeService.getValue('set_s'), type: 'success' });
        this.settingsService.enableCredit$.next(value?.checked);
      } else {
        this.toast.show({ message: this.localeService.getValue('set_f'), type: 'fail' });
      }
    });
  }

  commingSoon() {
    // 换成敬请期待
    this.toast.show({
      message: `${this.localeService.getValue('comming')}, ${this.localeService.getValue('waiting')}`,
      title: this.localeService.getValue('hint'),
      type: 'fail',
    });
  }
}
