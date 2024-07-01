import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, Input, OnChanges, OnInit, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { delay, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import { GameSearch, NewGameList } from 'src/app/shared/interfaces/game.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: '[app-search-game]',
  templateUrl: './search-game.component.html',
  styleUrls: ['./search-game.component.scss'],
})
export class SearchGameComponent implements OnInit, OnChanges {
  constructor(
    @Optional() private dialogRef: MatDialogRef<SearchGameComponent>,
    public appService: AppService,
    private gameApi: GameApi,
    private layout: LayoutService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private miniGameService: MiniGameService,
    private activatedRoute: ActivatedRoute,
  ) {}
  domain = window.location.origin;

  isH5!: boolean;
  @ViewChild('trigger') trigger!: ElementRef;

  triggerRect: any;
  isOpen: boolean = false;
  positions: ConnectedPosition[] = [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }];

  /**为你推荐需要的codes */
  @Input() labelCodes: string[] = [];
  labelCodesChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /** 大厅传过来code 搜索 */
  gameList?: NewGameList;

  loadingGameList: boolean = true;

  // 搜索相关
  search$: Subject<string> = new Subject();
  state$: Subject<boolean> = new Subject();
  searchValue: string = '';
  oldSearchValue!: string;
  searchResult?: GameSearch;
  loading!: boolean;
  searchHistory: string[] = [];

  /**搜索最低长度限制 */
  get limit() {
    return 1; //this.appService.languageCode === 'zh-cn' ? 1 : 1;
  }

  @ViewChild(CdkConnectedOverlay, { static: false }) cdkConnectedOverlay?: CdkConnectedOverlay;
  searchDom: HTMLElement | null = null;

  ngOnInit() {
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(() => {
      if (this.searchDom) {
        if (this.isH5) {
          this.dialogRef?.close();
        } else {
          this.isOpen = false;
          this.state$.next(false);
          this.cdkConnectedOverlay?.overlayRef.detach();
        }
      }
    });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
      if (!e) this.close();
    });

    // 订阅页面缩放，用于跟随触发元素宽度自动设置弹出内容的宽度
    this.layout.resize$.pipe(untilDestroyed(this)).subscribe(() => {
      if (this.isOpen) this.triggerRect = this.trigger?.nativeElement?.getBoundingClientRect();
    });

    // 搜索流，可以更科学的控制请求的发出，连续的请求会自动取消之前未完成的请求
    this.search$
      .pipe(
        distinctUntilChanged(),
        switchMap(v => this.gameApi.getGameByName(v).pipe(delay(200))),
      )
      .subscribe(res => this.afterSearch(res));

    this.updateSearchHistory();

    combineLatest([
      this.activatedRoute.paramMap,
      this.labelCodesChange$.pipe(switchMap(() => of(this.labelCodes))),
      this.state$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([param, labelCodes, state]) => {
        if (state) {
          const label = param.get('label');
          const sub = param.get('sub');
          const providerId = param.get('providerId');
          if (label) {
            this.getGameListByMultipleLabel([label]);
          } else if (providerId) {
            this.getGameListByMultipleLabel([], false, providerId == 'index' ? undefined : providerId);
          } else if (sub && sub !== 'index') {
            this.getGameListByMultipleLabel([sub], true);
          } else if (labelCodes.length > 0) {
            this.getGameListByMultipleLabel(labelCodes, true);
          } else if (this.isH5) {
            // h5且没有任何偏向，默认请求全部
            this.getGameListByMultipleLabel([]);
          }
        }
      });

    if (this.dialogRef) {
      this.state$.next(true);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.labelCodes && changes.labelCodes.currentValue.length > 0) {
      this.labelCodesChange$.next(true);
    }
  }

  // 切换显示
  toggle() {
    // 打开时，取得触发元素的宽度信息
    if (!this.isOpen) this.triggerRect = this.trigger?.nativeElement?.getBoundingClientRect();
    this.isOpen = !this.isOpen;
    this.state$.next(this.isOpen);
  }
  // 准备搜索
  onSearch() {
    if (this.searchValue.length < this.limit) return;
    if (this.searchValue === this.oldSearchValue) return; //和上一次相同直接显示之前的结果
    this.oldSearchValue = this.searchValue.trim();
    this.searchResult = undefined; //置空准备显示下一个结果
    this.loading = true;
    this.search$.next(this.searchValue.trim());
  }
  // 更新本地历史记录
  updateSearchHistory(val?: string, delIndex?: number) {
    if (val)
      this.localStorageService.setValueByJsonStringify('gameSearchHistory', [val, ...this.searchHistory.slice(0, 4)]);
    if (delIndex !== undefined) {
      this.searchHistory.splice(delIndex, 1);
      this.localStorageService.setValueByJsonStringify('gameSearchHistory', this.searchHistory);
    }
    this.searchHistory = this.localStorageService.getValueByJsonParse('gameSearchHistory', []);
  }
  // 点击游戏
  clickGameItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
    this.close();
  }

  clickLabel(item: any) {
    // TODO: 临时处理，后期需要优化
    this.close();
  }

  /**
   * 通过label 值获取 游戏
   *
   * @param label code
   * @param isHill 是否是 大厅
   * @param providerCatId
   */
  getGameListByMultipleLabel(label: string[], isHill: boolean = false, providerCatId?: string) {
    this.loadingGameList = true;
    this.miniGameService
      .getGameListByMultipleLabel(label, false, 25, isHill, undefined, providerCatId)
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.loadingGameList = false;
        this.gameList = data;
      });
  }

  // 拉取搜索接口之后
  afterSearch(res: ResponseData<GameSearch>) {
    this.loading = false;
    console.log('afterSearch', this.loading);
    if (res?.success && res?.data) {
      if (!this.searchHistory.includes(this.searchValue.trim())) this.updateSearchHistory(this.searchValue.trim()); //记录里没有此关键词记录，保存到本地历史记录
      this.searchResult = res.data;
    }
  }
  /**h5时候是弹窗 关闭弹窗 */
  close() {
    this.dialogRef?.close();
  }
}
