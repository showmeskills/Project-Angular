import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { cloneDeep } from 'lodash';
import { takeUntil, finalize, forkJoin } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { VipApi } from 'src/app/shared/api/vip.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { SessionDetailComponent } from 'src/app/pages/session/components/session-detail/session-detail.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SessionApi } from 'src/app/shared/api/session.api';
import { SinglePageListRecords, AllPageListRecords } from 'src/app/shared/interfaces/session';
import { TimeFormatPipe, TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { TopicCategory, TopicItem } from 'src/app/shared/interfaces/session';
import { TopicLabelComponent } from 'src/app/pages/session/components/topic-label/topic-label.component';
import { Router } from '@angular/router';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { MassMsgComponent } from 'src/app/pages/session/dialogue/mass-msg/mass-msg.component';
import { SensitiveLexiconComponent } from 'src/app/pages/session/components/sensitive-lexicon/sensitive-lexicon.component';
import { DialogueFilterLatestMsgPipe } from 'src/app/pages/session/dialogue/dialogue.pipe';
import { SessionService } from 'src/app/pages/session/session.service';

@Component({
  selector: 'app-session-history',
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LangModule,
    MatSelectModule,
    FormsModule,
    AngularSvgIconModule,
    NgIf,
    NgFor,
    PaginatorComponent,
    EmptyComponent,
    FormRowComponent,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    SelectChildrenDirective,
    SelectGroupDirective,
    TimeFormatPipe,
    TimeUTCFormatPipe,
    TopicLabelComponent,
    MassMsgComponent,
    DialogueFilterLatestMsgPipe,
  ],
  providers: [DestroyService],
})
export class SessionHistoryComponent implements OnInit, OnDestroy {
  sessionService = inject(SessionService);
  private subHeader = inject(SubHeaderService);
  private _destroy$ = inject(DestroyService);
  public appService = inject(AppService);
  private vipApi = inject(VipApi);
  private drawer = inject(DrawerService);
  private api = inject(SessionApi);
  public router = inject(Router);
  private modal = inject(MatModal);

  /** 头部导航 */
  tabs: Array<string> = ['session.history.singleRecord', 'session.history.completeHistory'];
  currentIndex = 0;

  /** 信息数据 */
  EMPTY_DATA = {
    uids: '',
    categoryId: null,
    subjectId: null,
    time: [],
  };

  data = cloneDeep(this.EMPTY_DATA);

  /** 单次信息数据 */
  singleRecord: Array<SinglePageListRecords> = [];
  /** 全部信息数据 */
  AllRecord: Array<AllPageListRecords> = [];
  /** 全部信息数据 */
  // completeRecord: Array<{
  //   uid: string;
  //   userName: string;
  //   vip: number;
  //   summary: string;
  //   checked: boolean;
  // }> = [];

  /** 分页 */
  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();

  /** VIP等级 */
  levelList: { name: string; value: string }[] = [];

  /** 主题 */
  themeList: Array<{ name: string; value: string }> = [
    {
      name: 'Risk',
      value: '0',
    },
    {
      name: 'Desposit Query',
      value: '1',
    },
  ];

  /** 单次按钮 */
  tableBtns: Array<{
    key: string;
    value: string;
  }> = [
    {
      key: 'export',
      value: 'common.export',
    },
    {
      key: 'topic',
      value: 'session.history.topicManagement',
    },
    {
      key: 'group',
      value: 'session.history.groupOnlineMessage',
    },
    {
      key: 'sensitive',
      value: 'session.history.sensitiveLexicon',
    },
  ];

  /**
   * 话题分类列表
   */
  topicCategory: TopicCategory[] = [];

  /**
   * 话题列表
   */
  topic: TopicItem[] = [];

