import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { forkJoin, lastValueFrom, Subject } from 'rxjs';
import { MessagestationApi } from 'src/app/shared/api/messagestation.api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { takeUntil } from 'rxjs/operators';
import { NoticeEditComponent } from 'src/app/pages/content/messagestation-manage/messagestation-log/notice-edit/notice-edit.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './messagestation-log.component.html',
  styleUrls: ['./messagestation-log.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class MessagestationLogComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: MessagestationApi,
    private ls: LocalStorageService,
    private appService: AppService,
    private modalService: NgbModal,
    public lang: LangService,
    private subHeader: SubHeaderService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  userName: any = ''; // 发送人
  time: Date[] = []; // 时间区间

  list: any[] = []; // 表格列表数据
  statusList: any[] = []; // 用户状态下拉列表
  isLoading = false; // 是否处于加载
  searchData: any = {}; // 表单搜索数据
  searchDataEMPT: any = {
    Title: '',
    SendUserName: '',
    Status: '',
  };

  private _destroy$ = new Subject<void>();

  async ngOnInit() {
    this.searchData = { ...this.searchDataEMPT };
    const al = await this.lang.getOne('common.all');
    forkJoin([this.api.getNoticeStatusList()]).subscribe(([statusList]) => {
      this.statusList = [{ value: '', label: al }, ...statusList];
    });

    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => this.loadData());
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // 获取数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.api
      .getQueryNotice({
        TenantId: this.subHeader.merchantCurrentId, //商户ID
        ...this.paginator,
        ...(this.searchData.Title ? { Title: this.searchData.Title } : {}),
        ...(this.searchData.SendUserName ? { SendUserName: this.searchData.SendUserName } : {}),
        ...(this.searchData.Status ? { Status: this.searchData.Status } : {}),
        ...(this.time[0] ? { SendTimeBegin: +this.time[0] } : {}),
        ...(this.time[1] ? { SendTimeEnd: +this.time[1] } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.list || [];
        //根据时间排序
        this.list = res.list.sort((a, b) => {
          return a.sendTime < b.sendTime ? 1 : -1;
        });
        this.paginator.total = res.total;
      });
  }

  async cancel(item): Promise<void> {
    this.loading(true);
    this.api
      .cancelNotice({
        id: item,
      })
      .subscribe((res) => {
        this.loading(false);
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'content.insite.ceSuc',
            successed: true,
          });
          this.loadData();
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'content.insite.ceFail',
            successed: false,
          });
        }
      });
  }

  // 重置
  onReset(): void {
    this.searchData = { ...this.searchDataEMPT };
    this.time = [];
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  async getMessageDetail(id: any): Promise<void> {
    const res = await lastValueFrom(this.api.getNotice({ id: id }));
    if (res.error) return this.appService.showToastSubject.next({ msgLang: 'content.insite.getFail' });

    const modal = this.modalService.open(NoticeEditComponent, {
      centered: true,
      size: 'lg',
    });
    modal.componentInstance['list'] = res;
  }
}
