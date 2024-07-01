import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-game-label',
  templateUrl: './game-label.component.html',
  styleUrls: ['./game-label.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    FormsModule,
    NgIf,
    LoadingDirective,
    NgFor,
    EmptyComponent,
    LangPipe,
  ],
})
export class AddGameLabelComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AddGameLabelComponent, boolean>,
    private api: GameApi,
    private appService: AppService
  ) {}

  @Input() tenantId: string;
  @Input() gameLabelData: any;

  @Output() saveSuccess = new EventEmitter();

  gameName = '';
  iconAddress = '';
  noListFlag = false;
  total = 0;
  isLoading = true;
  page: any = 1;
  searchFlag = false;
  serchTimer: any = null;
  list: any[] = [];

  gameLabelLoading = true;
  gameLabelList: any[] = [];

  ngOnInit() {
    this.getGameLabelList();
  }

  getGameLabelList() {
    this.gameLabelLoading = true;
    this.api
      .getGameList({
        TenantId: this.tenantId,
        GameLabel: this.gameLabelData?.code,
        Page: this.page,
        PageSize: 999,
        sortType: 'LabelSort',
      })
      .subscribe((res) => {
        this.gameLabelLoading = false;
        this.gameLabelList = res?.list || [];
        this.iconAddress = res?.iconAddress || '';
      });
  }

  loadData(resetPage = false) {
    resetPage && (this.page = 1) && (this.list = []);
    this.loading(true);
    this.api
      .getGameList({
        TenantId: this.tenantId,
        GameName: this.gameName,
        Page: this.page,
        PageSize: 35,
      })
      .subscribe((res) => {
        this.loading(false);
        this.noListFlag = !(res?.list || []).length ? true : false;
        this.list.push(...(res?.list || []));
        this.total = res?.total || 0;
      });
  }

  getMoreList(event: any) {
    event.preventDefault();
    ++this.page;
    this.loadData();
  }

  gameSearch(event: any) {
    event.preventDefault();
    this.loadData(true);
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

  getGameName(item: any, key: string): string {
    return key == 'gameName' ? item?.gameInfos[0]?.gameName : '-';
  }

  openGameSearch() {
    this.searchFlag = true;
    this.loadData(true);
  }

  closeGameSearch() {
    this.searchFlag = false;
  }

  getGameImg(item): string {
    const gameLogo = item?.gameInfos[0]?.webLogo;
    return gameLogo ? this.iconAddress + gameLogo : './assets/images/game-noCover.png';
  }

  /** 关联的游戏 - 新增 */
  addGameLabel(item: any) {
    if (this.gameLabelList.map((v) => v.id).includes(item.id)) {
      this.appService.showToastSubject.next({
        msgLang: 'game.manage.gameSelectAgain',
      });
      return;
    }
    this.gameLabelList.push(item);
  }

  /** 关联的游戏 - 删除 */
  deleteGameLabel(i: number) {
    this.gameLabelList.splice(i, 1);
  }

  confirm() {
    const parmas = {
      TenantId: this.tenantId,
      LabelId: this.gameLabelData?.code,
      GameList: this.gameLabelList.map((v) => v.id),
    };
    this.loading(true);
    this.api.savegametolabel(parmas).subscribe((res) => {
      this.loading(false);
      console.log(res);
      if (res === true) {
        this.modal.close(true);
        this.saveSuccess.emit();
      }
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'content.foot.saveSuc' : 'content.foot.saveFail',
        successed: res === true ? true : false,
      });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
