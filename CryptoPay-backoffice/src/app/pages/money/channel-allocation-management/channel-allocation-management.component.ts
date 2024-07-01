import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { takeUntil, tap } from 'rxjs/operators';
import { filter, finalize, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { BigNumberPipe, FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StickyDirective } from 'src/app/shared/directive/sticky.directive';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgIf, NgFor, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-channel-allocation-management',
  templateUrl: './channel-allocation-management.component.html',
  styleUrls: ['./channel-allocation-management.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatExpansionModule,
    NgFor,
    StickyDirective,
    AngularSvgIconModule,
    LabelComponent,
    NgbPopover,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    KeyValuePipe,
    BigNumberPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ChannelAllocationManagementComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private appService: AppService,
    private api: ChannelApi,
    private selectApi: SelectApi,
    private subHeader: SubHeaderService
  ) {}

  protected readonly _destroyed = new Subject<void>();
  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();

  isLoading = false; // 是否处于加载
  isLoadingIntegral = false; // 是否加载积分

  list: any[] = []; //获取列表
  tipData: any = {};
  curExpandItem: any = {};

  protected readonly _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    this.loading(true);
    this.subHeader.merchantId$
      .pipe(
        filter((e) => !!e),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.loadData(true);
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  getList() {
    const params = {
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      merchantId: this.subHeader.merchantCurrentId || 0,
    };

    return this.api.getAllocatedList(params).pipe(
      tap((res) => {
        this.list = res?.list || [];
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

  reset() {
    this.loadData(true);
  }

  // 查看
  onView(item: any) {
    this.router.navigate(['/money/channelAllocationManagement/log', item.channelAccountId]);
  }

  /** tip提示展开 */
  loadTip(parent?: any, item?: any) {
    this.isLoadingIntegral = true;
    this.curExpandItem = parent;
    this.api
      .getPointDetail({
        paymentCategory: 'Deposit',
        merchantId: parent.merchantId,
        channelID: parent.channelId,
        channelAccountID: parent.channelAccountId,
        currencyType: parent.currency,
        paymentMethodID: item.paymentMethodId,
      })
      .pipe(finalize(() => (this.isLoadingIntegral = false)))
      .subscribe((res) => {
        this.tipData = res || {};
      });
  }
}
