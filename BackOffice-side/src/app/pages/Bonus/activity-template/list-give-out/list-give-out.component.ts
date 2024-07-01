import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { BonusActivityApi } from 'src/app/shared/api/bonus-activity.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { BonusService } from '../../bonus.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { takeUntil } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgFor, NgSwitch, NgSwitchCase, NgIf, AsyncPipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  templateUrl: './list-give-out.component.html',
  styleUrls: ['./list-give-out.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    LangPipe,
    AsyncPipe,
  ],
})
export class ListGiveOutComponent implements OnInit {
  constructor(
    private modalService: MatModal,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private api: BonusActivityApi,
    public appService: AppService,
    private bonusService: BonusService,
    private subHeaderService: SubHeaderService,
    public lang: LangService,
    private destroy$: DestroyService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  tenantId: any = '';
  dataEmpty = {
    title: '', // 名称
    time: '', // 时间
  };

  data = { ...this.dataEmpty };

  activityRoutePath: any = '';

  list: any = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    const parmas = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      tmpName: this.data.title || undefined,
      ...(this.data.time[0]
        ? {
            tmpStartTime: moment(Number(toDateStamp(this.data.time[0], false))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            tmpEndTime: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };

    this.loading(true);
    this.api.getCompetitionList(parmas).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      }
    });
  }

  onReset() {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  async onOpenWarningPopup(tpl: any, type: string, id: any) {
    const open = await this.lang.getOne('common.open'); // 开启
    const stop = await this.lang.getOne('member.activity.sencliCommon.stop'); // 停止
    const activity = await this.lang.getOne('member.activity.sencliCommon.activity'); // 活动
    const success = await this.lang.getOne('common.success'); // 成功
    const fail = await this.lang.getOne('common.fail'); // 失败

    let msg = '';
    if (type === 'start') {
      // 确认是否上线该活动
      msg = 'member.activity.sencliCommon.isOpenActivity';
    } else if (type === 'end') {
      // 是否确认结束该活动
      msg = 'member.activity.sencliCommon.isCloseActivity';
    }
    const modalRef = this.modalService.open(tpl, { width: '540px', data: msg, disableClose: true });
    modalRef.result
      .then(() => {
        this.loading(true);
        this.api.competitionStatus({ id, tmpState: type === 'start' ? 1 : 0 }).subscribe((res) => {
          this.loading(false);
          if (res.code === '0000') this.loadData();
          const status = type === 'start' ? open : stop;
          this.appService.showToastSubject.next({
            msg:
              res.code === '0000' ? `${activity}${status}${success}！` : res.message || `${activity}${status}${fail}！`,
            successed: res.code === '0000' ? true : false,
          });
        });
      })
      .catch(() => {});
  }

  // 加载状态
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }

  gotoEdit(item?: any) {
    if (!item) {
      this.router.navigate(['setting'], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([''], { relativeTo: this.activatedRoute });
  }
}
