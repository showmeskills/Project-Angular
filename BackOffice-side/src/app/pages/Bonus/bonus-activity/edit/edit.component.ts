import { DatePipe, NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Clipboard } from '@angular/cdk/clipboard';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/api/bonus.api';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { VipApi } from 'src/app/shared/api/vip.api';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { BonusService } from '../../bonus.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    NgIf,
    AngularSvgIconModule,
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    PaginatorComponent,
    UploadComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    CurrencyIconDirective,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    VipNamePipe,
  ],
})
export class EditComponent implements OnInit {
  _destroyed: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  tepStatus?: any;
  constructor(
    private clipboard: Clipboard,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private subHeaderService: SubHeaderService,
    private datePipe: DatePipe,
    private bonusApi: BonusApi,
    private modalService: NgbModal,
    private vipApi: VipApi,
    public bonusService: BonusService
  ) {
    this.tepStatus = this.activatedRoute.snapshot.params; // 快照里的params参数
  }

  isLoading = false;

  // 报名详情&发放查询
  time: Date[] = [];
  uid: any = '';
  selectedVipList: any = [];

  vipList: { name: string; value: number }[] = [];

  // 当选选中的tab
  curTab = 4;

  // 报名详情
  signUpList: any = [];

  // 上传名单
  uploadPageList: any = [];

  // 名单审核
  examinePageList: any = [];

  // 发放查询
  applyTime: Date[] = [];
  grantTime: Date[] = [];
  oddNumbers: any = '';
  giveOutList: any = [];
  releaseStatus: any = '';
  releaseStatusList: any = [
    // 发放查询 完成度列表
    { name: '未提交', value: 0, lang: 'member.giveOut.unsubmitted' },
    { name: '已提交', value: 1, lang: 'member.giveOut.submitted' },
    { name: '审核通过', value: 2, lang: 'member.overview.userActivity.withdraw.passed' },
    { name: '发放失败', value: 3, lang: 'member.giveOut.failedissue' },
    { name: '待领取', value: 4, lang: 'member.giveOut.pendingCollection' },
    { name: '已领取', value: 5, lang: 'member.giveOut.received' },
    { name: '使用中', value: 6, lang: 'member.giveOut.Using' },
    { name: '已使用', value: 7, lang: 'member.giveOut.Used' },
    { name: '已失效', value: 8, lang: 'member.giveOut.expired' },
  ];

