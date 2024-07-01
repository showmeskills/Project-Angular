import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SelectLabelComponent } from 'src/app/pages/game/game-manage/select-label/select-label.component';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { GameApi } from 'src/app/shared/api/game.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModal, MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { PrizeStickyLimitEnumType, PrizeType } from 'src/app/shared/interfaces/activity';
import { CouponTypeEnum } from 'src/app/shared/interfaces/coupon';
import { GameCategory } from 'src/app/shared/interfaces/game';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';

@Component({
  selector: 'app-excluded-games',
  templateUrl: './excluded-games.component.html',
  styleUrls: ['./excluded-games.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatModalModule,
    FormsModule,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    ModalTitleComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    HostPipe,
    NgbTooltip,
  ],
})
export class ExcludedGamesComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ExcludedGamesComponent, boolean>,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    public lang: LangService,
    private api: GameApi,
    private modalService: MatModal,
    private gameSelectApi: SelectApi,
    private gameLabelApi: GameLabelApi
  ) {
    const { tenantId, id } = this.activatedRoute.snapshot.queryParams;

    this.id = id;
    this.tenantId = tenantId;
  }

  /** 商户ID */
  @Input() tenantId;

  /** 奖品配置 */
  @Input() configuration;

  /** 排除游戏 - 标签/厂商/搜索游戏：id集合数据 */
  @Input() gameIdsData;
  /** 排除游戏 - 标签：已生效游戏id数据 */
  @Input() gameLabelUsedIdsList: string[] = [];

  /**是否只读 */
  @Input() readOnly = false;

  @Input() gameCategory: GameCategory;

  @Output() confirmSuccess = new EventEmitter();

  /** 奖品模板ID */
  id;

  /** 是否加载中 */
  isLoading = false;

  /** 游戏搜索 - 总量 */
  total = 0;
  /** 游戏搜索 - 页码 */
  page = 1;
  /** 游戏搜索 - 是否加载中 */
  gameLoading = false;
  /** 游戏搜索 - 数据是否为空 */
  isListEmptyFlag = false;
  /** 游戏搜索 - 搜索下拉框是否开启和关闭 */
  isSearchFlag = false;
  /** 游戏搜索 - 搜索防抖定时 */
  serchTimer;
  /** 游戏搜索 - 游戏名关键词 */
  gameName = '';
  /** 游戏搜索 - 游戏数据 */
  gameList: any[] = [];

  /** 游戏标签 - 数据 */
  gameLabelList: any[] = [];
  /** 游戏厂商 - 数据 */
  gameProviderList: any[] = [];
  /** 游戏厂商 - 不可以被排除的数据 */
  gameExcludeProviderList: any[] = [];

  /** 游戏标签 - 选中数据 */
  selectedLabelList: any[] = [];
  /** 游戏厂商 - 选中数据 */
  selectedProviderList: any[] = [];

  /** 游戏搜索 - 选中的游戏列表数据 */
  selectedSerchGameList: any[] = [];
  /** 游戏标签 - 选中的游戏列表数据 */
  selectedLabelGameList: any[] = [];
  /** 游戏厂商 - 选中的游戏列表数据 */
  selectedProviderGameList: any[] = [];

  /** 获取标题 */
  get titleLang() {
    if (this.isNonStickyBonus) {
      switch (this.gameCategory) {
        case PrizeStickyLimitEnumType.LiveCasino:
          return 'member.activity.prizeCommon.liveCasinoBetting';
        case PrizeStickyLimitEnumType.SlotGame:
          return 'member.activity.prizeCommon.casinoBetting';
        case PrizeStickyLimitEnumType.SportsBook:
          return 'member.activity.prizeCommon.sportsBookBetting';
        default:
          return 'common.unknown';
      }
    }

    return 'common.unknown';
  }

  /** 奖品类型：1.非粘性奖金 2.Free Spin(非粘性) 3.粘性奖金
   *  优惠券类型：1.非粘性奖金 2.Free Spin(非粘性)
   */
  get isNonStickyBonus() {
    return [
      PrizeType.NonStickyBonus,
      PrizeType.FreeSpin,
      PrizeType.StickyBonus,
      CouponTypeEnum.NonStickyBonus,
      CouponTypeEnum.FreeSpin,
    ].includes(this.configuration);
  }

  ngOnInit() {
    this.isLoading = true;
    zip(
      this.gameLabelApi.getList(this.tenantId),
      this.gameSelectApi.getCategorySelect(
        this.tenantId,
        ['Online'],
        this.isNonStickyBonus ? this.gameCategory : undefined
      ),
      this.gameSelectApi.getCategorySelect(this.tenantId, ['Online'], undefined, false)
    ).subscribe(([gameLabelList, gameProviderList, gameExcludeProviderList]) => {
      this.isLoading = false;
      // 游戏标签数据
      this.gameLabelList = gameLabelList || [];
      // 游戏厂商数据
      if (Array.isArray(gameProviderList)) {
        this.gameProviderList = gameProviderList
          .map((v) => v?.providers)
          .flat(Infinity)
          .filter((e) => e);
      }
      // 不可以被排除的游戏游戏厂商数据
      this.gameExcludeProviderList = gameExcludeProviderList;

      this.loadData();
    });
  }

  /** 初始化 */
  loadData() {
    // 获取 排除标签列表
    this.selectedLabelList = this.gameLabelList.filter((v) => [...(this.gameIdsData?.labelIds || [])].includes(v.id));

    // 获取 排除厂商列表
    this.selectedProviderList = this.gameProviderList.filter((v) =>
      [...(this.gameIdsData?.providerIds || [])].includes(v.id)
    );

    // 获取 排除的游戏列表
    if (this.gameIdsData?.gameIds?.length) this.getgamelistbygameids(this.gameIdsData?.gameIds);

    // 获取 排除厂商的游戏列表
    if (this.gameIdsData?.providerIds?.length) this.getgamelistbyproviderids(this.gameIdsData?.providerIds);

    // 获取 排除标签的游戏列表
    if (this.gameIdsData?.labelIds.length) this.getgamelistbylabelids(this.gameIdsData?.labelIds);
  }

  /** 获取 游戏搜索数据 */
  getGameList(resetPage = false) {
    resetPage && (this.page = 1) && (this.gameList = []);
    this.gameLoading = true;
    this.api
      .getgamelistselectbyname({
        tenantId: this.tenantId,
        name: this.gameName,
        excludable: true,
        page: this.page,
        pageSize: 35,
        ...(this.isNonStickyBonus ? { category: this.gameCategory } : {}),
      })
      .subscribe((res) => {
        this.gameLoading = false;
        this.isListEmptyFlag = !(res?.list || []).length;
        this.gameList.push(...(res?.list || []));
        this.total = res?.total || 0;
      });
  }

  getMoreList(event: any) {
    event.preventDefault();
    ++this.page;
    this.getGameList();
  }

  gameSearch(event: any) {
    event.preventDefault();
    this.getGameList(true);
  }

  serachChange() {
    this.clearTimer();

    if (!this.gameName || this.gameName === '') return;

    this.serchTimer = setTimeout(() => {
      this.openGameSearch();
    }, 500);
  }

  clearTimer() {
    if (this.serchTimer) clearTimeout(this.serchTimer);
  }

  openGameSearch() {
    this.isSearchFlag = true;
    this.getGameList(true);
  }

  closeGameSearch() {
    this.isSearchFlag = false;
  }

  getGameImg(item): string {
    return item?.webLogo || './assets/images/game-noCover.png';
  }

  addSerchExcludedGame(item) {
    if (this.selectedSerchGameList.map((v) => v.id).includes(item.id)) {
      this.appService.showToastSubject.next({
        msgLang: 'game.manage.gameSelectAgain',
      });
      return;
    }
    this.selectedSerchGameList.push(item);
  }

  /** 筛选 - 删除标签 */
  deteleLabel(item, i) {
    this.selectedLabelList.splice(i, 1);
    this.selectedLabelGameList.forEach((v, j) => {
      if (v.id === item.id) this.selectedLabelGameList.splice(j, 1);
    });
  }

  /** 筛选 - 删除厂商 */
  deteleProvider(item, i) {
    this.selectedProviderList.splice(i, 1);
    this.selectedProviderGameList.forEach((v, j) => {
      if (v.id === item.id) this.selectedProviderGameList.splice(j, 1);
    });
  }

  /**
   * 游戏标签/厂商 - 选择弹窗
   * @selectedType gameLabel=标签，gameProvider=厂商
   * @selectedTypeList 被选中类型的数据
   * @list 渲染的数据
   */
  openSelectPopup(selectedType, selectedTypeList, list) {
    const modalRef = this.modalService.open(SelectLabelComponent, {
      width: '800px',
      disableClose: true,
    });

    modalRef.componentInstance['tenantId'] = this.tenantId;
    modalRef.componentInstance['selectType'] = selectedType;
    modalRef.componentInstance['selectList'] = this[selectedTypeList];
    modalRef.componentInstance['labelProviderList'] = this[list];
    modalRef.componentInstance.selectConfirm.subscribe((selectList) => {
      // 标签选择
      if (selectedType === 'gameLabel') {
        this.selectedLabelList = selectList;
        if (!this.selectedLabelList.length) {
          this.selectedLabelGameList = [];
        } else {
          this.getgamelistbylabelids();
        }
      }

      // 厂商选择
      if (selectedType === 'gameProvider') {
        this.selectedProviderList = selectList;
        if (!this.selectedProviderList.length) {
          this.selectedProviderGameList = [];
        } else {
          this.getgamelistbyproviderids();
        }
      }
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 通过游戏名字获取游戏列表 */
  getgamelistbygameids(idsList: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      ids: idsList,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.api.getgamelistbygameids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.selectedSerchGameList = res || [];
    });
  }

  /** 通过游戏标签获取游戏列表 */
  getgamelistbylabelids(idsList?: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      isExcluded: true,
      ...(this.isNonStickyBonus ? { category: this.gameCategory } : {}),
      ids: this.selectedLabelList.length ? this.selectedLabelList.map((v) => v.id) : idsList,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.getgamelistbylabelids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.selectedLabelGameList = Array.isArray(res) ? res : [];

      /** 对标签游戏进行差异化处理（非实时） */
      if (!this.isNonStickyBonus && (this.selectedLabelGameList.length || this.gameLabelUsedIdsList.length)) {
        // 已生效的标签游戏Id数据
        let usedLabelGameList = this.gameLabelUsedIdsList.map((v) => {
          let list: string[] = v.split('_');
          return {
            providerCatId: list.splice(0, 2).join('-'),
            gameCode: list.join('_'),
          };
        });

        // 对已生效的标签游戏进行属性标记
        this.selectedLabelGameList.forEach((a) => {
          a?.gameList.forEach((b) => {
            usedLabelGameList.forEach((c) => {
              if (b?.gameCode === c?.gameCode && b?.providerCatId === c?.providerCatId) b.isUsed = true;
            });
          });
        });
      }
    });
  }

  /** 通过游戏厂商获取游戏列表 */
  getgamelistbyproviderids(idsList?: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      ...(this.isNonStickyBonus ? { category: this.gameCategory } : {}),
      ids: this.selectedProviderList.length ? this.selectedProviderList.map((v) => v.id) : idsList,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.api.getgamelistbyproviderids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.selectedProviderGameList = res || [];
    });
  }

  confirm() {
    const data = {
      gameIds: this.selectedSerchGameList.map((v) => v.id),
      labelIds: this.selectedLabelList.map((v) => v.id),
      providerIds: this.selectedProviderList.map((v) => v.id),
    };
    this.confirmSuccess.emit(data);
    this.modal.close();
  }
}
