import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { map, takeUntil, tap, filter } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { SelectApi } from 'src/app/shared/api/select.api';
import { GameApi } from 'src/app/shared/api/game.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import {
  SelectChildrenDirective,
  SelectGroupDirective,
  SelectDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BatchUploadDirective } from './batch-upload/batch-upload.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    BatchUploadDirective,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    SelectDirective,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    PaginatorComponent,
    LangPipe,
  ],
})
export class GameComponent implements OnInit, OnDestroy {
  protected readonly _destroy = new Subject<void>();

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  list: any[] = []; // 表格列表数据
  categoryList: any[] = []; // 游戏类别列表
  providerList: any[] = []; // 游戏厂商列表
  gameLabelList: any[] = []; // 游戏标签列表
  gameStatusList: any[] = []; // 游戏状态列表
  isLoading = false; // 是否处于加载
  loadData$ = new Subject<void>(); // 加载数据的流
  data: any = {
    gameId: '',
    gameName: '',
    provider: 0,
    gameLabel: '',
    category: 'Lottery',
    status: '',
    sortStatus: '',
    sortShow: '',
    sortProvider: '',
    sortGame: '',
  };

  constructor(
    public router: Router,
    private api: GameApi,
    private gameSelectApi: SelectApi,
    private appService: AppService,
    public subHeader: SubHeaderService,
    private lang: LangService
  ) {}

  ngOnInit(): void {
    this.getInitData();

    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroy)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'list/configuration/:id/:merchantId') this.loadData();
      });
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  // 排序
  onSort(sortKey: string): void {
    const temp = ['', '1', '0'];
    const next = (temp.indexOf(this.data[sortKey]) + 1) % temp.length;

    this.data[sortKey] = temp[next];
    this.loadData(true);
  }

  // 获取初始数据
  async getInitData() {
    const alls = await this.lang.getOne('game.provider.all');
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.gameSelectApi.getCategorySelect(this.subHeader.merchantCurrentId),
      this.gameSelectApi.getStatus(),
    ]).subscribe(([provider, gameLabel]) => {
      this.providerList = [{ id: 0, name: alls }, ...provider];
      this.gameLabelList = [{ code: '', description: alls }, ...gameLabel];

      this.subHeader.merchantId$.pipe(takeUntil(this._destroy)).subscribe(() => {
        forkJoin([
          this.gameSelectApi.getProviderSelect(this.subHeader.merchantCurrentId),
          this.gameSelectApi.getLabelSelect(this.subHeader.merchantCurrentId),
        ]).subscribe(([provider, gameLabel]) => {
          this.appService.isContentLoadingSubject.next(false);
          this.providerList = [{ id: 0, name: alls }, ...provider];
          this.gameLabelList = [{ code: '', description: alls }, ...gameLabel];
          this.onReset();
        });
      });
    });
  }

  getList() {
    return this.api
      .getGameList({
        TenantId: this.subHeader.merchantCurrentId,
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
        GameId: this.data.gameId,
        GameName: this.data.gameName,
        ProviderId: this.data.provider,
        Category: this.data.category || 'Lottery',
        GameLabel: this.data.gameLabel,
        Status: this.data.status,
        StatusOrder: this.data.sortStatus,
        GameOrder: this.data.sortGame,
        ProviderOrder: this.data.sortProvider,
        Sort: this.data.sortShow,
      })
      .pipe(
        map((res) => ({ ...res, list: res?.list || [] })),
        tap((res) => {
          this.list = res.list;
          this.paginator.total = res.total || 0;
        })
      );
  }

  // 获取数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.getList().subscribe(() => this.loading(false));
  }

  // 重置
  onReset(): void {
    this.data = {
      gameId: '',
      gameName: '',
      provider: 0,
      gameLabel: '',
      category: '',
      status: '',
      sortStatus: '',
      sortShow: '',
      sortProvider: '',
      sortGame: '',
    };
    this.loadData(true);
  }

  // 导出
  async onExport() {
    const game_id = await this.lang.getOne('game.provider.game_id');
    const game_name = await this.lang.getOne('game.provider.game_name');
    const type = await this.lang.getOne('game.provider.type');
    const game_manu = await this.lang.getOne('game.provider.game_manu');
    const order = await this.lang.getOne('game.provider.order');
    const index_recom = await this.lang.getOne('game.provider.index_recom');
    const status = await this.lang.getOne('game.provider.statu');
    const open = await this.lang.getOne('game.open');
    const off = await this.lang.getOne('game.off');
    const curCheckedArr = this.list
      .filter((e) => e.checked)
      .map((e) => ({
        [game_id]: e.gameId,
        [game_name]: e.gameInfos.find((e) => e.lanageCode === 'zh-cn')?.gameName,
        [type]: this.getCategoryName(e),
        [game_manu]: this.getProviderName(e),
        [order]: e.sort,
        [index_recom]: e.isRecomment ? open : off,
        [status]: this.gameStatusList.find((j) => j.code === e.status)?.description,
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.checkEmptyExportTip',
        successed: false,
      });
    }

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(curCheckedArr, 'game-list ' + Date.now());
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onState(item): void {
    this.loading(true);
    const sendData = { ...item };
    delete sendData.checked;
    this.api
      .updateGame({
        ...sendData,
        state: item.isRecomment,
      })
      .subscribe((res) => {
        this.loading(false);
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'game.change_suc',
            successed: true,
          });
          this.getList();
        } else {
          item.state = !item.state; // 还原修改的状态
          this.appService.showToastSubject.next({
            msgLang: 'change_fail',
            successed: false,
          });
        }
      });
  }

  getGameName(item): string {
    return [...item.gameInfos].find((e) => e.lanageCode === 'zh-cn')?.gameName || '';
  }

  getProviderName(item): string {
    return this.providerList.find((e) => +e.id === +item.providerId)?.name || '';
  }

  getCategoryName(item): string {
    return this.categoryList.find((e) => e.code === item.category)?.description || '';
  }

  onUploadGame() {}

  onUploadImg() {}
}