  customUpload = (file /*{ done }*/) => {
    this.loading(true);
    this.bonusApi.uploadfile(file, this.tepStatus.id, +this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.appService.showToastSubject.next({
          msgLang: 'member.coupon.model.uploadSuccess',
          successed: true,
        });
        setTimeout(() => {
          this.getUploadPageData();
        }, 500);
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'member.coupon.model.uploadFailed',
          successed: false,
        });
      }
    });
  };

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.getVipLevelList();
      this.onSeletedTab(this.curTab);
    });
  }

  onSeletedTab(id: any) {
    this.curTab = id;

    this.paginator.page = 1;
    // this.paginator.pageSize = 10;
    this.paginator.total = 0;

    if (id === 1) {
      this.onReset();
      this.getSignUp(true);
    } else if (id === 2) {
      this.getUploadPageData();
    } else if (id === 3) {
      this.getExaminePageData();
    } else if (id === 4) {
      this.onReset();
      this.getGiveOut(true);
    }
  }

  /** 获取VIPA/VIPC的等级 */
  getVipLevelList() {
    this.vipApi.vip_manage_level_simple_list(+this.subHeaderService.merchantCurrentId).subscribe((res) => {
      if (res?.code === '0000' && Array.isArray(res?.data))
        this.vipList = res.data.map((v) => ({ name: v.vipName, value: v.vipLevel }));
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 下载模板
  downloadTemplate() {
    this.loading(true);
    this.bonusApi.downloadUploadTemplate().subscribe((isSuccess) => {
      this.loading(false);
      if (isSuccess) {
        this.appService.showToastSubject.next({
          msgLang: 'member.coupon.model.downloadSuccessful',
          successed: true,
        });
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'member.coupon.model.uploadFailed',
          successed: false,
        });
      }
    });
  }

  //复制
  onCopy(content: string) {
    if (!content) return;
    const successed = this.clipboard.copy(content);
    this.appService.showToastSubject.next({ msgLang: successed ? 'content.mu.cSuc' : 'content.mu.cFail', successed });
  }

  // ---- 报名详情 ----
  // 获取页面数据
  getSignUp(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const param = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      uid: this.uid,
      actNo: this.tepStatus.id,
      vipLevels: this.selectedVipList,
      ...(this.time[0]
        ? {
            createTimeStart: moment(Number(toDateStamp(this.time[0], false))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.time[1]
        ? {
            createTimeEnd: moment(Number(toDateStamp(this.time[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
    };
    this.bonusApi.gerCustomer(param).subscribe((res) => {
      this.loading(false);
      if (res.code === '0000') {
        this.signUpList = res.data.vo.records || [];
        this.paginator.total = res.data.vo.total || 0;
      }
    });
  }

  // ---- 上传名单 ----
  // 上传 - 获取
  getUploadPageData() {
    this.loading(true);
    const parmas = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      releaseStatus: 0,
      bonusActivitesNo: this.tepStatus.id,
      isPrivate: true, // 只有上传名单才添加
    };
    this.bonusApi.getReleaseList(parmas).subscribe((res) => {
      this.loading(false);
      this.uploadPageList = res?.data?.pageDate?.records || [];
      this.paginator.total = res?.data?.pageDate?.total || 0;
    });
  }

  // 上传 - 删除
  deleteImport() {
    const delListId = this.uploadPageList.filter((v) => v.checked).map((v) => String(v.bonusReleaseDetailId));
    if (!this.uploadPageList.length || !delListId.length)
      return this.appService.showToastSubject.next({
        msgLang: !this.uploadPageList.length ? 'bonus.activity.noData' : 'bonus.activity.chooseDelContent',
        successed: false,
      });
    this.loading(true);
    this.bonusApi.deleteImport({ ids: delListId }).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.appService.showToastSubject.next({
          msgLang: 'member.activity.delSuc',
          successed: true,
        });
        setTimeout(() => {
          this.getUploadPageData();
        }, 500);
      } else {
        this.appService.showToastSubject.next({
          msgLang: res?.message || 'member.activity.delFailed',
          successed: false,
        });
      }
    });
  }

  // 上传 - 整体提交
  submitImport() {
    if (this.uploadPageList.length === 0)
      return this.appService.showToastSubject.next({
        msgLang: 'bonus.activity.noData',
        successed: false,
      });
    this.loading(true);
    this.bonusApi
      .submitImport({ activitiesNo: this.tepStatus.id, tenantId: +this.subHeaderService.merchantCurrentId })
      .subscribe((res) => {
        this.loading(false);
        if (res?.code === '0000') {
          this.appService.showToastSubject.next({
            msgLang: 'bonus.activity.allSubSuc',
            successed: true,
          });
          setTimeout(() => {
            this.getUploadPageData();
          }, 500);
        } else {
          this.appService.showToastSubject.next({
            msgLang: res?.message || 'bonus.activity.totalSubFailed',
            successed: false,
          });
        }
      });
  }

  // ---- 名单审核 ----
  // 审核 - 获取
  getExaminePageData() {
    this.loading(true);
    const parmas = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      releaseStatus: 1,
      bonusActivitesNo: this.tepStatus.id,
    };
    this.bonusApi.getReleaseList(parmas).subscribe((res) => {
      this.loading(false);
      this.examinePageList = res?.data?.pageDate?.records || [];
      this.paginator.total = res?.data?.pageDate?.total || 0;
    });
  }

  // 审核 - 驳回
  deleteAudit() {
    const delListId = this.examinePageList.filter((v) => v.checked).map((v) => String(v.bonusReleaseDetailId));
    if (!this.examinePageList.length || !delListId.length)
      return this.appService.showToastSubject.next({
        msgLang: !this.examinePageList.length ? 'bonus.activity.noData' : 'bonus.activity.selRejectFile',
        successed: false,
      });
    this.loading(true);
    this.bonusApi.deleteAudit({ ids: delListId }).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        setTimeout(() => {
          this.getExaminePageData();
        }, 500);
      }
      this.appService.toastOpera(res?.code === '0000');
    });
  }

  // 审核 - 选择通过
  SelectedAuditPass() {
    const passListId = this.examinePageList.filter((v) => v.checked).map((v) => String(v.bonusReleaseDetailId));
    if (!this.examinePageList.length || !passListId.length)
      return this.appService.showToastSubject.next({
        msgLang: !this.examinePageList.length ? 'bonus.activity.noData' : 'bonus.activity.selApproveContent',
        successed: false,
      });
    this.loading(true);
    this.bonusApi.passImportId({ ids: passListId }).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.appService.showToastSubject.next({
          msgLang: 'bonus.activity.approveSuc',
          successed: true,
        });
        setTimeout(() => {
          this.getExaminePageData();
        }, 500);
      } else {
        this.appService.showToastSubject.next({
          msgLang: res?.message || 'bonus.activity.approveFail',
          successed: false,
        });
      }
    });
  }

  // 审核 - 全体通过提示弹窗
  confirm(temp: any): void {
    if (this.examinePageList.length === 0)
      return this.appService.showToastSubject.next({
        msgLang: 'bonus.activity.noData',
        successed: false,
      });
    this.modalService.open(temp, { centered: true });
  }

  // 审核 - 全体通过
  passImport() {
    this.loading(true);
    this.bonusApi
      .passImport({ activitiesNo: this.tepStatus.id, tenantId: +this.subHeaderService.merchantCurrentId })
      .subscribe((res) => {
        this.loading(false);
        if (res?.code === '0000') {
          this.appService.showToastSubject.next({
            msgLang: 'bonus.activity.totalApproveSuc',
            successed: true,
          });
          setTimeout(() => {
            this.getExaminePageData();
          }, 500);
        } else {
          this.appService.showToastSubject.next({
            msgLang: res?.message || 'bonus.activity.totalApproveFail',
            successed: false,
          });
        }
      });
  }

  // ---- 发放查看 ----
  // 获取 页面数据
  getGiveOut(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const param = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      userNo: this.uid,
      bonusNo: this.oddNumbers,
      bonusActivitesNo: this.tepStatus.id,
      vipLevels: this.selectedVipList,
      releaseStatus: this.releaseStatus,
      ...(this.applyTime[0]
        ? {
            applyTimeBegin: moment(Number(toDateStamp(this.applyTime[0], false))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.applyTime[1]
        ? {
            applyTimeEnd: moment(Number(toDateStamp(this.applyTime[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.grantTime[0]
        ? {
            releaseTimeBegin: moment(Number(toDateStamp(this.grantTime[0], false))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.grantTime[1]
        ? {
            releaseTimeEnd: moment(Number(toDateStamp(this.grantTime[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
    };
    this.bonusApi.getReleaseList(param).subscribe((res) => {
      this.loading(false);
      this.giveOutList = res?.data?.pageDate?.records || [];
      this.paginator.total = res?.data?.pageDate?.total || 0;
    });
  }

  getReleaseStatus(status: any) {
    return this.releaseStatusList.find((v) => v.value === status)?.lang || '-';
  }

  getVipCotent(v: any) {
    if (v || v === 0) {
      if (v === 10) return 'SVIP';
      return 'VIP' + v;
    }
    return '-';
  }

  // 重置
  onReset() {
    this.uid = '';
    this.oddNumbers = '';
    this.selectedVipList = [];
    this.time = [];
    this.applyTime = [];
    this.grantTime = [];
    this.releaseStatus = '';
  }
}
