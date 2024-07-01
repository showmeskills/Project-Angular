import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';

@Component({
  selector: 'app-recently-changes',
  templateUrl: './recently-changes.component.html',
  styleUrls: ['./recently-changes.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    VipNamePipe,
  ],
})
export class RecentlyChangesComponent implements OnInit, OnDestroy {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private vipApi: VipApi,
    private subHeaderService: SubHeaderService,
    private appService: AppService
  ) {}

  isLoading = false; // 是否处于加载

  list: any = [];
  pageSizes: number[] = [10, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  ngOnInit() {
    this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      // 没有商户
      if (!this.subHeaderService.merchantCurrentId) return;
      this.loadData();
    });
  }

  loadData() {
    this.loading(true);
    this.vipApi
      .getLevelRecordList({
        tenantId: this.subHeaderService.merchantCurrentId,
        pageNum: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
