import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { PermissionApi } from 'src/app/shared/api/permission.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { filter, Subject } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { IsObjectNullPipe } from 'src/app/shared/pipes/common.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    FormatMoneyPipe,
    IsObjectNullPipe,
    LangPipe,
  ],
})
export class PayComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: AssetApi,
    private permissionApi: PermissionApi,
    private appService: AppService,
    private subHeader: SubHeaderService
  ) {
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
        if (this.router.routeReuseStrategy['curr'] === 'pay/:id') this.loadData();
      });
  }

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  list: any[] = []; // 表格列表数据
  showList = false; // 是否显示列表
  isLoading = false; // 是否处于加载
  isCheckedAll = false; // 是否选择全部
  categoryList: any[] = [
    { key: '', value: '' },
    { key: 'Deposit', value: 'payment.method.deposit' },
    { key: 'Withdraw', value: 'payment.method.withdrawal' },
  ];

  statusList: any[] = [
    { key: '', value: 'common.all' },
    { key: 'true', value: 'payment.method.open' },
    { key: 'false', value: 'payment.method.shutDown' },
  ];

  data = {
    name: '',
    category: '',
    status: '',
  };

  private readonly _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.merchantId$
      .pipe(
        filter((e) => !!e),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  // 获取数据
  loadData() {
    this.loading(true);
    this.api
      .getPayMethodsList({
        ...this.data,
        tenantId: this.subHeader.merchantCurrentId,
      })
      .subscribe((res) => {
        this.loading(false);
        let list = res.list.map((item) => {
          if (item.selectLabel) {
            let selectLabel = Object.values(item.selectLabel);
            return { ...item, selectLabel };
          } else {
            return item;
          }
        });
        this.list = list;
        // this.list = res.list;
        this.paginator.total = res.total;
      });
  }

  // 重置
  reset(): void {
    this.data = {
      name: '',
      category: '',
      status: '',
    };
    this.loadData();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onState(item): void {
    this.loading(true);
    this.api
      .updatePaymentMethod({
        ...item,
        state: item.feeEnabled,
      })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (+res) {
          this.appService.showToastSubject.next({
            msgLang: 'payment.method.statusModificationSuc',
            successed: true,
          });
        } else {
          item.feeEnabled = !item.feeEnabled; // 还原修改的状态
          this.appService.showToastSubject.next({
            msg: 'payment.method.statusModificationFailed',
            successed: false,
          });
        }
      });
  }

  category(item) {
    return this.categoryList.find((e) => e.key === item.category)?.value;
  }

  onEdit(item: any) {
    this.router.navigate(['/pay/method/', item.id], {
      queryParams: {
        paymentId: item.paymentId,
        category: item.category,
        merchantId: this.subHeader.merchantCurrentId,
      },
    });
  }
}
