import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { map, tap } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { PaymentMethodManagementApi } from 'src/app/shared/api/payment-method-management.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { NgFor, NgIf } from '@angular/common';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-payment-method-management',
  templateUrl: './payment-method-management.component.html',
  styleUrls: ['./payment-method-management.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    LabelComponent,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class PaymentMethodManagementComponent implements OnInit {
  protected readonly _destroy = new Subject<void>();
  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();

  isLoading = false; // 是否处于加载

  list: any[] = []; //获取列表
  statusList: any[] = [
    { name: '全部', value: '' },
    { name: '开启', value: true },
    { name: '关闭', value: false },
  ]; // 状态下拉列表

  data: any = {
    paymentMethod: '',
    isEnabled: '',
  };

  private _destroyed = new Subject<void>(); // 路由跳转的流

  constructor(
    public router: Router,
    private appService: AppService,
    private api: PaymentMethodManagementApi,
    public lang: LangService
  ) {
    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    // this.router.events
    //   .pipe(
    //     filter((e) => e instanceof NavigationEnd),
    //     takeUntil(this._destroyed)
    //   )
    //   .subscribe(() => {
    //     if (this.router.routeReuseStrategy['curr'] === 'paymentMethodManagement/:id') this.getInitData();
    //   });
  }

  ngOnInit(): void {
    this.getInitData();
  }

  // 获取数据
  getInitData() {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      // this.selectApi.goMoneyGetPaymentMethods(true),
      this.getList(),
    ]).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
      // this.paymentMethods = paymentMethod;
    });
  }

  getList() {
    const params = {
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      paymentMethod: this.data.paymentMethod,
      isEnabled: this.data.isEnabled,
    };
    return this.api.getPaymentMethodList(params).pipe(
      map((res) => ({ ...res, list: res?.list || [] })),
      tap((res) => {
        this.list = res.list || [];
        this.paginator.total = res.total || 0;
      })
    );
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取数据
  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.getList().subscribe(() => this.loading(false));
  }

  onReset(skipClear = false) {
    !skipClear &&
      (this.data = {
        paymentMethod: '',
        isEnabled: '',
      });
    this.paginator.page = 1;
    this.loadData();
  }

  // 编辑
  onEdit(item): void {
    this.router.navigate(['/system/paymentMethodManagement', item.id]);
  }
}
