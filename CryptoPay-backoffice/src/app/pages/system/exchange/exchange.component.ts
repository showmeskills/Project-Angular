import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { ExchangeApi } from 'src/app/shared/api/exchange.api';
import { cloneDeep, isEqual } from 'lodash';
import { EditComponent } from './edit/edit.component';
import { ExchangeItem } from 'src/app/shared/interfaces/exchange';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SelectApi } from 'src/app/shared/api/select.api';
import { catchError } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { BigNumberPipe, FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';

@Component({
  selector: 'system-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    AngularSvgIconModule,
    SelectGroupComponent,
    SelectDirective,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    NgIf,
    PaginatorComponent,
    BigNumberPipe,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class ExchangeComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: ExchangeApi,
    private selectApi: SelectApi,
    public modal: MatModal
  ) {}

  filterCurrency = ''; // 币种
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: ExchangeItem[] = []; // 列表数据
  isLoading = false; // 是否加载中
  showSelect = false; // 币种选择浮层
  // currenciesSelect: any = []; // 币种选中
  currenciesList: any = []; // 币种列表

  EMPTY_DATA = {
    isDigital: '' as boolean | string,
    currenciesSelect: [] as any[],
  };

  data = cloneDeep(this.EMPTY_DATA);

  /** getter */
  get isAllCurrencies() {
    return this.currenciesList.every((e) => this.data.currenciesSelect.includes(e.code));
  }

  get currenciesName() {
    return this.data.currenciesSelect.join(', ');
  }

  /** lifeCycle */

  ngOnInit(): void {
    this.initData();
  }

  reset(): void {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.data.currenciesSelect = this.currenciesList.map((e) => e.code);

    this.loadData(true);
  }

  initData() {
    this.loading(true);
    this.selectApi.getCurrenciesList().subscribe((res) => {
      this.loading(false);
      this.currenciesList = res;

      this.reset();
    });
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    return new Promise((resolve, reject) => {
      this.loading(true);
      this.api
        .getExchangeList({
          ...(this.filterCurrency ? { filter: this.filterCurrency } : undefined),
          isDigital: typeof this.data.isDigital === 'string' ? undefined : this.data.isDigital,
          pageIndex: this.paginator.page,
          pageSize: this.paginator.pageSize,
        })
        .subscribe((res) => {
          this.loading(false);

          this.list = res?.list || [];
          this.paginator.total = res?.total || 0;

          res === null && reject();
          resolve(res);
        });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  async onEdit(item: ExchangeItem) {
    const ref = this.modal.open(EditComponent, {
      data: item,
      disableClose: true,
      width: '540px',
    });

    ref.componentInstance.setData(item);
    (await ref.result) && this.loadData(true);
  }

  onCurrency(sel): void {
    const newVal = sel.map((e) => e.code);
    const oldVal = this.data.currenciesSelect;
    if (isEqual(newVal, oldVal)) return;

    this.paginator.page = 1;
    this.data.currenciesSelect = newVal;
    if (this.isAllCurrencies) {
      this.filterCurrency = '';
    } else {
      this.filterCurrency = this.data.currenciesSelect.join(',');
    }

    this.loadData(true);
  }

  /**
   * 更新状态
   * @param item
   */
  updateStatus(item: ExchangeItem) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateStatus({
        currency: item.currency,
        isEnable: item.isEnable,
      })
      .pipe(
        catchError((err) => {
          item.isEnable = !item.isEnable;
          throw err;
        })
      )
      .subscribe(async (res) => {
        const isSuccess = res === true;
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(isSuccess);

        if (!isSuccess) {
          item.isEnable = !item.isEnable;
          return;
        } else {
          this.loadData();
        }
      });
  }
}
