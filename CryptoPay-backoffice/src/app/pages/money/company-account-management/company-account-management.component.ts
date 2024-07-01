import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { CompanyBankAccountApi } from 'src/app/shared/api/company-banck-account.api';
import { filter, map, skipUntil, takeUntil, tap } from 'rxjs/operators';
import { distinctUntilChanged, forkJoin, Subject } from 'rxjs';
import { clone, isEqual } from 'lodash';
import { SelectApi } from 'src/app/shared/api/select.api';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { GoMoneyMerchant } from 'src/app/shared/interfaces/select.interface';
import { PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-company-account-management',
  templateUrl: './company-account-management.component.html',
  styleUrls: ['./company-account-management.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    NgbTooltip,
    SelectChildrenDirective,
    NgIf,
    LabelComponent,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class CompanyAccountManagementComponent implements OnInit, OnDestroy {
  protected readonly _destroy = new Subject<void>();

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false; // 是否处于加载
  init$ = new Subject<void>(); // 是否初始化流
  loadData$ = new Subject<void>(); // 加载数据的流

  merchantsList: GoMoneyMerchant[] = []; // 所有商户
  currenciesList: any[] = []; // 所有货币
  paymentMethodList: PaymentMethod[] = []; // 所有汇款方式

  list: any[] = []; //公司管理账户列表
  data: any = {
    merchantName: 0,
    currency: '',
    paymentMethod: '',
  };

  constructor(
    public router: Router,
    private api: CompanyBankAccountApi,
    private selectApi: SelectApi,
    private appService: AppService,
    private modal: NgbModal
  ) {
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
        if (this.router.routeReuseStrategy['curr'] === 'companyAccountManagement/:id') this.loadData();
      });
  }

  ngOnInit(): void {
    this.getInitData();
    // 搜索流订阅
    this.loadData$
      .pipe(
        map(() => clone(this.data)),
        distinctUntilChanged(isEqual), // 保证不被连续检索
        takeUntil(this._destroy),
        skipUntil(this.init$) // 初始化正在请求初始列表数据 通过skipUntil跳过只做distinctUntilChanged缓存操作
      )
      .subscribe(() => this.loadData(true));

    this.loadData$.next(); // 初始化一次 让 distinctUntilChanged 能够缓存进行比对判断
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  // 获取初始数据
  getInitData() {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.selectApi.goMoneyGetCurrencies(true),
      this.selectApi.goMoneyGetMerchant(true),
      this.selectApi.goMoneyGetPaymentMethods(true),
      this.getList(),
    ]).subscribe(([currencies, merchants, paymentMethods]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.currenciesList = currencies;
      this.merchantsList = merchants;
      this.paymentMethodList = paymentMethods;
      this.init$.next();
      this.init$.complete();
    });
  }

  // 获取数据
  getList() {
    const params = {
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      merchantId: this.data.merchantName || 0,
      currency: this.data.currency,
      // payType:this.data.paymentMethod
    };
    return this.api.getCompanyBankAccountList(params).pipe(
      map((res) => ({ ...res, list: this.addSelected(res?.list) })),
      tap((res) => {
        this.list = res.list || [];
        this.paginator.total = res.total || 0;
      })
    );
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

  // 重置
  onReset(): void {
    this.data = {
      merchantName: 0,
      currency: '',
      paymentMethod: '',
    };
    this.paginator.page = 1;
    this.loadData$.next();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  toEditAccount(accountId: string): void {
    const navigationExtras: NavigationExtras = {
      queryParams: { id: accountId },
    };
    this.router.navigate([`/money/companyAccountManagement/${accountId}`], navigationExtras);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDetail(item: any): void {
    // TODO ps:第一阶段先不弄
    // this.api.getCompanyBankAccount(item.id).subscribe((res) => {
    //   const modal = this.modal.open(TransRecordComponent, {
    //     size: 'md', centered: true, windowClass: 'w-590-modal'
    //   });
    //
    //   modal.componentInstance['data'] = item;
    // });
  }

  // 获取商户名字
  getMerchantName(merchantId): string {
    const merchatName = this.merchantsList.find((e) => e.id == merchantId)?.name;
    return merchatName ? merchatName : '';
  }
}