  ngOnInit(): void {
    this.paginator.pageSize = 200;
    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      // 建立WS链接，为列表【发送消息】功能提供正常消息推送
      this.sessionService.init(this.subHeader.merchantCurrentId, false);

      this.onLoadRecords(true);
      forkJoin([this.api.getTopicCategory(this.subHeader.merchantCurrentId)]).subscribe(([topicCategory]) => {
        this.topicCategory = topicCategory.data;
      });
      this.getTopicList();
    });
  }

  /** 获取 */
  get getParams() {
    const params = {
      startTime: toDateStamp(this.data.time[0], false) || undefined,
      endTime: toDateStamp(this.data.time[1], true) || undefined,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      uids: this.data.uids,
      categoryId: this.data.categoryId || null,
      subjectId: this.data.subjectId,
    };

    if (this.currentIndex === 0) {
      return {
        ...params,
      };
    }

    return params;
  }

  /**
   * 获取数据
   * @param resetPage
   */
  onLoadRecords(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    if (this.currentIndex === 0) {
      this.api.getSinglePageList(this.getParams).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.singleRecord = res.data?.records;
        this.paginator.total = res.data?.total;
      });
    } else {
      this.api.getAllPageList(this.getParams).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.AllRecord = res.data?.records;
        this.paginator.total = res.data?.total;
      });
      this.paginator.total = 3;
      this.appService.isContentLoadingSubject.next(false);
    }
  }

  /** 重置单次记录 */
  onResetRecord() {
    this.data = cloneDeep(this.EMPTY_DATA);
    if (this.currentIndex === 0) {
      this.singleRecord = [];
    } else {
      this.AllRecord = [];
    }
    this.onLoadRecords(true);
  }

  /** 内容切换 */
  onSwitchTab(index: number) {
    if (this.currentIndex === index) return;
    this.currentIndex = index;
    this.onResetRecord();
    // if (index === 0) {
    //   if (!this.tableBtns.find((item) => item.key === 'sensitive')) {
    //     this.tableBtns.push({
    //       key: 'sensitive',
    //       value: 'session.history.sensitiveLexicon',
    //     });
    //   }
    // } else {
    //   if (this.tableBtns.find((item) => item.key === 'sensitive')) {
    //     this.tableBtns.pop();
    //   }
    // }
  }

  /** 获取vip列表 */
  getVipLevel(tenantId: string) {
    this.vipApi.vip_manage_level_simple_list(tenantId).subscribe((data) => {
      if (data?.code === '0000' && Array.isArray(data?.data)) {
        this.levelList = data?.data.map((v) => ({ name: v.vipName, value: String(v.vipLevel) }));
      }
    });
  }

  /** 表格按钮操作 */
  onTableProcess(item: { key: string; value: string }) {
    if (item.key == 'export') {
      const curCheckedArr =
        this.currentIndex == 0 ? this.singleRecord.filter((e) => e.checked) : this.AllRecord.filter((e) => e.checked);
      if (!curCheckedArr.length) {
        return this.appService.showToastSubject.next({
          msgLang: 'content.mu.gou', // 请勾选需要导出的内容
          successed: false,
        });
      }
      if (curCheckedArr.length > 200) {
        return this.appService.showToastSubject.next({
          msgLang: 'content.mu.gouEnd', //不能超过30条
          successed: false,
        });
      }
      this.appService.isContentLoadingSubject.next(true);
      if (this.currentIndex == 0) {
        this.api
          .exportSingle(curCheckedArr.map((e) => e.topicId))
          .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
          .subscribe();
      } else {
        this.api
          .exportAllPage(curCheckedArr.map((e) => e.id))
          .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
          .subscribe();
      }
    } else if (item.key == 'topic') {
      this.router.navigate(['/session/theme']);
    } else if (item.key == 'group') {
      this.massMsg();
    } else if (item.key === 'sensitive') {
      this.onSensitiveLexicon();
    }
  }

  onExportSingle(topicId: number) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .exportSingle([topicId])
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe();
  }

  /**
   * 详情弹窗
   */
  async onMessageDetails(item: any, type: string) {
    const modal = this.drawer.open(SessionDetailComponent, {
      width: '1000px',
      minWidth: '900px',
    });
    modal.componentInstance.setData(item, type);
  }

  getMintes(item: SinglePageListRecords) {
    // 计算时间戳之间的毫秒差值
    let timeDiff = item.endTime - item.startTime;
    let leavel = timeDiff % (24 * 3600 * 1000); // 计算天数后剩余的时间
    let leavel2 = leavel % (3600 * 1000); // 计算剩余小时后剩余的毫秒数
    let minutes = Math.floor(leavel2 / (60 * 1000)); // 计算剩余的分钟数
    // 将毫秒转换为分钟
    return minutes;
  }

  getSeconds(item: SinglePageListRecords) {
    // 计算时间戳之间的毫秒差值
    let timeDiff = (item.endTime ? item.endTime : new Date().getTime()) - item.startTime;
    let leavel = timeDiff % (24 * 3600 * 1000); // 计算天数后剩余的时间
    let leavel2 = leavel % (3600 * 1000); // 计算剩余小时后剩余的毫秒数
    let seconds = Math.floor((leavel2 % (60 * 1000)) / 1000); // 计算剩余的秒数
    // 计算剩余的秒数
    return seconds;
  }

  onTopicCategory() {
    this.onLoadRecords(true);
    this.data.subjectId = null;
    this.getTopicList();
  }

  /**
   * 获取主题列表
   */
  getTopicList() {
    this.api.getTopic(this.data.categoryId).subscribe((res) => {
      this.topic = res.data;
    });
  }

  /**
   * 群发消息（主动发给用户）
   */
  async massMsg(uid?: string) {
    const modalRef = await this.modal.open(MassMsgComponent, { width: '1024px', disableClose: true });
    modalRef.componentInstance.tenantId = this.subHeader.merchantCurrentId;
    if (uid) {
      modalRef.componentInstance.control.setValue(2);
      modalRef.componentInstance.memberManualRemark = uid;
    }
  }

  /** 敏感词汇 */
  onSensitiveLexicon() {
    const modal = this.modal.open(SensitiveLexiconComponent, {
      width: '800px',
    });

    modal.componentInstance['tenantId'] = this.subHeader.merchantCurrentId;
    modal.result.then(() => {}).catch(() => {});
  }

  onExportAll(id: number) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .exportAllPage([id])
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sessionService.ngOnDestroy();
  }
}
