import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { BankEditComponent } from 'src/app/pages/money/bank/bank-edit/bank-edit.component';
import { AppService } from 'src/app/app.service';
import { BankApi } from 'src/app/shared/api/bank.api';
import { tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { GoMoneyCurrency } from 'src/app/shared/interfaces/common.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';

@Component({
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    NgIf,
    PaginatorComponent,
    AsyncPipe,
    LangPipe,
  ],
})
export class BankComponent implements OnInit {
  constructor(
    private modal: MatModal,
    public appService: AppService,
    public api: BankApi,
    public selectApi: SelectApi,
    public lang: LangService
  ) {}

  list: any[] = [];
  data: any = {};
  initData: any = {
    bankName: '',
    currency: '',
  };

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  currencyList: GoMoneyCurrency[] = [];

  ngOnInit(): void {
    this.data = { ...this.initData };

    this.appService.isContentLoadingSubject.next(true);
    zip(this.selectApi.goMoneyGetCurrencies(true), this.getList$()).subscribe(([currency]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.currencyList = currency;
    });
  }

  /** methods */
  onReset() {
    this.data = { ...this.initData };
    this.loadData(true);
  }

  /** 获取数据 */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.getList$().subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  getList$() {
    return this.api
      .getBankListConfig({
        ...this.data,
        currency: this.data.currency || undefined,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .pipe(
        tap((res) => {
          this.list = res?.list || [];
          this.paginator.total = res?.total || 0;
        })
      );
  }

  async onEdit(item?: any) {
    const modal = this.modal.open(BankEditComponent);
    modal.componentInstance.setForm(item);
    modal.componentInstance.currencyList = this.currencyList.filter((e) => e.code);

    if (!(await modal.result)) return;
    this.loadData();
  }

  async onDel(tpl, data: any) {
    if ((await this.modal.open(tpl, { width: '500px', data }).result) !== true) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api.delBankListConfig(data.id).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);
      // 成功
      let success = await this.lang.getOne('common.success');
      // 失败
      let fail = await this.lang.getOne('common.fail');
      let del = await this.lang.getOne('common.delete');

      const successed = res === true;
      const msg = del + (successed ? success : fail);

      this.appService.showToastSubject.next({ msg, successed });
      successed && this.loadData();
    });
  }
}
