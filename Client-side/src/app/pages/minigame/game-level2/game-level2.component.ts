import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { GameProviderParams, GameSort, Gamelabel, ProviderInterface } from 'src/app/shared/interfaces/game.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-game-level2',
  templateUrl: './game-level2.component.html',
  styleUrls: ['./game-level2.component.scss'],
})
export class GameLevel2Component implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private layout: LayoutService,
    private miniGameService: MiniGameService,
    private appService: AppService,
    private dataCollectionService: DataCollectionService
  ) {}

  isH5!: boolean;
  labels: Gamelabel[] = [];
  label: string = '';

  ready!: boolean;

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

  // 用于筛选下拉的供应商
  currentProviders: ProviderInterface[] = [];
  loadingCurrentProviders: boolean = true;
  selectProviders: string[] = [];

  //最终结果数据
  games: any[] = [];
  loadingLabels: boolean = true;
  initSearchLoading!: boolean; // 更改筛选读取中，游戏增加遮罩
  searchLoading!: boolean; // 更改分页读取中，仅分页按钮有效果

  //分页器
  paginator: PaginatorState = {
    page: 1,
    pageSize: 24, // 每页24个
    total: 0,
  };

  ngOnInit() {
    this.route.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
      const label = params.get('label')!;

      this.ready = false;
      this.games = [];

      this.label = label;
      this.getGamelabel();
    });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.getGameSort();
  }

  // 获取所有标签，用于验证本页路由是否有效，后续请求才能有效进行
  getGamelabel() {
    this.loadingLabels = true;
    this.miniGameService.getGamelabel().subscribe(data => {
      this.loadingLabels = false;
      this.labels = data;
      if (this.labels.length > 0) {
        if (this.labels.find(x => x.code === this.label)) {
          this.dataCollectionService.addPoint({ eventId: 30005, actionValue1: this.label });
          this.getProviderByLabel();
          this.getGameByProvider(true);
        } else {
          //跳到404
          this.jump404();
        }
      }
    });
  }

  jump404() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/404`, { replaceUrl: true });
  }

  // 正式筛选游戏数据的请求
  getGameByProvider(init: boolean) {
    if (init) {
      this.paginator.page = 1;
      this.paginator.total = 0;
    }
    const param: GameProviderParams = {
      labelCode: [this.label],
      providerCatIds: this.selectProviders,
      sort: this.gameSortValue,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      sortType: 'LabelSort',
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
        this.games = [];
        this.ready = false;
      }
    });
  }

  // 获取当前标签/类型的供应商
  getProviderByLabel() {
    this.loadingCurrentProviders = true;
    this.miniGameService.getProviderByLabel(this.label).subscribe(data => {
      this.loadingCurrentProviders = false;
      this.currentProviders = data;
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
  // 清除选择
  clearChoice() {
    if (this.selectProviders.length < 1) return;
    this.selectProviders = [];
    this.getGameByProvider(true);
  }
}
