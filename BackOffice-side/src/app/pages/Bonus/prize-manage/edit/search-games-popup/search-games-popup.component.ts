import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';

@Component({
  selector: 'free-spin-search-games-popup',
  templateUrl: './search-games-popup.component.html',
  styleUrls: ['./search-games-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatModalModule,
    FormsModule,
    MatOptionModule,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    AngularSvgIconModule,
    IconSrcDirective,
    PaginatorComponent,
  ],
})
export class FreeSpinSearchGamesPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<FreeSpinSearchGamesPopupComponent, boolean>,
    public appService: AppService,
    public lang: LangService,
    private api: GameApi,
    private gameSelectApi: SelectApi
  ) {}

  /** 商户ID */
  @Input() tenantId;

  /** 页大小 */
  pageSizes: number[] = [10, ...PageSizes];

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 游戏厂商 - 数据 */
  gameProviderList: any[] = [];

  /** 选择的游戏 */
  selectGame = null;

  dataEmpty = {
    providerCatId: '', // 厂商ID
    gameName: '', // 游戏名称
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list = [];

  ngOnInit() {
    this.gameSelectApi.getCategorySelect(this.tenantId, ['Online'], undefined, undefined, true).subscribe((res) => {
      if (Array.isArray(res)) {
        this.gameProviderList = res
          .map((v) => v?.providers)
          .flat(Infinity)
          .filter((e) => e);
      }
    });

    this.paginator.pageSize = 10;
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getGameList({
        tenantId: this.tenantId,
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
        providerCatId: this.data.providerCatId,
        gameName: this.data.gameName,
        isFreeSpin: true,
        status: 'Online',
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 选择游戏
   * @param item
   */
  onSelectGame(item) {
    this.selectGame = cloneDeep(item);
  }

  onSubmit() {
    if (!this.selectGame) {
      return this.appService.showToastSubject.next({ msgLang: 'form.arrayRequired' });
    }
    this.modal.close(this.selectGame);
  }
}
