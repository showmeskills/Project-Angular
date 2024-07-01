import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import moment from 'moment/moment';
import { cloneDeep } from 'lodash';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Provider } from 'src/app/shared/interfaces/select.interface';
import { takeUntil } from 'rxjs/operators';
import { finalize, forkJoin } from 'rxjs';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormsModule } from '@angular/forms';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { WinnerTopByUserStat, WinnerTopByDateItem, WinnerTopSortByDateEnum } from 'src/app/shared/interfaces/risk';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'top-winner-daily',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyIconDirective,
    EmptyComponent,
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    PaginatorComponent,
    TableSortComponent,
    OwlDateTimeTriggerDirective,
    CurrencyValuePipe,
    FormatNumberDecimalPipe,
    WinDirective,
    WinColorDirective,
    SearchDirective,
    SearchInpDirective,
    AngularSvgIconModule,
    NgbPopover,
    VipNamePipe,
    TimeFormatPipe,
  ],
  providers: [DestroyService],
  templateUrl: './top-winner-daily.component.html',
  styleUrls: ['./top-winner-daily.component.scss'],
})
export class TopWinnerDailyComponent implements OnInit {
  constructor(
    public appService: AppService,
    private subHeaderService: SubHeaderService,
    private selectApi: SelectApi,
    private destroy$: DestroyService,
    private activatedRoute: ActivatedRoute,
    private api: RiskApi
  ) {
    const { uid, provider, sTime, eTime } = activatedRoute.snapshot.queryParams;

    this.data.uid = uid || '';
    this.data.provider = provider || '';

    if (sTime) {
      this.data.time[0] = new Date(+sTime);
    }

    if (eTime) {
      this.data.time[1] = new Date(+eTime);
    }
  }

  protected readonly WinnerTopSortEnum = WinnerTopSortByDateEnum;
  minDate = moment().subtract(6, 'month').add(1, 'day').hours(0).minute(0).seconds(0).millisecond(0).toDate();
  maxDate = new Date();
  private readonly EMPTY_DATA = {
    uid: '',
    isAsc: true as boolean | undefined,
    sortField: WinnerTopSortByDateEnum.date as WinnerTopSortByDateEnum | undefined,
    provider: '',
    time: [] as Date[],
  };

  data = cloneDeep(this.EMPTY_DATA);

  providerList: Provider[] = [];
  isLoading = false;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: WinnerTopByDateItem[] = [];
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
      .innerTopByDate({
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
   * 判断游戏icon是否存在
   * @Author FrankLin
   */
  isGameIcon(arr: number[], item: any) {
    if (!Array.isArray(item)) {
      return false;
    }
    return item.some((res) => arr.includes(res.gameCategory));
  }

  /**
   * 判断显示厂商
   * @Author FrankLin
   */
  showGameMaker(arr: number[], item: any): string {
    if (!Array.isArray(item)) {
      return '';
    }
    let gameMaker = [];
    item.forEach((res) => {
      if (arr.includes(res.gameCategory)) {
        gameMaker = gameMaker.concat(res.gameProviders);
      }
    });
    return gameMaker.join(', ');
  }
}
