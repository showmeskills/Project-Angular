import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { forkJoin, Observable, Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { weekList } from 'src/app/shared/models/tools.model';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe, NgFor, NgIf, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';
import { cloneDeep } from 'lodash';
import { ChannelSelectItem, FiatChannelItem, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { CodeName } from 'src/app/shared/interfaces/base.interface';

@Component({
  selector: 'app-channel-config',
  templateUrl: './channel-config.component.html',
  styleUrls: ['./channel-config.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    MatFormFieldModule,
    SearchDirective,
    MatSelectModule,
    FormsModule,
    SearchInpDirective,
    NgFor,
    MatOptionModule,
    NgIf,
    LabelComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    AsyncPipe,
    PercentPipe,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class ChannelConfigComponent implements OnInit {
  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();
  isLoading = false; // 是否处于加载

  list: FiatChannelItem[] = [];
  currencyList: CodeName[] = []; // 支持币种列表
  countriesList: CodeName[] = []; // 地区列表
  channelList: ChannelSelectItem[] = []; // 渠道列表
  paymentMethods: PaymentMethod[] = []; // 渠道列表
  defaultData = {
    channelId: '', // 渠道名称
    currency: '', // 支持币种
    countries: '', // 地区
    isOpened: '' as '' | boolean, //状态
    methods: [''], // 支付方式
  };

  data = cloneDeep(this.defaultData);
  public readonly weekList = weekList;

  private _destroyed = new Subject<void>(); // 路由跳转的流

  constructor(
    public router: Router,
    private appService: AppService,
    private api: ChannelApi,
    private selectApi: SelectApi
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
        if (this.router.routeReuseStrategy['curr'] === 'channelConfig/:id') this.loadData();
      });
  }

  ngOnInit(): void {
    forkJoin([
      this.selectApi.goMoneyGetCurrencies(true),
      this.selectApi.goMoneyGetCountries(true),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.api.getAllChannels(true),
      this.init(), // 初始化
    ]).subscribe(([currency, countries, paymentMethods, channel]) => {
      this.currencyList = currency;
      this.countriesList = countries;
      this.paymentMethods = paymentMethods;
      this.channelList = channel;
    });
  }

  getList() {
    const sendData = { ...this.data };
    Object.keys(sendData).forEach((key) => {
      sendData[key] === '' && delete sendData[key];
    });

    return this.api
      .getChannelList({
        ...sendData,
        ...this.paginator,
        methods: sendData.methods.filter((e) => e).join(','),
        isOpened: sendData.isOpened === '' ? undefined : sendData.isOpened,
      })
      .pipe(
        map((res) => ({ ...res, list: res?.list || [] })),
        tap((res) => {
          this.list = res.list;
          this.paginator.total = res.total || 0;
        })
      );
  }

  init(): Observable<any> {
    this.data = { ...this.defaultData };
    this.paginator.page = 1;
    return this.getList();
  }

  onReset() {
    this.data = cloneDeep(this.defaultData);
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取数据
  loadData(resetPage?: boolean) {
    if (resetPage) this.paginator.page = 1;

    this.loading(true);
    this.getList().subscribe(() => this.loading(false));
  }

  // 渠道名称清空
  onChannelName(value?: any) {
    this.data.channelId = value || '';
    this.loadData(true);
  }

  // 是否显示维护时间
  isShowTime(item: any): boolean {
    return (
      item.isEnableMaintenance && // 维护开启
      this.weekList.some((e) => item.weekDays?.includes(e.value) && new Date().getDay() === e.day) && // 是否为设定每周的今天
      (item.maintenanceStartTime || item.maintenanceEndTime)
    );
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
    this.data.methods = cloneDeep(this.defaultData.methods);
  }
}
