import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { SessionApi } from 'src/app/shared/api/session.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { Comm100Payloads, Comm100ApiPayloads, Comm100List, Agents } from 'src/app/shared/interfaces/session';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'app-comm100-history',
  templateUrl: './comm100-history.component.html',
  styleUrls: ['./comm100-history.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LangModule,
    MatSelectModule,
    FormsModule,
    EmptyComponent,
    PaginatorComponent,
    FormRowComponent,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    TimeFormatPipe,
  ],
})
export class Comm100HistoryComponent implements OnInit {
  private subHeader = inject(SubHeaderService);
  private destroyRef = inject(DestroyRef);
  protected appService = inject(AppService);
  private sessionApi = inject(SessionApi);

  paginator: PaginatorState = new PaginatorState();

  tenantId: string | null = null;

  /** 搜索 参数 */
  EMPTY_DATA: Comm100Payloads = {
    tenantId: null,
    agent: '',
    time: [moment().subtract(6, 'day').startOf('h').toDate(), moment().startOf('h').toDate()],
    uid: '',
    userName: '',
    playerIp: '',
  };

  data = cloneDeep(this.EMPTY_DATA);

  comm100List: Array<Comm100List> = [];

  /**和后端沟通过写死的 */
  agents: Array<{ name: string; value: string }> = [
    {
      name: 'common.all',
      value: '',
    },
  ];

  pageSizes: number[] = PageSizes; // 页大小

  isFirstTimeLoad: boolean = true;

  ngOnInit(): void {
    this.getAgents();
    this.subHeader.merchantId$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((tenantId) => {
      this.data.tenantId = this.tenantId = tenantId;
      this.onLoadData(true);
    });
  }

  getAgents() {
    return Object.values(Agents).forEach((item) => {
      this.agents.push({ name: item, value: item });
    });
  }

  /**查询参数 */
  get comm100SearchPayloads(): Comm100ApiPayloads {
    return {
      tenantId: this.data.tenantId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      agent: this.data.agent,
      startTime: moment(Number(toDateStamp(this.data.time[0]))).format('YYYY-MM-DD HH:mm:ss') || undefined,
      endTime: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD HH:mm:ss') || undefined,
      uid: this.data.uid,
      userName: this.data.userName,
      playerIp: this.data.playerIp,
    };
  }

  /**获取 列表 */
  onLoadData(resetPage = false) {
    if (this.isFirstTimeLoad) {
      this.isFirstTimeLoad = false;
      return;
    }
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    this.sessionApi
      .getComm100List({
        ...this.comm100SearchPayloads,
      })
      .subscribe((data) => {
        this.appService.isContentLoadingSubject.next(false);
        this.comm100List = data?.data?.records || [];
        this.paginator.total = data?.data?.total || 0;
      });
  }

  exportComm100() {
    if (!this.comm100List.length) {
      this.appService.showToastSubject.next({
        successed: false,
        msgLang: 'system.merchants.noData',
      });
      return;
    }
    const maxDay = 7;
    const thrErr = () =>
      this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

    if (!(this.data.time?.[0] && this.data.time?.[1])) return thrErr();

    const start = toDateStamp(this.data.time[0], false);
    const end = toDateStamp(this.data.time[1], true);
    if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

    this.appService.isContentLoadingSubject.next(true);
    this.sessionApi
      .exportComm100List({
        ...this.comm100SearchPayloads,
      })
      .subscribe((data) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.showToastSubject.next({
          successed: data,
          msgLang: data ? 'session.comm100.downloadSuccessful' : 'session.comm100.downloadFailed',
        });
      });
  }

  /**重置所有参数 */
  onReset() {
    this.data = cloneDeep({
      ...this.EMPTY_DATA,
      tenantId: this.tenantId,
    });
    this.comm100List = [];
    this.onLoadData(true);
  }
}
