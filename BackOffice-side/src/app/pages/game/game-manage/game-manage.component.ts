import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, zip } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AddGameLabelComponent } from './game-label/game-label.component';
import { AiSettingsComponent } from './ai-settings/ai-settings.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BatchUploadDirective } from '../game/batch-upload/batch-upload.directive';
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'app-game-manage',
  templateUrl: './game-manage.component.html',
  styleUrls: ['./game-manage.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    NgFor,
    NgClass,
    NgIf,
    NgbPopover,
    AngularSvgIconModule,
    FormWrapComponent,
    FormsModule,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    BatchUploadDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    CurrencyIconDirective,
    ModalTitleComponent,
    CurrencyValuePipe,
    LangPipe,
    InputFloatDirective,
  ],
})
export class GameManageComponent implements OnInit, OnDestroy {
  first: any;
  constructor(
    public subHeaderService: SubHeaderService,
    public router: Router,
    private appService: AppService,
    private api: GameApi,
    private gameSelectApi: SelectApi,
    private lang: LangService,
    private confirmModalService: ConfirmModalService,
    private modalService: MatModal
  ) {}

  _destroy$: any = new Subject<void>(); // 订阅商户的流

  /** 是否处于加载 */
  isLoading = false;

  /** 页码 */
  page: any = 1;

  /** 初始化 - 中英翻译 */
  al: string | undefined = '全部';
  provider: string | undefined = '供应商';

  /** 筛选 - 游戏类别列表 */
  categoryList: any[] = [];

  /** 筛选 - 游戏标签 */
  gameLabelList: any[] = []; // 列表
  labelexpand = true; // 标签是否展开标识符

  /** 筛选 - 游戏状态列表 */
  gameStatusList: any[] = [];

  /** 筛选 - 排序列表 */
  searchSortList: any[] = [
    { name: '全部', value: 0, lang: 'common.all' },
    { name: '热门排序', value: 1, lang: 'game.manage.popular_sort' },
    { name: '首页排序', value: 2, lang: 'game.manage.home_sort' },
  ];

  /** 筛选 - sort By 列表 */
  sortList: any[] = [
    { name: 'All', value: '' },
    { name: 'Popular', value: 'Popular' },
    { name: 'A-Z', value: 'AZ' },
    { name: 'Z-A', value: 'ZA' },
    { name: 'Highlights', value: 'Highlights' },
    { name: 'RecommendSort', value: 'RecommendSort' },
  ];

  /** 筛选 - 入参数据 */
  data: any = {};
  dataEmpty: any = {
    category: '', // 游戏类别
    provider: '', // 游戏厂商
    gameLabel: '', // 游戏标签
    status: '', // 游戏状态
    gameName: '', // 游戏名称
    searchSort: 0, // 排序
    sort: 'AZ', // Sort by
  };

  /** 功能 - 当前批量操作的类型 */
  batchType: any = ''; // sort(排序)/hot(热门)/pause(下架)

  /** 功能 - 排序类型 */
  sortType?: any;
  sortTypeList: any[] = [
    { name: 'Home Sort', value: 'HomeSort' },
    { name: 'Provider Sort', value: 'ProviderSort' },
    { name: 'Label Sort', value: 'LabelSort' },
  ];

  /** 功能 - 排序拖拽 */
  dragActive: any = -1; //  正在操作的索引
  oldDragIndex: any = 0; // 旧的索引
  newDragIndex: any = 0; // 新的索引

  /** 功能 - 获取鼠标移入当前的游戏ID （适用于：查看详情/拖拽排序/输入框排序 的显示）  */
  darkGameId: any = '';

  /** 功能 - 批量 热门/下架 选中的游戏ID */
  pauseIsHotIdList: any[] = [];

  /** 功能 - 标签游戏管理 */
  gameLabelData?: any; // 当前选中的游戏标签数据

  list: any[] = [];
  total: any = 0;
  iconAddress: any = '';
  noListFlag = false;

  /** 控制游戏管理的弹窗是否显示 */
  showTooltips: { [key: string]: boolean } = {};

  /** getters */
  /** 根据游戏类别 - 获取游戏厂商列表 */
  get providerListCom() {
    let list: any[] = [];
    if (this.data.category) {
      list = this.categoryList.find((v) => v.code === this.data.category)['providers'];
    } else {
      list = this.categoryList
        .map((v) => v.providers)
        .flat(Infinity)
        .filter((e) => e);
    }

    return [{ providerCatId: '', providerName: this.al }, ...list];
  }

  /** 是否首页排序 */
  get isHomeSort() {
    return this.batchType === 'sort' && this.sortType === 'HomeSort' ? true : false;
  }

  /** 是否厂商排序 */
  get isProviderSort() {
    return this.batchType === 'sort' && this.sortType === 'ProviderSort' ? true : false;
  }

  /** 是否标签排序 */
  get isLabelSort() {
    return this.batchType === 'sort' && this.sortType === 'LabelSort' ? true : false;
  }

