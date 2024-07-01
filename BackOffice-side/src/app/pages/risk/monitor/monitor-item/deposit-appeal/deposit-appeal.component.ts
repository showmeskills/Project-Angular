import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { WinDirective } from 'src/app/shared/directive/common.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { DepositAppealItem, DepositAppealStatusObjEnum } from 'src/app/shared/interfaces/monitor';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { FormsModule } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { Router } from '@angular/router';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'deposit-appeal',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyIconDirective,
    CurrencyValuePipe,
    IconSrcDirective,
    LabelComponent,
    LangPipe,
    TimeFormatPipe,
    WinDirective,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    FormsModule,
    LoadingDirective,
  ],
  templateUrl: './deposit-appeal.component.html',
  styleUrls: ['../../monitor.component.scss', './deposit-appeal.component.scss'],
  providers: [DestroyService],
})
export class DepositAppealComponent implements OnInit {
  constructor(
    private api: MonitorApi,
    public service: MonitorService,
    private router: Router,
    private destroy$: DestroyService,
    private lang: LangService
  ) {}

  // PS: 导出的话，监听一个导出的流
  // PS: 自己管理内部的分页，如果是“全部”监听接收流数据为{ isAll: true, paginator }流，用当前传递的数据来接管，只展示item
  ngOnInit(): void {
    this.service
      .reload$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(([reset]) => {
        this.loadData(reset);
      });

    // 导出绑定
    this.exportBind();
  }

  protected readonly DepositAppealStatusEnum = DepositAppealStatusObjEnum;
  loading = false;

  /**
   * 页大小
   */
  pageSizes: number[] = PageSizes;

  /**
   * 分页
   */
  paginator: PaginatorState = new PaginatorState(); // 分页

  /**
   * 列表数据
   */
  list: DepositAppealItem[] = [];

  /**
   * 是否全部类型
   */
  get isAllType() {
    return this.service.isAllType;
  }

  /**
   * 存款申诉 - 获取实时监控数据
   */
  loadData(resetPage = false) {
    if (this.loading) return;

    this.loading = true;
    this.loadData$(resetPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendParams?: Partial<MonitorServiceParams>) {
    resetPage && (this.paginator.page = 1);

    const sendData = { ...this.service.getParams(this.paginator), ...sendParams };

    // 存款申诉 - 待审核
    return this.api.getDepositAppeal({ ...sendData });
  }

  /**
   * 存款申诉 - 详情
   */
  onDetail(item: DepositAppealItem) {
    this.router.navigate(['/risk/monitor/detail'], {
      queryParams: { appealId: item.appealId, isDigital: item.isDigital },
    });
  }

  /**
   * 导出绑定
   * @private
   */
  private async exportBind() {
    const type = await this.lang.getOne('common.type');
    const typeValue = await this.lang.getOne('risk.depositApply');
    const amount = await this.lang.getOne('common.amount');
    const currency = await this.lang.getOne('common.currency');
    const createTime = await this.lang.getOne('risk.auto.applyTime');
    const status = await this.lang.getOne('common.status');

    this.service.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(({ isAll, exportExcel }) => {
      this.loadData$(false, isAll ? { page: 1, pageSize: 9e4 } : undefined).subscribe((res) => {
        exportExcel.Deposit(
          res.list.map((e) => ({
            [type]: typeValue,
            UID: e.uid,
            ID: e.appealId,
            [amount]: e.amount,
            [currency]: e.currency,
            [createTime]: timeFormat(e.createTime),
            [status]: this.service.statusLang[e.status]?.langText,
          }))
        );
      });
    });
  }
}
