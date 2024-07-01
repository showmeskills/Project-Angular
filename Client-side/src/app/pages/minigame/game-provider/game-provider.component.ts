import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import {
  GameProviderParams,
  GameSort,
  LabelCodeList,
  ProviderInterface,
} from 'src/app/shared/interfaces/game.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-game-provider',
  templateUrl: './game-provider.component.html',
  styleUrls: ['./game-provider.component.scss'],
})
export class GameProviderComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private layout: LayoutService,
    private miniGameService: MiniGameService,
    private appService: AppService
  ) {}

  isH5!: boolean;
  providerId: string = '';
  ready!: boolean;

  selectLabelCodes: string[] = [];
  currentLabels: LabelCodeList[] = [];
  loadingCurrentLabels: boolean = true;

  // 所有供应商列表
  providerList: ProviderInterface[] = [];

  // 用于排序下拉
  gameSortValue: string = '';
  gameSortList: GameSort[] = [];
  loadingGameSort: boolean = true;
  sortIconMap: any = {
    '': 'icon-sort-hot',
    AZ: 'icon-sort-az',
    ZA: 'icon-sort-za',
    Highlights: 'icon-sort-focus',
    RecommendSort: 'icon-big-thumb',
  };

  //最终结果数据
  games: any[] = [];
  initSearchLoading!: boolean; // 更改筛选读取中，游戏增加遮罩
  searchLoading!: boolean; // 更改分页读取中，仅分页按钮有效果

  //分页器
  paginator: PaginatorState = {
    page: 1,
    pageSize: 24, // 每页24个
    total: 0,
  };

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.route.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
      this.ready = false;
      this.providerId = params.get('providerId')!;
      this.getProviderList();
      if (this.providerId !== 'index') this.getGameSort();
    });
  }

  // 正式筛选游戏数据的请求
  getGameByProvider(init: boolean) {
    if (init) {
      this.paginator.page = 1;
      this.paginator.total = 0;
    }
    const param: GameProviderParams = {
      labelCode: this.selectLabelCodes,
      providerCatIds: [this.providerId],
      sort: this.gameSortValue,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      sortType: 'ProviderSort',
    };
    init ? (this.initSearchLoading = true) : (this.searchLoading = true);
    this.miniGameService.getGameByProvider(param).subscribe(data => {
      init ? (this.initSearchLoading = false) : (this.searchLoading = false);
      if (data?.list?.length > 0) {
        this.ready = true;
        this.paginator.total = data.total;
        if (init) {
          this.games = data.list;
        } else {
          this.games.push(...data.list);
        }
      } else {
        this.ready = false;
        this.games = [];
      }
    });
  }

  // 获取所有供应商
  getProviderList() {
    this.miniGameService.getAllProvider().subscribe(data => {
      this.providerList = data;
      if (this.providerId === 'index') {
        this.ready = true;
      } else if (this.providerList.find(x => x.providerCatId === this.providerId)) {
        // 获取游戏
        this.getLabelByProvider();
        this.getGameByProvider(true);
      } else {
        // 跳到404
        this.router.navigateByUrl(`/${this.appService.languageCode}/404`, { replaceUrl: true });
      }
    });
  }

  // 获取排序下拉
  getGameSort() {
    this.loadingGameSort = true;
    this.miniGameService.getGameSort().subscribe(data => {
      this.loadingGameSort = false;
      this.gameSortList = data;
    });
  }

  // 点击游戏
  clickGameItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }

  // 查看所有供应商
  toAllProviders() {
    this.router.navigateByUrl(`${this.appService.languageCode}/casino/provider`);
  }

  // 点击供应商
  clickProviderItem(item: ProviderInterface) {
    if (item.secondaryPage) {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/provider/${item.providerCatId}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/play/${item.providerCatId}`);
    }
  }

  // 获取当前标签/类型的供应商
  getLabelByProvider() {
    this.loadingCurrentLabels = true;
    this.miniGameService.getLabelByProviderid(this.providerId).subscribe(data => {
      this.loadingCurrentLabels = false;
      this.currentLabels = data;
    });
  }

  // 清除选择
  clearChoice() {
    if (this.selectLabelCodes.length < 1) return;
    this.selectLabelCodes = [];
    this.getGameByProvider(true);
  }
}