  async ngOnInit() {
    this.al = await this.lang.getOne('common.all'); // 全部
    this.provider = await this.lang.getOne('game.provider.provider'); // 供应商

    // 订阅商户
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      // 请求初始化数据
      zip(
        this.gameSelectApi.getLabelSelect(this.subHeaderService.merchantCurrentId),
        this.gameSelectApi.getCategorySelect(this.subHeaderService.merchantCurrentId, ['Online']),
        this.gameSelectApi.getStatus()
      )
        .pipe(
          tap(([gameLabel, category, status]) => {
            this.gameLabelList = [{ code: '', description: this.al }, ...(gameLabel || [])];
            this.categoryList = [{ code: '', description: this.al }, ...(category || [])];
            this.gameStatusList = [{ code: '', description: this.al }, ...(status || [])];
          })
        )
        .subscribe(() => this.onReset());
    });

    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'manage/:id') this.loadData(false, true);
      });
  }

  loadData(resetPage = false, isKeep = false) {
    resetPage && (this.page = 1) && (this.list = []);
    this.loading(true);
    this.api
      .getGameList({
        TenantId: this.subHeaderService.merchantCurrentId,
        Page: isKeep ? 1 : this.page,
        PageSize: isKeep ? this.list.length : 35,
        Category: this.data.category,
        ProviderCatId: this.data.provider,
        GameLabel: this.data.gameLabel,
        Status: this.data.status,
        RecommendType: this.data.searchSort,
        GameName: this.data.gameName,
        SortLabel: this.data.sort,
        ...(this.sortType ? { sortType: this.sortType } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.noListFlag = !(res?.list || []).length ? true : false;
        if (isKeep) {
          this.list = res?.list || [];
        } else {
          this.list.push(...(res?.list || []));
        }
        this.total = res?.total || 0;
        this.iconAddress = res?.iconAddress || '';
      });
  }

  selectTypeSearch(type: any, code: any, item?: any) {
    if (type === 'category') {
      this.data.category = code;
      this.data.provider = '';
      this.data.gameLabel = '';
    } else if (type === 'provider') {
      this.data.provider = code;
      this.data.gameLabel = '';
    } else if (type === 'gameLabel') {
      this.data.gameLabel = code;
      this.gameLabelData = item;
    } else if (type === 'status') {
      this.data.status = code;
    } else if (type === 'sort') {
      this.data.searchSort = code;
    }

    // 如果是 排序筛选 || 排序中，默认sort为空
    this.data.sort = type === 'sort' || this.sortType ? '' : 'AZ';
    this.loadData(true);
  }

  getGameName(item: any, key: string): string {
    if (key == 'gameName') {
      return item?.gameInfos[0]?.gameName || '';
    }
    return '';
  }

  // 显示弹窗
  showTooltip(key: string): void {
    this.showTooltips[key] = true;
  }

  // 隐藏弹窗
  hideTooltip(key: string): void {
    this.showTooltips[key] = false;
  }

  /** 获取游戏封面 */
  getGameImg(item): string {
    const gameLogo = item?.gameInfos[0]?.webLogo;
    return gameLogo ? this.iconAddress + gameLogo : './assets/images/game-noCover.png';
  }

  /** 获取下一页数据 */
  getMoreList() {
    ++this.page;
    this.loadData();
  }

  /** 打开标签游戏管理弹窗 */
  openGameLabelPopup() {
    const modalRef = this.modalService.open(AddGameLabelComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: false,
    });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.componentInstance['gameLabelData'] = this.gameLabelData;
    modalRef.componentInstance.saveSuccess.subscribe(() => {
      setTimeout(() => {
        this.loadData(true);
      }, 100);
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 打开AI弹窗 */
  openAIPopup() {
    const modalRef = this.modalService.open(AiSettingsComponent, {
      width: '800px',
      disableClose: true,
    });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 下载当前游戏Excel文件 */
  onDownloadGame() {
    const parmas = {
      TenantId: this.subHeaderService.merchantCurrentId,
      Page: 1,
      PageSize: this.list.length,
      Category: this.data.category,
      ProviderCatId: this.data.provider,
      GameLabel: this.data.gameLabel,
      Status: this.data.status,
      RecommendType: this.data.searchSort,
      GameName: this.data.gameName,
      SortLabel: this.data.sort,
    };
    this.loading(true);
    this.api.downloadGame(parmas).subscribe(() => this.loading(false));
  }

  /** 暂停/排序/热门 - 开启 */
  batch(type: any, sortType?: string) {
    // 排序选择
    if (type === 'sort') {
      this.data = { ...this.dataEmpty };
      this.data.sort = '';
      this.sortType = sortType;

      // 首页排序
      if (sortType === 'HomeSort') {
        this.data.searchSort = 2;
      }

      // 厂商排序
      if (sortType === 'ProviderSort') {
        if (this.providerListCom.length === 1 && this.providerListCom[0]?.providerCatId === '') {
          this.appService.showToastSubject.next({
            msgLang: 'game.manage.no_sort',
          });
          return;
        }
        this.data.provider = this.providerListCom[1].providerCatId;
      }

      // 标签排序
      if (sortType === 'LabelSort') {
        if (this.gameLabelList.length === 1 && this.gameLabelList[0]?.code === '') {
          this.appService.showToastSubject.next({
            msgLang: 'game.manage.no_sort',
          });
          return;
        }
        this.data.gameLabel = this.gameLabelList[1].code;
      }

      this.loadData(true);
    }

    this.batchType = type;
  }

  /** 暂停/排序/热门 - 确认 */
  async batchConfirm() {
    const batchTypeList: any = new Map([
      [
        'sort',
        {
          url: 'updateGameSort',
          name: '排序保存',
          nameLang: 'game.manage.sort_save',
          modalLang: 'game.manage.sure_sort',
        },
      ],
      [
        'pause',
        {
          url: 'updateGameOffLine',
          name: '批量下架',
          nameLang: 'game.manage.batch_pase',
          modalLang: 'game.manage.sure_pa',
        },
      ],
      [
        'hot',
        {
          url: 'updateGameIsHot',
          name: '批量热门',
          nameLang: 'game.manage.batch_hot',
          modalLang: 'game.manage.sure_hot',
        },
      ],
    ]);
    if (!batchTypeList.get(this.batchType)) return;

    const nameLang = await this.lang.getOne(batchTypeList.get(this.batchType).nameLang);
    const success = await this.lang.getOne('common.success');
    const fail = await this.lang.getOne('common.fail');

    this.confirmModalService
      .open({
        msgLang: batchTypeList.get(this.batchType).modalLang,
      })
      .result.then(() => {
        this.loading(true);
        this.api[batchTypeList.get(this.batchType).url]({
          tenantId: this.subHeaderService.merchantCurrentId,
          ...(['pause', 'hot'].includes(this.batchType)
            ? { gameIds: this.pauseIsHotIdList }
            : {
                sortType: this.sortType,
                list: this.list.map((v, i) => ({ id: v.id, sort: i + 1 })),
                ...(this.sortType === 'ProviderSort' ? { providerId: this.data.provider } : {}),
                ...(this.sortType === 'LabelSort' ? { gameLabel: this.data.gameLabel } : {}),
              }),
        }).subscribe((res) => {
          this.loading(false);
          this.appService.showToastSubject.next({
            msg: nameLang + (res === true ? success : fail) + '！',
            successed: res === true ? true : false,
          });
          if (res === true) {
            if (['pause', 'hot'].includes(this.batchType)) this.pauseIsHotIdList = [];
            if (this.batchType === 'sort') this.data.sort = 'AZ';
            this.batchType = '';
            this.sortType = '';
            this.loadData(true);
          }
        });
      })
      .catch(() => {});
  }

  async numberSort(item: any) {
    if (item?.sort === '') return;

    const sortSave = await this.lang.getOne('game.manage.sort_save');
    const success = await this.lang.getOne('common.success');
    const fail = await this.lang.getOne('common.fail');

    this.loading(true);
    this.api
      .updateGameSort({
        tenantId: this.subHeaderService.merchantCurrentId,
        sortType: this.sortType,
        list: [{ id: item.id, sort: item.sort }],
        ...(this.sortType === 'ProviderSort' ? { providerId: this.data.provider } : {}),
        ...(this.sortType === 'LabelSort' ? { gameLabel: this.data.gameLabel } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.appService.showToastSubject.next({
          msg: sortSave + (res === true ? success : fail) + '！',
          successed: res === true ? true : false,
        });
        if (res === true) this.loadData(false, true);
      });
  }

  /** 暂停/排序/热门 - 取消 */
  batchancel() {
    if (['pause', 'hot'].includes(this.batchType)) {
      this.pauseIsHotIdList = [];
    } else {
      this.data = { ...this.dataEmpty };
      this.loadData(true);
    }
    this.batchType = '';
    this.sortType = '';
  }

  // 选择 暂停/热门
  selectPauseIsHot(id: any) {
    if (!['pause', 'hot'].includes(this.batchType)) return;
    let isSame = false;
    this.pauseIsHotIdList.forEach((v, i) => {
      if (id === v) {
        this.pauseIsHotIdList.splice(i, 1);
        isSame = true;
      }
    });
    if (!isSame) this.pauseIsHotIdList.push(id);
  }

  dragStarted(i: any) {
    // 保存旧的节点和正在操作的节点
    this.oldDragIndex = i;
    // this.dragActive = i;
  }

  dragMoved(i: any) {
    // 保存要存放的新节点
    this.newDragIndex = i;
  }

  dragEnded() {
    if (this.oldDragIndex !== this.newDragIndex) {
      moveItemInArray(this.list, this.oldDragIndex, this.newDragIndex);
      // this.dragActive = -1;
    }
  }

  onReset() {
    this.batchType = '';
    this.sortType = '';
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  showMaker(item) {
    return `BaseId:${item?.baseId}  ${this.provider}Id:${item?.providerCatId}`;
  }
}
