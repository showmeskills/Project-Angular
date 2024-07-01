import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    LangPipe,
  ],
})
export class AnalysisComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    public router: Router,
    private appService: AppService,
    public modal: NgbModal,
    private api: LotteryApi,
    private datePipe: DatePipe,
    public subHeaderService: SubHeaderService
  ) {}

  isLoading = false;

  // 表单搜索数据
  searchData: any = {};
  searchDataEMPT: any = {
    lotteryType: '快乐彩',
    time: [new Date(), new Date()],
  };

  // 页面数据
  list: any = [];

  dataGame: any = {
    gameValText: 'common.all',
    gameList: [],
    gameValList: [],
  };

  ngOnInit(): void {
    this.searchData = { ...this.searchDataEMPT };
    // this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loading(true);
      this.dataGame.gameList = [];
      this.api.systemPlayGetLotteryName(this.subHeaderService.merchantCurrentId).subscribe((res) => {
        this.loading(false);
        res.data?.map((e) => {
          this.dataGame.gameList.push({ val: e });
        });

        this.gameAll();
        this.loadData(true);
      });
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;
    //遍历之前清空
    this.dataGame.gameValList = [];
    //遍历
    this.dataGame.gameList.map((e) => {
      if (e.checked) {
        this.dataGame.gameValList.push(e.val);
      }
    });
    if (this.dataGame.gameValList.length > 0) {
      this.loading(true);
      this.api
        .systemCensusGetPage(this.subHeaderService.merchantCurrentId, {
          startTime: this.datePipe.transform(this.searchData.time[0], 'yyyy-MM-dd'),
          endTime: this.datePipe.transform(this.searchData.time[1], 'yyyy-MM-dd'),
          lotteryNames: this.dataGame.gameValList,
        })
        .subscribe((res) => {
          this.loading(false);
          this.list = res?.data || [];
        });
    } else {
      this.list = [];
    }
  }

  gameAll() {
    this.dataGame.gameList.map((e) => (e.checked = true));
    this.dataGame.gameValText = '全部';
  }

  gameNext() {
    if (this.dataGame.gameList.filter((e) => e.checked).length === this.dataGame.gameList.length) {
      this.dataGame.gameValText = '全部';
    } else if (this.dataGame.gameList.filter((e) => e.checked).length === 0) {
      this.dataGame.gameValText = '请至少选择一项';
    } else {
      this.dataGame.gameValText = '已选中';
    }
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.searchData = { ...this.searchDataEMPT };
    this.loadData(true);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
