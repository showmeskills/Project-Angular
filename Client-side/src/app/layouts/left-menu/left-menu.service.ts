import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { ObLotteryService } from 'src/app/pages/obLottery/obLottery.service';
import { ConcatLeftmenu } from 'src/app/shared/interfaces/game.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Injectable({
  providedIn: 'root',
})
export class LeftMenuService {
  constructor(
    private miniGameService: MiniGameService,
    private localeService: LocaleService,
    private obLotteryService: ObLotteryService,
  ) {}

  LEFT_MENU_DATA = {
    main: [
      {
        name: this.localeService.getValue('sports'),
        ident: 'sport-main',
        icon: 'icon-tiyu',
        target: 'sports',
        page: 'play/FBSport-1',
      },
      {
        name: this.localeService.getValue('casino'),
        ident: 'casino-main',
        icon: 'icon-yulecheng',
        target: 'casino',
        page: 'casino',
      },
      {
        name: this.localeService.getValue('lottery'),
        ident: 'lottery-main',
        icon: 'icon-caipiao',
        target: 'lottery',
        page: 'lottery',
      },
    ],
    list: [
      {
        ident: 'sports',
        name: this.localeService.getValue('sports_event'),
        showOnRail: true,
        isRailMain: true,
        railPage: 'play/FBSport-1',
        railIcon: 'icon-tiyu',
        expand: true, //默认打开
        children: [
          //OB体育
          {
            name: this.localeService.getValue('ob_es'),
            ident: 'ob',
            page: 'play/OBSport-1',
            icon: 'icon-pm',
            class: 'bright',
            closeOnclick: true,
          },
          //IM体育
          {
            name: this.localeService.getValue('im_sport'),
            ident: 'imSport',
            page: 'play/IMSport-1',
            icon: 'icon-imSport',
            class: 'bright',
            closeOnclick: true,
          },
          //沙巴体育
          {
            name: this.localeService.getValue('sb_sport'),
            ident: 'saba',
            page: 'play/SaBaSport-1',
            icon: 'icon-sbtiyu',
            class: 'bright',
            closeOnclick: true,
          },
          //平博体育
          {
            name: this.localeService.getValue('sport_pingbo'),
            ident: 'pingbo',
            page: 'play/PinnacleSport-1',
            icon: 'icon-pingbo',
            class: 'bright',
            closeOnclick: true,
          },
          //FB体育
          {
            name: this.localeService.getValue('fb_sport'),
            ident: 'pingbo',
            page: 'play/FBSport-1',
            icon: 'icon-fb-sport',
            class: 'bright',
            closeOnclick: true,
          },
          //IM电竞
          {
            name: this.localeService.getValue('im_es'),
            ident: 'im',
            page: 'play/IMESport-2',
            icon: 'icon-im',
            class: 'bright',
            closeOnclick: true,
          },
          //平博电竞
          {
            name: this.localeService.getValue('pingbo_esport'),
            ident: 'pingboEsport',
            page: 'play/PinnacleSport-1/e-sports',
            icon: 'icon-pingbo-eSport',
            class: 'bright',
            closeOnclick: true,
          },
        ],
      },
      {
        ident: 'casino',
        name: this.localeService.getValue('casino'),
        showOnRail: true,
        isRailMain: true,
        railPage: 'casino/home/index',
        railIcon: 'icon-yulecheng',
        // expand: true, //默认打开
        children: [
          // {
          //   name: this.localeService.getValue('my_coll'),
          //   ident: 'casino-favorites',
          //   page: 'casino/favourites',
          //   icon: 'icon-shoucang',
          //   needLogined: true,
          // },
          // {
          //   name: this.localeService.getValue('all_rec'),
          //   ident: 'casino-history',
          //   page: 'casino/recentPlayed',
          //   icon: 'icon-history',
          //   needLogined: true,
          // },
        ],
      },
      // 彩票
      {
        ident: 'lottery',
        name: this.localeService.getValue('lottery'),
        showOnRail: true,
        isRailMain: true,
        railPage: 'lottery',
        railIcon: 'icon-caipiao',
        children: [
          {
            name: this.localeService.getValue('in_lott'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[0],
            icon: 'icon-jikaicai',
          },
          {
            name: this.localeService.getValue('pk_ten'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[1],
            icon: 'icon-pkshi',
          },
          {
            name: this.localeService.getValue('ssc'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[2],
            icon: 'icon-shishicai',
          },
          {
            name: this.localeService.getValue('lotto'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[3],
            icon: 'icon-shijiele',
          },
          {
            name: this.localeService.getValue('ele_five'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[4],
            icon: 'icon-fivein11',
          },

          {
            name: this.localeService.getValue('k_three'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[5],
            icon: 'icon-kuaisan',
          },
          {
            name: this.localeService.getValue('threed'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[6],
            icon: 'icon-threed',
          },
          {
            name: this.localeService.getValue('keno'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[7],
            icon: 'icon-kuailecai',
          },
          {
            name: this.localeService.getValue('shuanseqiu'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[8],
            icon: 'icon-shuangse',
          },
          {
            name: this.localeService.getValue('wanzifour'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[9],
            icon: 'icon-wanzifour',
          },
          {
            name: this.localeService.getValue('vnc'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[10],
            icon: 'icon-yuenancai',
          },
          {
            name: this.localeService.getValue('shaibao'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[11],
            icon: 'icon-shaibao',
          },
          {
            name: this.localeService.getValue('league_legends'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[12],
            icon: 'icon-leaguelegends',
          },
          {
            name: this.localeService.getValue('dipin'),
            page: 'casino/category/' + this.obLotteryService.MENU_DATA[13],
            icon: 'icon-dipincai',
          },
        ],
      },
      // 棋牌
      {
        ident: 'chess',
        name: this.localeService.getValue('chess'),
        showOnRail: true,
        isRailMain: true,
        railIcon: 'icon-xxgame',
        children: [
          // 开元棋牌
          {
            name: this.localeService.getValue('ky_game'),
            page: 'play/KYChess-6',
            icon: 'icon-ky',
            closeOnclick: true,
          },
          // 博雅棋牌
          {
            name: this.localeService.getValue('boyachess'),
            page: 'play/BoyaChess-6',
            icon: 'icon-boya',
            closeOnclick: true,
          },
          // 双赢棋牌
          {
            name: this.localeService.getValue('sgwinchess'),
            page: 'play/SGWinChess-6',
            icon: 'icon-sgwinchess',
            closeOnclick: true,
          },
          // 高登棋牌
          {
            name: this.localeService.getValue('golden_chess'),
            page: 'play/Golden-6',
            icon: 'icon-gorden',
            closeOnclick: true,
          },
          // YY棋牌
          {
            name: this.localeService.getValue('yychess'),
            page: 'play/YYChess-6',
            icon: 'icon-yychess',
            closeOnclick: true,
          },
        ],
      },
      {
        name: this.localeService.getValue('new_coupon'),
        ident: 'latest-offers', //请勿修改
        page: 'promotions/offer',
        icon: '',
      },
      {
        name: this.localeService.getValue('online_cs'),
        ident: 'onLines', //请勿修改
        page: '',
        icon: '',
      },
      // {
      //   name: this.localeService.getValue('odds') + ':',
      //   ident: 'odds',
      //   options: [
      //     {
      //       select: undefined,
      //       ident: 'oddsFormat', //请勿修改
      //       class: 'theme-color',
      //       options: []
      //     },
      //     {
      //       select: undefined,
      //       ident: 'countrySelect', //请勿修改
      //       options: []
      //     }
      //   ]
      // },
      {
        //语言选择
        name: this.localeService.getValue('lang') + ':',
        ident: 'langSelect', //请勿修改
        showOnRail: true,
        icon: '',
        page: '',
        options: [
          {
            select: undefined,
            selectIcon: true,
            ident: 'langList',
            options: [],
          },
        ],
      },
      //日夜间版
      {
        showOnRail: true,
        special: true,
        ident: 'theme-switch',
      },
    ],
  };

  DEFAULT_MENU = [
    {
      name: this.localeService.getValue('new_coupon'),
      ident: 'latest-offers',
      menuIcon: '',
      config: {
        assignUrl: '/promotions/offer',
      },
      redirectMethod: 'AssignUrl',
    },
    {
      name: this.localeService.getValue('online_cs'),
      ident: 'onLines',
      isCS: true,
      menuIcon: '',
    },
    {
      //语言选择
      name: this.localeService.getValue('lang') + ':',
      ident: 'langSelect',
      showOnRail: true,
      menuIcon: '',
      page: '',
      options: [
        {
          select: undefined,
          selectIcon: true,
          ident: 'langList',
          options: [],
        },
      ],
    },
    //日夜间版
    {
      showOnRail: true,
      special: true,
      ident: 'theme-switch',
    },
  ];

  //用于插入收藏数据
  getFavArr(favNum: BehaviorSubject<number>, collNum: BehaviorSubject<number>): ConcatLeftmenu[] {
    return [
      {
        name: this.localeService.getValue('my_coll'),
        ident: 'casino-favorites',
        menuIcon: 'icon-shoucang',
        config: {
          assignUrl: '/casino/favourites',
        },
        redirectMethod: 'AssignUrl',
        num: favNum,
        scenesType: 'Expand',
        needLogined: true,
      },
      {
        name: this.localeService.getValue('all_rec'),
        ident: 'casino-history',
        menuIcon: 'icon-history',
        config: {
          assignUrl: '/casino/recentPlayed',
        },
        redirectMethod: 'AssignUrl',
        num: collNum,
        hasBotLine: true,
        scenesType: 'Expand',
        needLogined: true,
      },
    ];
  }
}
