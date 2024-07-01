import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NewContestListItem } from 'src/app/shared/interfaces/activity';

@Component({
  selector: 'app-tournament-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    CurrencyValuePipe,
    CurrencyIconDirective,
    LabelComponent,
  ],
})
export class TournamentQueryComponent implements OnInit {
  constructor(
    public router: Router,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private api: ActivityAPI
  ) {
    const { tenantId } = activatedRoute.snapshot.queryParams;

    this.tenantId = +tenantId;
  }

  /** 商户ID */
  tenantId;

  /** 是否加载中 */
  isLoading = false;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  sortData = {
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  /** 列表数据 */
  list: NewContestListItem[] = [];

  ngOnInit() {
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      configStates: [2, 3, 11], // 已过期，手动结束，进行中
      ...(this.sortData.order
        ? {
            orderBy: this.sortData.order,
            sort: this.sortData.isAsc ? 'asc' : 'desc',
          }
        : {}),
    };
    this.appService.isContentLoadingSubject.next(true);
    this.api.getnewranklist(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res.code === '0000') {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      }
    });
  }

  /** 列表操作 - 表头字段排序 */
  onLabelThSort(sortKey) {
    if (!this.list.length) return;

    if (this.sortData.isAsc === false && this.sortData.order === sortKey) {
      this.sortData.order = '';
      this.sortData.isAsc = true;
      this.loadData(true);
      return;
    }

    if (!this.sortData.order || this.sortData.order !== sortKey) {
      this.sortData.order = sortKey;
      this.sortData.isAsc = false;
    }

    this.sortData.isAsc = !this.sortData.isAsc;
    this.loadData(true);
  }
}
