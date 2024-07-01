import { Component, DestroyRef, ElementRef, Input, OnChanges, OnDestroy, OnInit, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, combineLatest, interval, map, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { GameOrderApi } from 'src/app/shared/apis/gameorder.api';
import {
  ContestActivities,
  ContestActivitiesItem,
  ContestTableRow,
  IDropDown,
  Titles,
} from 'src/app/shared/interfaces/bonus.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { DailyRacesService } from './daily-races.service';

@Component({
  selector: 'app-daily-races',
  templateUrl: './daily-races.component.html',
  styleUrls: ['./daily-races.component.scss'],
  // animations: [
  //  trigger('inOutAnimation', [
  //     transition(':enter', [
  //       animate(
  //         '.5s ease-out',
  //         keyframes([
  //           style({ transform: 'translate3d(0, -100%, 0)', offset: 0 }),
  //           style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
  //         ])
  //       ),
  //     ]),
  //     transition('* => move', [
  //       animate(
  //         '.5s ease-out',
  //         keyframes([
  //           style({ transform: 'translate3d(0, -100%, 0)', offset: 0 }),
  //           style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
  //         ])
  //       ),
  //     ]),
  //   ]),
  // ],
  host: {
    class: 'container',
  },
})
export class DailyRacesComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private layout: LayoutService,
    private localeService: LocaleService,
    public dailyRacesService: DailyRacesService,
    private appSerivce: AppService,
    private destroyRef: DestroyRef,
    private elementRef: ElementRef,
    private gameOrderApi: GameOrderApi,
  ) {}

  /**是否冻结中，冻结时候，基本什么都不做也不显示 */
  @Input() freeze: boolean = true;

  /**唯一订阅，阻止没必要逻辑*/
  racesNav$?: Subscription;
  /**唯一订阅，阻止没必要逻辑*/
  updata$?: Subscription;

  isH5!: boolean;

  /** 各大排行榜的请求接口参数 */
  @Input() gameCategories!: string[];

  /** 竞赛活动导航 */
  racesNav: Array<{ name: string; indentId: string }> = [];

  /** 竞赛活动导航下标 */
  racesIndex: number = 0;

  /** 页码下拉 */
  dropDown: IDropDown[] = [
    { key: '10', value: 11 },
    { key: '20', value: 21 },
    { key: '30', value: 31 },
    { key: '40', value: 41 },
  ];

  /** 不同活动 表格head 不一样 */
  defaultDailyRacesTitle: ContestTableRow[] = [
    {
      // 0-有效流水
      executeType: 0,
      titles: [
        {
          icon: null,
          text: this.localeService.getValue('rank_a'),
        },
        {
          icon: null,
          text: this.localeService.getValue('gamer'),
        },
        {
          icon: 'icon-warning',
          text: this.localeService.getValue('race_total_bet'),
          toolTips: this.localeService.getValue('race_tips'),
        },
        {
          icon: null,
          text: this.localeService.getValue('race_reward'),
        },
      ],
    },
    {
      // 2-运气最好
      executeType: 2,
      titles: [
        {
          icon: null,
          text: this.localeService.getValue('rank_a'),
        },
        {
          icon: null,
          text: this.localeService.getValue('gamer'),
        },
        {
          icon: null,
          text: this.localeService.getValue('good_luck'),
          toolTips: null,
        },
        {
          icon: null,
          text: this.localeService.getValue('race_reward'),
        },
      ],
    },
    // {
    //   // 3 - 积分规则 未开放
    //   executeType: 3,
    //   titles: [
    //     {
    //       icon: null,
    //       text: this.localeService.getValue('rank_a'),
    //     },
    //     {
    //       icon: null,
    //       text: this.localeService.getValue('gamer'),
    //     },
    //     {
    //       icon: 'icon-warning',
    //       text: `${this.localeService.getValue('gamer')}, ${this.localeService.getValue('good_luck')}`,
    //       toolTips: this.localeService.getValue('race_tips'),
    //     },
    //     {
    //       icon: null,
    //       text: this.localeService.getValue('race_reward'),
    //     },
    //   ],
    // },
    {
      // 10-大赢家(总输赢)
      executeType: 10,
      titles: [
        {
          icon: null,
          text: this.localeService.getValue('rank_a'),
        },
        {
          icon: null,
          text: this.localeService.getValue('gamer'),
        },
        {
          icon: null,
          text: this.localeService.getValue('total_w_l'),
          toolTips: null,
        },
        {
          icon: null,
          text: this.localeService.getValue('race_reward'),
        },
      ],
    },
    {
      // 11-大赢家(单笔最大盈利)
      executeType: 11,
      titles: [
        {
          icon: null,
          text: this.localeService.getValue('rank_a'),
        },
        {
          icon: null,
          text: this.localeService.getValue('gamer'),
        },
        {
          icon: null,
          text: this.localeService.getValue('maximum_profit_amount'),
          toolTips: null,
        },
        {
          icon: null,
          text: this.localeService.getValue('race_reward'),
        },
      ],
    },
  ];

  /** 列表第一排标题 */
  dailyRacesTitle: Titles[] = this.defaultDailyRacesTitle[0].titles;

  /** 每日竞赛 loading 长度 */
  dailyRacesLoadingLength = new Array(10).fill(0);

  /** 渲染数据 */
  disabledSwitch = computed(() => {
    if (
      this.dailyRacesService.myBetData().loading ||
      this.dailyRacesService.allBetsData().loading ||
      this.dailyRacesService.heroBetsData().loading ||
      this.dailyRacesService.luckiestBetsdata().loading
    )
      return true;

    return false;
  });
  renderMyBetData = computed(() => this.dailyRacesService.myBetData());
  renderAllBetData = computed(() => this.dailyRacesService.allBetsData());
  renderHeroBetData = computed(() => this.dailyRacesService.heroBetsData());
  renderLuckiestBetData = computed(() => this.dailyRacesService.luckiestBetsdata());

  ngOnInit(): void {
    this.layout
      .intersectionObservable(this.elementRef.nativeElement, null, 0)
      .pipe()
      .subscribe(x => {
        if (x.isIntersecting) {
          this.freeze = false;
          this.checkChanges();
        }
      });

    this.layout.isH5$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => (this.isH5 = v));
  }

  ngOnChanges() {
    this.checkChanges();
  }

  checkChanges() {
    if (this.freeze) return;

    if (!this.updata$) {
      this.updata$ = interval(1000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const data = this.dailyRacesService.collectionData
            .sort((a, b) => Number(a?.data?.BetTime || 0) - Number(b?.data?.BetTime || 0))
            .shift();
          if (data) {
            this.dailyRacesService.onWagerRank(data);
          }
        });
    }

    if (!this.racesNav$) {
      this.racesNav$ = combineLatest([
        this.dailyRacesService.getDailyTitles(),
        this.appSerivce.userInfo$.pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(logined => {
            this.racesNav = [];
            this.initHall(!!logined);
          }),
        ),
      ])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([topList]) => {
          this.onNavBarProcessing(topList);
        });
    }
  }

  ngOnDestroy(): void {
    this.onResetData();
  }

  onResetData() {
    this.dailyRacesService.collectionData = [];
    this.dailyRacesService.myBetData.update(item => ({
      ...item,
      data: [],
    }));
    this.dailyRacesService.allBetsData.update(item => ({
      ...item,
      data: [],
    }));
    this.dailyRacesService.heroBetsData.update(item => ({
      ...item,
      data: [],
    }));
    this.dailyRacesService.luckiestBetsdata.update(item => ({
      ...item,
      data: [],
    }));
  }

  // a!: Subscription;
  // onStop() {
  //   this.a.unsubscribe();
  //   this.dailyRacesService.collectionData = [];
  // }

  // onTest() {
  //   this.pushData();
  // }

  // b = 1001;
  // pushData() {
  //   this.b += 1;
  //   const data = [
  //     {
  //       action: 'WagerRank',
  //       data: {
  //         Avater: 'User/23/07/04/638240476573907865/638240476573895518.png',
  //         BetAmount: 11,
  //         BetTime: 10,
  //         BetUsdt: 10000,
  //         Currency: 'USDT',
  //         GameCategory: 'Lottery',
  //         GameCode: 'DICE',
  //         GameName: {
  //           'en-us': 'DICE',
  //           th: 'DICE',
  //           vi: 'DICE',
  //           'zh-cn': '10骰子骰子骰子骰子骰子骰子骰子',
  //         },
  //         Odds: 9999,
  //         OrderNum: `G${new Date().getTime()}G`,
  //         PayAmount: 0,
  //         PayAmountUsdt: 0,
  //         PayoutAmount: 9999,
  //         PayoutUsdt: 9999,
  //         Provider: {
  //           app: 'GameProvider/23/48/08/638270704824572739/file/638270704824572601.png',
  //           h5: '',
  //           name: '原创游戏',
  //           web: 'GameProvider/23/47/08/638270704779094812/file/638270704779094579.png',
  //         },
  //         Status: 'Settle',
  //         Uid: '01000264',
  //         UserName: 'cczczasdadaqwe',
  //       },
  //       related: 'Rank',
  //       status: 'Success',
  //       time: 0,
  //     },
  //     {
  //       action: 'WagerRank',
  //       data: {
  //         Avater: 'User/23/07/04/638240476573907865/638240476573895518.png',
  //         BetAmount: 30000,
  //         BetTime: 9,
  //         BetUsdt: 30000,
  //         Currency: 'CNY',
  //         GameCategory: 'Lottery',
  //         GameCode: 'DICE',
  //         GameName: {
  //           'en-us': 'DICE',
  //           th: 'DICE',
  //           vi: 'DICE',
  //           'zh-cn': '9骰子',
  //         },
  //         Odds: 5.234123123,
  //         OrderNum: `G${new Date().getTime()}G`,
  //         PayAmount: 0,
  //         PayAmountUsdt: 9999,
  //         PayoutAmount: 9999,
  //         PayoutUsdt: 9999,
  //         Provider: {
  //           app: 'GameProvider/23/48/08/638270704824572739/file/638270704824572601.png',
  //           h5: '',
  //           name: '原创游戏',
  //           web: 'GameProvider/23/47/08/638270704779094812/file/638270704779094579.png',
  //         },
  //         Status: 'Settle',
  //         Uid: '01000264',
  //         UserName: '',
  //       },
  //       related: 'Rank',
  //       status: 'Success',
  //       time: 1,
  //     },
  //     {
  //       action: 'WagerRank',
  //       data: {
  //         Avater: 'User/23/07/04/638240476573907865/638240476573895518.png',
  //         BetAmount: 30000,
  //         BetTime: 9,
  //         BetUsdt: 100000,
  //         Currency: 'CNY',
  //         GameCategory: 'Lottery',
  //         GameCode: 'DICE',
  //         GameName: {
  //           'en-us': 'DICE',
  //           th: 'DICE',
  //           vi: 'DICE',
  //           'zh-cn': '9骰子',
  //         },
  //         Odds: 1002.555,
  //         OrderNum: `G${new Date().getTime()}G`,
  //         PayAmount: 0,
  //         PayAmountUsdt: 9999,
  //         PayoutAmount: 9999,
  //         PayoutUsdt: 9999,
  //         Provider: {
  //           app: 'GameProvider/23/48/08/638270704824572739/file/638270704824572601.png',
  //           h5: '',
  //           name: '原创游戏',
  //           web: 'GameProvider/23/47/08/638270704779094812/file/638270704779094579.png',
  //         },
  //         Status: 'Settle',
  //         Uid: '01000264',
  //         UserName: '',
  //       },
  //       related: 'Rank',
  //       status: 'Success',
  //       time: 1,
  //     },
  //     {
  //       action: 'WagerRank',
  //       data: {
  //         Avater: 'User/23/07/04/638240476573907865/638240476573895518.png',
  //         BetAmount: 30000,
  //         BetTime: 9,
  //         BetUsdt: '1',
  //         Currency: 'CNY',
  //         GameCategory: 'Lottery',
  //         GameCode: 'DICE',
  //         GameName: {
  //           'en-us': 'DICE',
  //           th: 'DICE',
  //           vi: 'DICE',
  //           'zh-cn': '9骰子',
  //         },
  //         Odds: null,
  //         OrderNum: `G${new Date().getTime()}G`,
  //         PayAmount: 0,
  //         PayAmountUsdt: 0,
  //         PayoutAmount: -1,
  //         PayoutUsdt: -1,
  //         Provider: {
  //           app: 'GameProvider/23/48/08/638270704824572739/file/638270704824572601.png',
  //           h5: '',
  //           name: '原创游戏',
  //           web: 'GameProvider/23/47/08/638270704779094812/file/638270704779094579.png',
  //         },
  //         Status: 'Settle',
  //         Uid: '01000264',
  //         UserName: '',
  //       },
  //       related: 'Rank',
  //       status: 'Success',
  //       time: 1,
  //     },
  //     {
  //       related: 'Rank',
  //       status: 'Success',
  //       time: 1,
  //       data: {
  //         OrderNum: 'G3954043955448774G',
  //         Uid: '01000264',
  //         UserName: 'conan0033',
  //         Avater: 'User/23/07/04/638240476573907865/638240476573895518.png',
  //         Provider: {
  //           web: 'GameProvider/23/23/25/638312018021484465/file/638312018021484356.png',
  //           h5: '',
  //           app: 'GameProvider/23/23/25/638312018121218645/file/638312018121218467.png',
  //           name: 'BGaming',
  //         },
  //         GameCategory: 'SlotGame',
  //         GameCode: 'softswiss:AllLuckyClover100',
  //         GameName: {
  //           'en-us': 'All Lucky Clovers 100',
  //           th: 'Lucky Clover ทั้งหมด 100',
  //           vi: 'Tất cả Lucky Clover 100',
  //           'zh-cn': '所有幸运四叶草 100',
  //         },
  //         BetUsdt: 99999,
  //         BetAmount: 99999,
  //         Currency: 'CNY',
  //         BetTime: 1702833047000,
  //         Odds: 99999,
  //         PayoutUsdt: 99999,
  //         PayoutAmount: 99999,
  //         Status: 'Settle',
  //         PayAmount: 99999,
  //         PayAmountUsdt: 99999,
  //       },
  //     },
  //   ];
  //   this.dailyRacesService.collectionData.push(...(data as any));
  // }

  /**
   * 过滤对应的导航
   *
   * @param userInfo 用户信息
   * @param topList 竞赛 top nav
   * @param list
   * @returns
   */
  onNavBarProcessing(list: ContestActivities) {
    const topList = list?.title || [];

    if (topList.length > 0) {
      const executeType = topList[this.dailyRacesService.selectedActivitIndex].executeType;

      const firstRow = this.defaultDailyRacesTitle.find(row => row.executeType === executeType);
      if (firstRow) {
        this.dailyRacesTitle = firstRow.titles;
      }
      this.racesNav.push({
        indentId: 'race_text',
        name: this.localeService.getValue('race_text'),
      });
    }
  }

  initHall(logined: boolean) {
    if (logined) {
      this.racesNav.push(
        {
          indentId: 'my_bet',
          name: this.localeService.getValue('my_bet'),
        },
        {
          indentId: 'all_bet',
          name: this.localeService.getValue('all_bet'),
        },
        {
          indentId: 'windy_list',
          name: this.localeService.getValue('windy_list'),
        },
        {
          indentId: 'luckiest',
          name: this.localeService.getValue('luckiest'),
        },
      );
    } else {
      this.racesNav.push(
        {
          indentId: 'all_bet',
          name: this.localeService.getValue('all_bet'),
        },
        {
          indentId: 'windy_list',
          name: this.localeService.getValue('windy_list'),
        },
        {
          indentId: 'luckiest',
          name: this.localeService.getValue('luckiest'),
        },
      );
    }
    this.onResetData();
    this.dailyRacesService.currentTable = this.racesNav[0].indentId;

    if (this.dailyRacesService.currentTable === 'my_bet') {
      this.onMyBet();
    }

    if (this.dailyRacesService.currentTable === 'all_bet') {
      this.onAllBets();
    }
  }

  /**
   * 下拉数量 请求
   *
   * @param event 数量
   */
  onValueChange(event: number) {
    this.dailyRacesService.pageSize = event;
    this.dailyRacesService.collectionData = [];
    switch (this.dailyRacesService.currentTable) {
      case 'my_bet':
        this.onMyBet();
        return;
      case 'all_bet':
        this.onAllBets();
        return;
      case 'windy_list':
        this.onHeroBets();
        return;
      case 'luckiest':
        this.onLuckiestBets();
        return;
      case 'race_text':
        this.dailyRacesService.getRank();
        return;
      default:
        return;
    }
  }

  /**
   * 选择对应活动 每日竞赛
   *
   * @param idx
   * @param item
   * @param contestItem
   */
  onSelectAcivity(idx: number, contestItem: ContestActivitiesItem) {
    if (this.dailyRacesService.selectedActivitIndex === idx) return;
    this.dailyRacesService.selectedActivitIndex = idx;
    const firstRow = this.defaultDailyRacesTitle.find(row => contestItem.executeType === row.executeType);
    if (firstRow) {
      this.dailyRacesTitle = firstRow.titles;
    }
    this.dailyRacesService.getRank();
  }

  /**
   * 切换table
   *
   * @param race
   * @param race.name
   * @param index
   * @param race.indentId
   */
  onSelectTable(race: { name: string; indentId: string }, index: number) {
    if (this.racesIndex === index) return;
    this.onResetData();
    this.dailyRacesService.currentTable = race.indentId;
    this.racesIndex = index;
    this.dailyRacesService.pageSize = 11;
    switch (this.dailyRacesService.currentTable) {
      case 'my_bet':
        this.onMyBet();
        return;
      case 'all_bet':
        this.onAllBets();
        return;
      case 'windy_list':
        this.onHeroBets();
        return;
      case 'luckiest':
        this.onLuckiestBets();
        return;
      case 'race_text':
        this.dailyRacesService.getTitleList();
        return;
      default:
        return;
    }
  }

  /**
   * 整数去掉8位小数
   *
   * @param num
   * @num 数字或者字符类型
   * @returns NUMBER
   */
  toParseInt(num: string | number): any {
    const data = num.toString();
    if (Number(data) % 1 === 0) {
      return Number(num) * 1;
    } else {
      return num;
    }
  }

  /** 我的投注 */
  onMyBet() {
    this.dailyRacesService.myBetData.update(item => ({
      ...item,
      loading: true,
    }));
    this.gameOrderApi
      .getMyBet(this.dailyRacesService.pageSize, this.gameCategories)
      .pipe(
        map(v => {
          return v.map(x => ({
            ...x,
            odds: this.dailyRacesService.onProcessOdd(x?.odds as number),
          }));
        }),
      )
      .subscribe(data => {
        this.dailyRacesService.myBetData.update(item => ({
          ...item,
          loading: false,
          data,
        }));
      });
  }

  /** 所有投注*/
  onAllBets() {
    this.dailyRacesService.allBetsData.update(item => ({
      ...item,
      loading: true,
    }));

    this.gameOrderApi
      .getAllBets(this.dailyRacesService.pageSize, this.gameCategories)
      .pipe(
        map(v => {
          return v.map(x => ({
            ...x,
            odds: this.dailyRacesService.onProcessOdd(x?.odds as number),
          }));
        }),
      )
      .subscribe(data => {
        this.dailyRacesService.allBetsData.update(item => ({
          ...item,
          loading: false,
          data,
        }));
      });
  }

  /** 风云榜 */
  onHeroBets() {
    this.dailyRacesService.heroBetsData.update(item => ({
      ...item,
      loading: true,
    }));
    this.gameOrderApi
      .getHeroBet(this.dailyRacesService.pageSize, this.gameCategories)
      .pipe(
        map(v => {
          return v.map(x => ({
            ...x,
            odds: this.dailyRacesService.onProcessOdd(x?.odds as number),
          }));
        }),
      )
      .subscribe(data => {
        this.dailyRacesService.heroBetsData.update(item => ({
          ...item,
          loading: false,
          data,
        }));
      });
  }

  /**  最幸运 */
  onLuckiestBets() {
    this.dailyRacesService.luckiestBetsdata.update(item => ({
      ...item,
      loading: true,
    }));

    this.gameOrderApi
      .getLuckiest(this.dailyRacesService.pageSize, this.gameCategories)
      .pipe(
        map(v => {
          return v.map(x => ({
            ...x,
            odds: this.dailyRacesService.onProcessOdd(x?.odds as number),
          }));
        }),
      )
      .subscribe(data => {
        this.dailyRacesService.luckiestBetsdata.update(item => ({
          ...item,
          loading: false,
          data,
        }));
      });
  }
}
