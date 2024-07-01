import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { GoMoneyMerchant } from 'src/app/shared/interfaces/select.interface';
import { ChannelSelectItem, PaymentMethod, SubChannelItem } from 'src/app/shared/interfaces/channel';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgTemplateOutlet, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-sub-channel-lists',
  templateUrl: './sub-channel-lists.component.html',
  styleUrls: ['./sub-channel-lists.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    SearchDirective,
    SearchInpDirective,
    AngularSvgIconModule,
    NgTemplateOutlet,
    NgIf,
    LabelComponent,
    PaginatorComponent,
    AsyncPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class SubChannelListsComponent implements OnInit, OnDestroy {
  protected readonly _destroy = new Subject<void>();
  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();

  isLoading = false; // 是否处于加载

  list: SubChannelItem[] = []; //获取列表
  statusList = [
    { name: 'common.all', value: '' },
    { name: 'payment.method.open', value: true },
    { name: 'payment.method.shutDown', value: false },
  ]; // 状态下拉列表

  paymentMethods: PaymentMethod[] = []; // 支付方式列表
  mainChannelList: ChannelSelectItem[] = [];
  merchantList: GoMoneyMerchant[] = [];
  EMPTY_DATA = {
    merchantId: 0,
    status: '' as string | boolean,
    mainChannel: '',
    currency: '',
    subChannelSort: '',
    methods: [''], // 支付方式
  };

  data = cloneDeep(this.EMPTY_DATA);

  private _destroyed = new Subject<void>(); // 路由跳转的流

  constructor(
    public router: Router,
    private appService: AppService,
    private api: ChannelApi,
    private selectApi: SelectApi,
    private ls: LocalStorageService,
    public lang: LangService,
    public currencyService: CurrencyService
  ) {
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
        if (this.router.routeReuseStrategy['curr'] === 'subChannel/:id') this.loadData();
      });

    currencyService.updateCurrency();
  }

  ngOnInit(): void {
    this.getInitData();
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  // 获取数据
  getInitData() {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.api.getAllChannels(true),
      this.selectApi.goMoneyGetMerchant(true),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.getList(),
    ]).subscribe(([channel, merchant, paymentMethods]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.mainChannelList = channel;
      this.paymentMethods = paymentMethods;
      this.merchantList = merchant;
    });
  }

  getList() {
    const params = {
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      merchantId: this.data.merchantId || 0,
      paymentProvider: this.data.mainChannel,
      status: typeof this.data.status === 'string' ? undefined : this.data.status,
      sortCategory: this.data.subChannelSort || undefined,
      currency: this.data.currency,
      methods: this.data.methods.join(','),
    };
    return this.api.getChannelAccountInfo(params).pipe(
      map((res) => ({ ...res, list: this.addSelected(res?.list) })),
      tap((res) => {
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      })
    );
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.getList().subscribe(() => this.loading(false));
  }

  // 添加选择属性
  addSelected(arr: Array<any>): any[] {
    if (!arr) return [];

    return arr.map((e) => {
      e.checked = false;
      return e;
    });
  }

  onReset() {
    this.data = { ...this.EMPTY_DATA };
    this.paginator.page = 1;
    this.loadData();
  }

  // 获取商户名字
  get merchantName(): string {
    // html中被注释
    return +this.data.merchantId ? this.merchantList.find((e) => +e.id === +this.data.merchantId)?.name || '' : '全部';
  }

  /**
   * 子渠道排序
   */
  onSubChannelSort() {
    const temp = ['', 'desc', 'asc'];
    const curIndex = temp.findIndex((e) => e === this.data.subChannelSort);
    const next = (curIndex + 1) % temp.length;
    this.data.subChannelSort = (temp[next] || '') as string | 'desc' | 'asc';

    this.loadData();
  }

  /**
   * 支付方式改变
   */
  methodsChange() {
    this.data.methods = this.data.methods.filter((e) => e);
    !this.data.methods.length && this.methodsAll();
  }

  /**
   * 支付方式选择全部
   */
  methodsAll() {
    this.data.methods = cloneDeep(this.EMPTY_DATA.methods);
  }
}
