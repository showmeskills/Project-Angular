import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-welfare',
  templateUrl: './welfare.component.html',
  styleUrls: ['./welfare.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class WelfareComponent implements OnInit, OnDestroy {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private vipApi: VipApi,
    private subHeaderService: SubHeaderService,
    private appService: AppService
  ) {}

  // pageSizes: number[] = [6]; // 页大小
  pageSizes: number[] = PageSizes; // 页大小
  paginator: any = new PaginatorState(); // 分页
  list: any[] = [0, 0, 0, 0, 0]; // 表格列表数据
  isLoading = false; // 是否处于加载
  status: any = 'All'; // 列表状态

  ngOnInit() {
    // this.paginator.pageSize = 6;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      // 没有商户
      if (!this.subHeaderService.merchantCurrentId) return;
      this.loadData();
    });
  }

  loadData() {
    this.loading(true);
    const param = {
      TenantId: this.subHeaderService.merchantCurrentId,
      ReceiveType: this.status,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.vipApi
      .getVipReceiveDetail(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  selectStatus(type: any) {
    this.status = type;
    this.paginator.page = 1;
    this.loadData();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
