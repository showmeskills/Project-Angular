import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { MerchantsApi } from 'src/app/shared/api/merchants.api';
import { Subject, Subscription } from 'rxjs';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { AppService } from 'src/app/app.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MerchantItem } from 'src/app/shared/interfaces/merchants-interface';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    AngularSvgIconModule,
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class MerchantsComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  list: MerchantItem[] = []; // 表格列表数据
  item: MerchantItem;
  mid = ''; // 搜索UID关键字
  name = ''; // 搜索UID关键字
  isLoading = false; // 是否处于加载
  modal!: NgbModalRef;
  updateStatusSubscription!: Subscription;
  getListSubscription!: Subscription;

  private _destroyed = new Subject<void>(); // 路由跳转的流

  constructor(
    public modalService: NgbModal,
    private router: Router,
    private api: MerchantsApi,
    private appService: AppService,
    private lang: LangService
  ) {}

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
        if (this.router.routeReuseStrategy['curr'] === 'merchants/edit/:id') this.loadData();
      });
  }

  openEnableModal(temp, item: MerchantItem) {
    setTimeout(() => {
      item.isEnable = !item.isEnable;
      this.item = item;
      this.modal = this.modalService.open(temp, { centered: true });
    });
  }

  closeModal() {
    this.modal.close();
  }

  //修改状态
  updateStatus() {
    this.loading(true);
    this.updateStatusSubscription = this.api
      .updateMerchantsStatus({ id: this.item.id, state: !this.item.isEnable })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (res === true) {
          this.item.isEnable = !this.item.isEnable;
          this.appService.showToastSubject.next({
            msgLang: 'payment.method.statusModificationSuc',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'payment.method.statusModificationFailed',
            successed: false,
          });
        }
        this.modal.close();
      });
  }

  ngOnDestroy(): void {
    this.updateStatusSubscription && this.updateStatusSubscription.unsubscribe();
    this.getListSubscription && this.getListSubscription.unsubscribe();
    this._destroyed.next();
    this._destroyed.complete();
  }

  // 导出
  async onExport() {
    const merchantName = await this.lang.getOne('system.merchants.merchantName');
    const contactEmail = await this.lang.getOne('system.merchants.contactEmail');
    const status = await this.lang.getOne('common.status');
    const enable = await this.lang.getOne('common.enable');
    const disable = await this.lang.getOne('common.disable');

    const curCheckedArr = this.list.map((e) => ({
      MID: e.id,
      [merchantName]: e.merchantName,
      [contactEmail]: e.email,
      [status]: e.isEnable ? enable : disable,
    }));

    JSONToExcelDownload(curCheckedArr, 'merchants-list ' + Date.now());
  }

  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);
    this.loading(true);

    this.getListSubscription = this.api
      .getList({
        id: this.mid || undefined,
        merchantName: this.name || undefined,
        ...this.paginator,
      })
      .subscribe((res) => {
        this.loading(false);
        this.paginator.total = res.total;
        this.list = res.list;
      });
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onEdit(item): void {
    this.router.navigate(['/system/merchants/edit/' + item.id]);
  }

  onSearch(): void {
    this.paginator.page = 1;
    this.loadData();
  }

  // 重置
  reset(): void {
    this.mid = '';
    this.name = '';
    this.paginator.page = 1;
    this.loadData();
  }

  // 分页大小改变
  onPageSizeChange({ value }): void {
    this.paginator.pageSize = value;
    this.loadData();
  }

  // 新增
  add(): void {
    this.router.navigate(['/system/merchants/edit']);
  }
}
