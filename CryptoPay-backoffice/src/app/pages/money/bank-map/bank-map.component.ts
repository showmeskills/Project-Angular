import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { GoMoneyCurrency } from 'src/app/shared/interfaces/common.interface';
import { zip } from 'rxjs';
import { BankApi } from 'src/app/shared/api/bank.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { tap } from 'rxjs/operators';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';
@Component({
  templateUrl: './bank-map.component.html',
  styleUrls: ['./bank-map.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    MatFormFieldModule,
    SearchDirective,
    MatSelectModule,
    FormsModule,
    SearchInpDirective,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    LabelComponent,
    NgIf,
    PaginatorComponent,
    AsyncPipe,
    LangPipe,
  ],
})
export class BankMapComponent implements OnInit {
  constructor(
    private router: Router,
    private modal: MatModal,
    public appService: AppService,
    public api: BankApi,
    public selectApi: SelectApi,
    public channelApi: ChannelApi,
    public lang: LangService
  ) {}

  list: any[] = [];
  data: any = {};
  initData: any = {
    bank: '',
    channel: '',
    isOpen: '',
    currency: '',
    payment: '',
  };

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  currencyList: GoMoneyCurrency[] = [];
  channelList: any[] = [];
  paymentList: PaymentMethod[] = [];
  bankList: any[] = [];

  ngOnInit(): void {
    this.data = { ...this.initData };

    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.goMoneyGetCurrencies(true),
      this.channelApi.getAllChannels(true),
      this.selectApi.goMoneyGetPaymentMethods(true),
      this.selectApi.goMoneyGetBankList(true),
      this.getList$()
    ).subscribe(([currency, channel, payment, bank]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.currencyList = currency;
      this.channelList = channel;
      this.paymentList = payment;
      this.bankList = bank;
    });
  }

  /** methods */
  onReset() {
    this.data = { ...this.initData };
    this.loadData(true);
  }

  getList$() {
    return this.api
      .getBankMapList({
        bankCode: this.data.bank || undefined,
        channelId: this.data.channel || undefined,
        isOpen: this.data.isOpen,
        currency: this.data.currency || undefined,
        paymentMethodId: this.data.payment || undefined,
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

  /** 获取数据 */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.getList$().subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  onEdit() {
    this.router.navigate(['/money/bank-map', 'add']);
  }

  getPaymentName(code: any) {
    return this.paymentList.find((e) => e.code === code)?.name || '-';
  }

  async onDel(tpl, data: any) {
    if ((await this.modal.open(tpl, { width: '500px', data }).result) !== true) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api.delBankMap(data.id).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);
      // 翻译
      // 删除;
      let del = await this.lang.getOne('common.delete');
      // 成功;
      let success = await this.lang.getOne('common.success');
      // 失败;
      let fail = await this.lang.getOne('common.fail');
      // over
      const successed = res === true;
      const msg = del + (successed ? success : fail);

      this.appService.showToastSubject.next({ msg, successed });
      successed && this.loadData();
    });
  }
}
