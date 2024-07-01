import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import moment from 'moment';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { finalize, forkJoin } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { takeUntil } from 'rxjs/operators';
import { Provider } from 'src/app/shared/interfaces/select.interface';
import { cloneDeep } from 'lodash';
import { WinnerTopByProviderItem, WinnerTopSortEnum, WinnerTopByUserStat } from 'src/app/shared/interfaces/risk';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';

@Component({
  selector: 'top-winner-provider',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyIconDirective,
    EmptyComponent,
    FormRowComponent,
    InputTrimDirective,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    PaginatorComponent,
    ReactiveFormsModule,
    TableSortComponent,
    TimeFormatPipe,
    OwlDateTimeTriggerDirective,
    FormsModule,
    CurrencyValuePipe,
    WinDirective,
    WinColorDirective,
    SearchDirective,
    SearchInpDirective,
    FormatNumberDecimalPipe,
  ],
  providers: [DestroyService],
  templateUrl: './top-winner-provider.component.html',
  styleUrls: ['./top-winner-provider.component.scss'],
})
export class TopWinnerProviderComponent implements OnInit {
  constructor(
    public appService: AppService,
    private subHeaderService: SubHeaderService,
    private selectApi: SelectApi,
    private destroy$: DestroyService,
    private activatedRoute: ActivatedRoute,
    private api: RiskApi,
    public router: Router
  ) {
    const { uid, sTime, eTime } = activatedRoute.snapshot.queryParams;

    this.data.uid = uid || '';

    if (sTime) {
      this.data.time[0] = new Date(+sTime);
    }

    if (eTime) {
      this.data.time[1] = new Date(+eTime);
    }
  }

  protected readonly WinnerTopSortEnum = WinnerTopSortEnum;
  minDate = moment().subtract(6, 'month').add(1, 'day').hours(0).minute(0).seconds(0).millisecond(0).toDate();
  maxDate = new Date();
  private readonly EMPTY_DATA = {
    uid: '',
    isAsc: undefined as boolean | undefined,
    sortField: undefined as WinnerTopSortEnum | undefined,
    provider: '',
    time: [] as Date[],
  };

  data = cloneDeep(this.EMPTY_DATA);

  providerList: Provider[] = [];
  isLoading = false;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: WinnerTopByProviderItem[] = [];
  stat: WinnerTopByUserStat = {} as WinnerTopByUserStat;

  ngOnInit() {
    // this.loading(true);
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      forkJoin([this.selectApi.getProviderSelect(this.subHeaderService.merchantCurrentId)])
        .pipe(finalize(() => this.loading(false)))
        .subscribe(([providerList]) => {
          this.providerList = providerList;

          this.loadData(true);
        });
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    if (!this.data.time[1]) return;
    this.loading(true);
    this.api
      .innerTopByProvider({
        tenantId: this.subHeaderService.merchantCurrentId,
        uid: this.data.uid,
        provider: this.data.provider,
        beginDate: timeFormat(this.data.time[0], 'YYYY-MM-DD') || undefined,
        endDate: timeFormat(this.data.time[1], 'YYYY-MM-DD') || undefined,
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
        sort: this.data.isAsc === undefined ? undefined : +this.data.isAsc,
        sortBy: this.data.sortField,
      })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (!res) return;
        this.list = res.list;
        this.stat = res.statData;
        this.paginator.total = res?.total || 0;
      });
  }

  loading(v: boolean) {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.loadData(true);
  }

  /**
   * 跳转每日
   * @param item
   */
  onDumpDaily(item: WinnerTopByProviderItem) {
    this.router.navigate(['/risk/top-winner/daily'], {
      queryParams: { uid: item.uid, provider: item.provider, sTime: +this.data.time[0], eTime: +this.data.time[1] },
    });
  }
}
