import { animate, state, style, transition, trigger } from '@angular/animations';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import {
  HeaderMenu,
  HomeLabelSceneData,
  LabelScenesRedirectMethodEnum,
  LeftMenu,
} from 'src/app/shared/interfaces/game.interface';
import { CountryUtilsService } from 'src/app/shared/service/country.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LeftMenuService } from './left-menu.service';

@UntilDestroy()
@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  animations: [
    trigger('show', [
      state(
        'true',
        style({ transform: 'translate3d(0,0,0)', opacity: 1, visibility: 'visible', 'pointer-events': 'all' }),
      ),
      state(
        'false',
        style({ transform: 'translate3d(-100%, 0, 0)', opacity: 0, visibility: 'hidden', 'pointer-events': 'none' }),
      ),
      transition('false <=> true', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
    ]),
  ],
})
export class LeftMenuComponent implements OnInit {
  domain = window.location.origin;

  logined!: boolean; //是否已登录
  isH5!: boolean; //是否h5
  allLangData!: LangModel[];

  pageSeries!: string;
  headerMenu!: any;
  leftMenu: LeftMenu[] = [];
  /** 默认左菜单数据 */
  defaultMenuData = JSON.parse(JSON.stringify(this.leftMenuService.DEFAULT_MENU));
  menuData = JSON.parse(JSON.stringify(this.leftMenuService.LEFT_MENU_DATA)); // 基本菜单数据
  menuReference: any = this.findMenuItem(this.menuData.list, [
    'sports',
    'lottery',
    'lottery-favorites',
    'lottery-history',
    'casino',
    'casino-favorites',
    'casino-history',
    'chess',
    'onLines',
    'langSelect',
    // 'oddsFormat',
    // 'countrySelect'
  ]); //菜单对象引用
  mainReference: any = this.findMenuItem(this.menuData.main, ['sport-main', 'casino-main', 'lottery-main']); //顶部菜单对象引用

  positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      panelClass: 'left-menu-options-overlay-down',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      panelClass: 'left-menu-options-overlay-up',
    },
  ];

  railPositions: ConnectedPosition[] = [...this.positions].reverse();
  railPositionsCenter: ConnectedPosition[] = this.railPositions.map(x => ({
    ...x,
    originX: 'center',
    overlayX: 'center',
  }));

  state!: boolean;
  invisible?: boolean;
  transition!: 'start' | 'end';

  closed!: boolean;
  opened!: boolean;
  processingCompleted!: boolean;

  constructor(
    private leftMenuService: LeftMenuService,
    private layout: LayoutService,
    public appService: AppService,
    private countryUtils: CountryUtilsService,
    public miniGameService: MiniGameService,
    public router: Router,
    private localStorageService: LocalStorageService,
  ) {
    //菜单开关相关 似乎必须放在构造函数里，否则显示会不正常
    combineLatest([
      this.layout.leftMenuState$, //伸展或收缩
      this.layout.leftMenuTransition$, //动画状态
      this.layout.leftMenuInvisible$.pipe(
        tap(x => {
          if (x) this.closeTooltip(this.menuData.list);
        }),
      ), //是否不可见
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([state, transition, invisible]) => {
        // console.log('state, transition, invisible', state, transition, invisible);
        this.state = state;
        this.invisible = invisible;
        this.opened = state && transition === 'end';
        this.closed = !state && transition === 'end';

        if (!state) {
          this.checkRouteToExpandMenu();
        }
      });
  }

  ngOnInit() {
    this.logined = Boolean(this.localStorageService.loginToken);
    if (this.logined) {
      // 初始获取小游戏收藏
      this.miniGameService.getFavoriteList().subscribe();
      // 初始获取小游戏最近玩过
      this.miniGameService.getRecentLyPlayedGame().subscribe();
    }

    //订阅是否是h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    //获取所有语言
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(x => {
      this.allLangData = x;
      this.langInit();
    });

    //盘口类型变化订阅
    // this.appService.oddsType$.pipe(untilDestroyed(this)).subscribe(v => {
    //   this.menuReference['oddsFormat'].select = v;
    // })

    //投注模式 亚洲版与欧洲版 订阅
    // this.appService.betMode$.pipe(untilDestroyed(this)).subscribe(v => {
    //   this.menuReference['countrySelect'].select = v;
    // })

    this.miniGameService
      .getNewSceneData()
      .pipe(
        untilDestroyed(this),
        map((data: HomeLabelSceneData) => {
          this.miniGameService.homeScenesSub$.next(data);
          this.miniGameService.allScenesData = data;
          this.headerMenu = data.headerMenus;

          this.leftMenu = data?.leftMenus?.map(x => {
            x.expand = false;
            if (x?.enableFavorites) {
              const favArr = this.leftMenuService.getFavArr(
                this.miniGameService.miniGameFavoriteNumber$,
                this.miniGameService.miniGameRecentLyPlayedNumber$,
              );
              x.infoExpandList = favArr.concat(x.infoExpandList);
            }
            return x;
          });
        }),
        // 订阅小游戏 收藏游戏 最近玩过 数量变化
        // concatMap(_ =>
        //   combineLatest([
        //     this.miniGameService.miniGameFavoriteNumber$,
        //     this.miniGameService.miniGameRecentLyPlayedNumber$,
        //   ]),
        // ),
        // debounceTime(300),
        // map(([favNum, playedNum]) => {
        //   // 这里的近期玩过 是前端统计数量，有几个游戏就会执行几次 ，增加防抖机制只取最后一次
        //   const favArr = this.leftMenuService.getFavArr(
        //     favNum ?? this.miniGameService.miniGameFavoriteNumber$.getValue(),
        //     playedNum ?? this.miniGameService.miniGameRecentLyPlayedNumber$.getValue(),
        //   );
        //   console.log(favArr);
        //   this.leftMenu?.map(x => {
        //     if (x?.enableFavorites) {
        //       // x?.infoExpandList?.splice(0, 2);
        //       // x.infoExpandList = favArr.concat(x.infoExpandList);
        //       // 防抖还是不保险 ，只更新num 不需要全部赋值S
        //       const favoritesIndex = x.infoExpandList.findIndex(item => item.ident === 'casino-favorites');
        //       const historyiIndex = x.infoExpandList.findIndex(item => item.ident === 'casino-history');
        //       if (favoritesIndex === -1 || historyiIndex === -1) {
        //         x.infoExpandList = favArr.concat(x.infoExpandList);
        //       } else {
        //         x.infoExpandList[favoritesIndex].num = favArr[0].num;
        //         x.infoExpandList[historyiIndex].num = favArr[1].num;
        //       }
        //       console.log(x.infoExpandList);
        //     }
        //   });
        // }),
        mergeMap(_ => this.layout.page$),
      )
      .subscribe(_ => {
        this.checkRouteToExpandMenu();

        // h5时候页面变化恒定关闭菜单
        if (this.isH5 && this.state) this.turn(false);
      });
  }

  /** 根据当前路由判断要不要展开菜单 */
  checkRouteToExpandMenu() {
    const url = this.router.url.split('/').slice(2).join('/');
    if (url && this.leftMenu) {
      this.leftMenu?.forEach(item => {
        item.expand = false;
        const menuUrl = this.getRouterLink(item);
        if (menuUrl && menuUrl === url) {
          item.expand = true;
        }
        if (item?.infoExpandList?.some(child => this.getRouterLink(child) === url)) item.expand = true;
      });
    }
  }

  //语言选择初始化
  langInit() {
    const langMenu = this.findMenuItem(this.defaultMenuData, ['langSelect']).langSelect;
    if (!langMenu) return;
    langMenu.options[0].select =
      this.allLangData.find(x => this.appService.languageCode === x.code.toLowerCase())?.id || this.allLangData[0]?.id;
    langMenu.options[0].options = this.allLangData.map(x => {
      return {
        text: x.name,
        menuIcon: 'country left-menu-country-icon ' + this.countryUtils.getcountryClassName(x.code),
        ...x,
      };
    });
  }

  //关闭菜单
  turn(v: boolean) {
    this.layout.leftMenuState$.next(v);
  }

  //检查顶部菜单路由是否激活
  checkIfHeaderRouterActive(page: HeaderMenu): boolean {
    const url = this.router.url.split('/').slice(2).join('/');
    const pageUrl = page.config?.assignUrl?.split('/').slice(1).join('/');
    const ifCurrentURLMatchAssignURL =
      url && pageUrl && page.redirectMethod === LabelScenesRedirectMethodEnum['AssignUrl'] && url.includes(pageUrl);

    return !!ifCurrentURLMatchAssignURL;
  }

  //点击顶部主要菜单，跳转的同时，自动展开相应的菜单并定位，关闭其它菜单，如果路由已经在此页，则不做动作
  clickMainMenu(item: any, isActive?: any) {
    if (isActive && this.checkIfHeaderRouterActive(item)) return;
    // 这个打开符合的层和所有子层
    this.leftMenu?.forEach(x => {
      x.expand = x?.labelId === item?.labelId;
    });
    const url = `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(item)}`;
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  // 这个只打开一层，放着备用
  toggleItem(target: any, ident: string) {
    target.forEach((x: any) => {
      x.expand = x.ident === ident;
      if (x.children) this.toggleItem(x.children, ident);
    });
  }

  // 这个打开符合的层和所有子层
  toggleItemInherit(target: any, ident: string, inherit?: boolean) {
    target.forEach((x: any) => {
      // if (inherit || x.ident === ident) x.expand = true; //不自动关闭
      x.expand = inherit === undefined ? x.ident === ident : inherit; //自动关闭
      if (x.children) this.toggleItemInherit(x.children, ident, x.ident === ident ? x.expand : undefined);
    });
  }

  //按ident寻找某一个菜单
  findMenuItem(data: any[], idents: string[]): any {
    const result: any = {};
    data.forEach(x => {
      if (idents.includes(x.ident)) {
        result[x.ident] = x;
      }
      if (x.children) {
        x.children.forEach((v: any) => {
          if (idents.includes(v.ident)) {
            result[v.ident] = v;
          }
        });
      } else if (x.options) {
        x.options.forEach((v: any) => {
          if (idents.includes(v.ident)) {
            result[v.ident] = v;
          }
        });
      }
    });
    return result;
  }

  //点击任何菜单项。主要是展开/收起的功能
  clickMenu(target: any, isRailitem = false) {
    if (target.isCS) {
      this.appService.toOnLineService$.next(true);
      return;
    }

    //存在子菜单，正常展开
    if (target.infoExpandList) {
      target.expand = !target.expand;
      if (!isRailitem && target.redirectMethod == LabelScenesRedirectMethodEnum['DropDownList']) return;
    }

    //点击子菜单 获取url跳转
    if (!target.options && !target.special) {
      const url = `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(target)}`;
      console.log('子菜单 跳转>>>', url);
      if (url) {
        this.router.navigateByUrl(url);
        //全屏游戏关闭菜单
        if (target.redirectMethod !== LabelScenesRedirectMethodEnum['DropDownList']) {
          if (url.includes('play')) {
            this.turn(false);
            return;
          }
        }
      }
    }

    //存在下拉展开菜单，交由下拉展开操作
    if (target.options) return;

    // 当点击需要关闭菜单
    if (target.closeOnclick) {
      this.turn(false);
      return;
    }

    // 特殊展开收起
    if (target.trigger) {
      target.value = target.value === 0 ? 1 : 0;
      this.clickTrigger(target);
      return;
    }
  }

  getRouterLink(menu: any) {
    //举例 play/ob/all
    return this.miniGameService.getLinkByMethod(menu).split('/').slice(1).join('/');
  }

  //点击收起时候的菜单
  clickRailMenu(target: any, isHeaderItem?: boolean) {
    if (isHeaderItem) {
      const header = this.leftMenu.find((x: any) => x.labelId == target.labelId);
      this.clickMenu(header, true);
      this.clickMainMenu(header, false);
      return;
    }

    this.clickMenu(target, true);
    //存在下拉展开菜单，交由下拉展开操作
    if (target.options) return;
  }

  //长按菜单
  onPressMenu(target: any) {}

  //点击特殊触发器
  clickTrigger(target: any) {}

  //检查是否禁用
  checkDisabled(target: any): boolean {
    if (target.disabled) return true;
    if (!this.logined && target.needLogined) return true;
    return false;
  }

  //菜单项是选择列表时的点击选择项动作
  optionsSelect(options: any, listItem: any) {
    switch (options.ident) {
      // case 'oddsFormat':
      //   this.localStorageService.oddsType = listItem.id;
      //   this.appService.oddsType = listItem.id;
      //   this.appService.oddsType$.next(listItem.id);
      //   if (this.logined) {
      //     this.settingsApi.modifyOddsFormat({ oddsFormat: listItem.id }).subscribe(data => {
      //       if (data) {
      //         this.toast.show({ message: this.localeService.getValue('set_s'), type: 'success' });
      //       } else {
      //         this.toast.show({ message: this.localeService.getValue('set_f'), type: 'fail' });
      //       }
      //     })
      //   }
      //   options.optionsExpand = false;
      //   break;
      // case 'countrySelect':
      //   this.localStorageService.betMode = listItem.id;
      //   this.appService.betMode$.next(listItem.id);
      //   if (this.logined) {
      //     this.settingsApi.modifyViewFormat({ viewFormat: listItem.id }).subscribe(data => {
      //       if (data) {
      //         this.toast.show({ message: this.localeService.getValue('set_s'), type: 'success' });
      //       } else {
      //         this.toast.show({ message: this.localeService.getValue('set_f'), type: 'fail' });
      //       }
      //     })
      //   }
      //   options.optionsExpand = false;
      //   break;
      case 'langList':
        const targetCode = listItem.code.toLowerCase();
        if (this.appService.languageCode === targetCode) return;
        this.appService.selectLangFun(targetCode);
        options.optionsExpand = false;
        break;
      default:
        break;
    }
  }

  //延迟执行关闭(修复因为事件重复执行导致点击原文字无法关闭的bug)
  nextTick(optionsItem: any) {
    setTimeout(() => (optionsItem.optionsExpand = false), 0);
  }

  /**关闭tooltip  */
  closeTooltip(item: any) {
    if (Array.isArray(item)) {
      item.forEach(x => {
        this.closeTooltip(x);
      });
    } else {
      if (item.tooltip) item.tooltip = false;
      if (item.children) this.closeTooltip(item.children);
    }
  }
}
