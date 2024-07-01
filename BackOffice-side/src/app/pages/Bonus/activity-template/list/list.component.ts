import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { BonusActivityApi } from 'src/app/shared/api/bonus-activity.api';
import { NewActivityApi } from 'src/app/shared/api/newActivity.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { BonusService } from '../../bonus.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
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
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class ListComponent implements OnInit {
  constructor(
    private modalService: MatModal,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private api: BonusActivityApi,
    private activityApi: NewActivityApi,
    private appService: AppService,
    private bonusService: BonusService,
    public lang: LangService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  tenantId: any = '';
  data: any = {};
  dataEmpty: any = {
    title: '', // 名称
    time: '', // 时间
  };

  activityRoutePath: any = '';
  activityRoutePathList: any[] = [
    { title: '存款送模版', path: '/bonus/activity-manage/activity-deposit', id: 2 },
    { title: 'SVIP 体验卷', path: '/bonus/activity-manage/activity-svip-experience', id: 7 },
    { title: '新人任务模板', path: '/bonus/activity-manage/activity-newcomer-task', id: 3 },
    { title: '每日竞赛模版', path: '/bonus/activity-manage/activity-competition', id: 9 },
    { title: '利润分享模版', path: '/bonus/activity-manage/activity-profit-sharing', id: 8 },
  ];

  list: any = [];

  ngOnInit() {
    // 获取 活动标识ID 并拿到相应活动模板路由地址
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.activityRoutePath = this.activityRoutePathList.find((j) => j.id === +v.activityId)?.path;
      this.tenantId = v?.tenantId;
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    const parmas = {
      TenantId: +this.tenantId,
      ...(this.data.title
        ? {
            tmpName: this.data.title,
          }
        : {}),
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
      Current: this.paginator.page,
      Size: this.paginator.pageSize,
    };
    this.loading(true);
    this.activityApi.getCompetitionList(parmas).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res?.records || [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  onReset() {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  goActivityTep(type: any, item?: any) {
    if (!this.activityRoutePath) {
      this.appService.showToastSubject.next({
        // 暂无活动模板！
        msgLang: 'member.activity.sencliCommon.noActivityTemplate',
        successed: false,
      });
      return;
    }
    if (type === 'create') {
      this.router.navigate([this.activityRoutePath], {
        queryParams: { tenantId: this.tenantId },
      });
    } else {
      this.bonusService.activityInfo.next(item);
      this.router.navigate([this.activityRoutePath], {
        queryParams: { tenantId: this.tenantId, type: 'edit' },
      });
    }
  }

  onSort(sort: any) {
    console.log(sort);
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
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
