import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-search-game-popup',
  templateUrl: './search-game-popup.component.html',
  styleUrls: ['./search-game-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    FormsModule,
    NgIf,
    LoadingDirective,
    NgFor,
    EmptyComponent,
    LangPipe,
    ModalFooterComponent,
    HostPipe,
  ],
})
export class SearchGamePopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<SearchGamePopupComponent, boolean>,
    private appService: AppService,
    private api: GameApi
  ) {}

  /** 商户ID */
  @Input() tenantId;
  /** 游戏类别/产品 */
  @Input() gameCategory;
  /** 已选择的游戏数据 */
  @Input() selectedGameList;

  @Output() confirmSuccess = new EventEmitter();

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

  /** 选中的游戏列表数据 */
  list: any[] = [];

  selectedGameLoading = false;

  ngOnInit() {
    this.list = cloneDeep(this.selectedGameList);
  }

  /** 获取 游戏搜索数据 */
  getGameList(resetPage = false) {
    resetPage && (this.page = 1) && (this.gameList = []);
    this.gameLoading = true;
    this.api
      .getgamelistselectbyname({
        tenantId: this.tenantId,
        name: this.gameName,
        category: this.gameCategory,
        page: this.page,
        pageSize: 35,
      })
      .subscribe((res) => {
        this.gameLoading = false;
        this.isListEmptyFlag = !(res?.list || []).length;
        this.gameList.push(...(res?.list || []));
        this.total = res?.total || 0;
      });
  }

  getMoreList(event) {
    event.preventDefault();
    ++this.page;
    this.getGameList();
  }

  gameSearch(event) {
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

  onAddGame(item) {
    if (this.list.some((v) => v.id === item?.id)) {
      this.appService.showToastSubject.next({
        msgLang: 'game.manage.gameSelectAgain',
      });
      return;
    }
    this.list.push({ ...item });
  }

  confirm() {
    this.modal.close(true);
    this.confirmSuccess.emit(this.list);
  }
}
