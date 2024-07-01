import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ProviderProductList, SearchProvider } from 'src/app/shared/interfaces/provider';
import { AppService } from 'src/app/app.service';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { NavigationEnd, Router } from '@angular/router';
import { GameApi } from 'src/app/shared/api/game.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ProviderService } from 'src/app/pages/game/game.service';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  SelectChildrenDirective,
  SelectGroupDirective,
  SelectDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    SelectDirective,
    LabelComponent,
    NgIf,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
    AsyncPipe,
  ],
})
export class ProviderComponent implements OnInit, OnDestroy {
  constructor(
    public appService: AppService,
    private api: GameApi,
    private router: Router,
    public subHeaderService: SubHeaderService,
    private lang: LangService,
    public providerService: ProviderService,
    public ls: LocalStorageService
  ) {}

  EMPTY_DATA: SearchProvider = {
    baseID: '', // 厂商id
    abbreviation: '', // 厂商简称
    providerCatId: '', // 供应商ID
    providerName: '', // 供应商简称
  };

  data: SearchProvider = { ...this.EMPTY_DATA };
  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: ProviderProductList[] = []; // 列表数据

  private _destroyed = new Subject<void>();

  ngOnInit(): void {
    this.loadData();

    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroyed)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'provider/:id' && this.subHeaderService.merchantCurrentId)
          this.loadData();
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  reset(): void {
    this.data = { ...this.EMPTY_DATA };
    this.loadData(true);
  }

  async export() {
    const name = await this.lang.getOne('game.provider.manufacturer_brief');
    const amount = await this.lang.getOne('game.provider.amount');
    const status = await this.lang.getOne('common.status');
    const proxyStatus = 'Proxy' + status;

    const curCheckedArr = this.list
      .filter((e) => e['checked'])
      .map((e) => ({
        baseId: e.baseId,
        [name]: e.abbreviation,
        [amount]: e.gameCount,
        [proxyStatus]: e.isProxy,
        [status]: e.status,
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.checkEmptyExportTip',
        successed: false,
      });
    }

    JSONToExcelDownload(curCheckedArr, 'provider-list ' + Date.now());
  }

  add() {
    this.router.navigate(['/game/provider/0']);
  }

  edit(id?: string) {
    this.router.navigate(['/game/provider', id]);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .getProvider({
        ...this.data,
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .pipe(finalize(() => this.loading(false)))
      .subscribe(async (res: PageResponse<ProviderProductList>) => {
        const status = await Promise.all(
          this.providerService.statusList.map((e) => this.providerService.getStateLabel(e.value))
        );
        this.list = res.list || [];
        this.list.forEach((e) => (e.statusLabel = status.find((j) => j.value === e.status)));
        this.paginator.total = res.total;
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 更新代理状态
   * @param item
   */
  onProxyState(item: ProviderProductList) {
    this.loading(true);
    this.api.updateProxyStatus(item.baseId).subscribe((res) => {
      this.loading(false);
      this.appService.toastOpera(res);
      res && this.loadData();
    });
  }
}
