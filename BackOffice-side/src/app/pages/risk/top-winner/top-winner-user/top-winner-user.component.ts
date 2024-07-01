import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormsModule } from '@angular/forms';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import moment from 'moment/moment';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { cloneDeep } from 'lodash';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { takeUntil } from 'rxjs/operators';
import { WinnerTopByUserItem, WinnerTopSortEnum, WinnerTopByUserStat } from 'src/app/shared/interfaces/risk';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { finalize } from 'rxjs';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { Router } from '@angular/router';
import { FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';

@Component({
  selector: 'top-winner-user',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    FormsModule,
    LangPipe,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    InputTrimDirective,
    CurrencyIconDirective,
    CurrencyValuePipe,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    TimeFormatPipe,
    TableSortComponent,
    LoadingDirective,
    WinDirective,
    WinColorDirective,
    FormatNumberDecimalPipe,
    AngularSvgIconModule,
    NgbPopover,
    VipNamePipe,
  ],
  providers: [DestroyService],
  templateUrl: './top-winner-user.component.html',
  styleUrls: ['./top-winner-user.component.scss'],
})
export class TopWinnerUserComponent implements OnInit {
  constructor(
    public appService: AppService,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private riskApi: RiskApi,
    public router: Router
  ) {}

  protected readonly WinnerTopSortEnum = WinnerTopSortEnum;
  minDate = moment().subtract(6, 'month').add(1, 'day').hours(0).minute(0).seconds(0).millisecond(0).toDate();
  maxDate = new Date();
  private readonly EMPTY_DATA = {
    uid: '',
    isAsc: undefined as boolean | undefined,
    sortField: undefined as WinnerTopSortEnum | undefined,
    time: [] as Date[],
  };

  data = cloneDeep(this.EMPTY_DATA);

  isLoading = false;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: WinnerTopByUserItem[] = [];
  stat: WinnerTopByUserStat = {} as WinnerTopByUserStat;

  ngOnInit() {
    // this.loading(true);
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    if (!this.data.time[1]) return;
    this.loading(true);
    this.riskApi
      .innerTopByMember({
        tenantId: this.subHeaderService.merchantCurrentId,
        uid: this.data.uid,
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

  onReset(data?: Partial<typeof this.EMPTY_DATA>) {
    this.data = cloneDeep(Object.assign(this.EMPTY_DATA, data));
    this.loadData(true);
  }

  onUID(uid: string) {
    this.router.navigate(['/risk/top-winner/provider'], {
      queryParams: { uid, sTime: +this.data.time[0], eTime: +this.data.time[1] },
    });
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
