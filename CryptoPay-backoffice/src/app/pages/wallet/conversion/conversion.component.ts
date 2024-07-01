import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Clipboard } from '@angular/cdk/clipboard';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import { tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import { ExchangeComponent } from 'src/app/pages/wallet/conversion/exchange/exchange.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { cloneDeep } from 'lodash';
import moment from 'moment/moment';
import { ConversionDetailComponent } from 'src/app/pages/wallet/conversion/conversion-detail/conversion-detail.component';
import { ConversionService } from 'src/app/pages/wallet/conversion/conversion.service';
import { ConversionStatusPipe } from './conversion.service';
import { LangPipe, PreLangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'conversion',
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    LabelComponent,
    NgIf,
    EmptyComponent,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    PreLangPipe,
    ConversionStatusPipe,
  ],
})
export class ConversionComponent implements OnInit {
  constructor(
    private clipboard: Clipboard,
    private appService: AppService,
    public router: Router,
    private api: WalletApi,
    private modal: MatModal,
    public conversionService: ConversionService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  networkList: any[] = [];

  EMPTY_DATA = {
    order: '',
    network: '',
    coin: '',
    address: '',
    status: '',
    time: [moment().add(-6, 'day').toDate(), new Date()],
  };

  filterData = cloneDeep(this.EMPTY_DATA);

  /** getters */
  /** 当前币种 */
  get currencyList() {
    return this.networkList.find((e) => e.network === this.filterData.network)?.children || [];
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.list = [];
    this.paginator.total = 1;

    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.getWalletPrimary(), this.loadData$()).subscribe(([list]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.networkList = list;
    });
  }

  /** methods */
  /** 获取数据 */
  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  loadData$(resetPage = false) {
    resetPage && (this.paginator.page = 1); // 暂时没有分页

    return this.api
      .conversion({
        PageIndex: this.paginator.page,
        PageSize: this.paginator.pageSize,
        TxNum: this.filterData.order,
        Address: this.filterData.address,
        Network: this.filterData.network,
        Coin: this.filterData.coin,
        Status: this.filterData.status,
        BeginCreateTime: toDateStamp(this.filterData.time?.[0], false) || 0,
        EndCreateTime: toDateStamp(this.filterData.time?.[1], true) || 0,
      })
      .pipe(
        tap((res) => {
          this.list = Array.isArray(res?.list) ? res.list : [];
          this.paginator.total = res?.total || 0;
        })
      );
  }

  reset() {
    this.filterData = cloneDeep(this.EMPTY_DATA);
    this.loadData(true);
  }

  onFilter(type: string) {
    if (type === 'network') {
      this.filterData.coin = '';
      this.filterData.address = '';
    } else if (type === 'coin') {
      this.filterData.address = '';
    }

    this.loadData(true);
  }

  async onOpenExchange() {
    const modal = this.modal.open(ExchangeComponent, { width: '1280px', disableClose: true });
    if ((await modal.result) !== true) return;

    this.loadData();
  }

  getStatus(type: string) {
    return this.conversionService.getStatus(type);
  }

  async onDetail(item: any) {
    const modal = this.modal.open(ConversionDetailComponent, { width: '886px' });
    modal.componentInstance.item = item;

    if ((await modal.result) !== true) return;

    this.loadData();
  }
}
