import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Router } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { CategoryMenuComponent } from '../category-menu/category-menu.component';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-finish-match',
  templateUrl: './finish-match.component.html',
  styleUrls: ['./finish-match.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    CategoryMenuComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    WinDirective,
    WinColorDirective,
    NgIf,
    PaginatorComponent,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class FinishMatchComponent implements OnInit, OnDestroy {
  _destroyed$: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false;

  constructor(
    private appService: AppService,
    public subHeaderService: SubHeaderService,
    public router: Router
  ) {}

  areaList: any[] = [];
  statusList: any = [
    { name: '未结算', value: 1 },
    { name: '已结算', value: 2 },
  ];

  data: any = {};
  dataEmpty: any = {
    time: '', // 时间
    area: '', // 地区
    status: '', // 状态

    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  matchSearch: any = '';

  list: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit() {
    this.paginator.total = 100;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // this.loading(true);
  }

  // 重置
  onReset() {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  sportsMenuChange(e: any) {
    console.log(e);
  }

  onSort(sortKey: any) {
    console.log(sortKey);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
