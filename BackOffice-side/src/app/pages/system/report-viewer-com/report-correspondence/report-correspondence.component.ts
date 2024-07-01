import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { takeUntil, finalize, lastValueFrom } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { StatApi } from 'src/app/shared/api/stat.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ReportCorrespondenceItem } from 'src/app/shared/interfaces/stat';
import {
  DestroyService,
  toDateStamp,
  ExcelFormat,
  timeFormat,
  JSONToExcelDownload,
} from 'src/app/shared/models/tools.model';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CorrespondenceInfoItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'report-correspondence',
  templateUrl: './report-correspondence.component.html',
  styleUrls: ['./report-correspondence.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
  ],
})
export class ReportCorrespondenceComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    public lang: LangService,
    private api: StatApi
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 筛选 - 类型 */
  categoryList = [
    {
      name: '邮箱',
      lang: 'member.overview.correspondence.email',
      value: 'Email',
    },
    { name: '聊天', lang: 'member.overview.correspondence.chat', value: 'Chat' },
    { name: '其他', lang: 'member.overview.correspondence.other', value: 'Other' },
  ];

  dataEmpty = {
    category: '', // 类型
    editor: '', // 编辑者
    problem: '', // 问题
    time: [] as Date[],
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: ReportCorrespondenceItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      boardType: this.data.category,
      editor: this.data.editor,
      problem: this.data.problem,
      ...(this.data.time[0]
        ? {
            startTime: toDateStamp(this.data.time[0]),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            endTime: toDateStamp(this.data.time[1], true),
          }
        : {}),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getmessageboardinforeport(parmas);
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 获取类型翻译 */
  getCategoryLang(value: string) {
    return this.categoryList.find((v) => v.value === value)?.lang || 'common.unknown';
  }

  /** 获取问题翻译 */
  getProblemLang(info: CorrespondenceInfoItem[]) {
    if (Array.isArray(info)) {
      const multi = this.lang.isLocal ? 'zh-cn' : 'en-us';
      return (
        info.find((v) => v.languageCode === multi)?.problem ||
        info.find((v) => v.languageCode === 'zh-cn')?.problem ||
        '-'
      );
    }
    return '-';
  }

  /**
   * 导出
   */
  async onExport() {
    let list: ReportCorrespondenceItem[] = [];
    const maxDay = 90;
    const thrErr = () =>
      this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });
    // 比较时间是否超过90
    if (!(this.data.time?.[0] && this.data.time?.[1])) return thrErr();
    const start = toDateStamp(this.data.time[0], false);
    const end = toDateStamp(this.data.time[1], true);
    if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();
    try {
      this.appService.isContentLoadingSubject.next(true);
      const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
      this.appService.isContentLoadingSubject.next(false);
      list = Array.isArray(res?.list) ? res.list : []; // success === false会自动抛出
    } finally {
      this.appService.isContentLoadingSubject.next(false);
    }

    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list: any[]) {
    if (!list?.length) return;

    const uid = 'UID'; // UID
    const actCategory = await this.lang.getOne('member.overview.correspondence.category'); // 类型
    const date = await this.lang.getOne('common.date'); // 日期
    const editor = await this.lang.getOne('system.reportViewer.editor'); // 编辑者
    const problem = await this.lang.getOne('member.overview.correspondence.problem'); // 问题

    const category = {
      ['Email']: await this.lang.getOne('member.overview.correspondence.email'),
      ['Chat']: await this.lang.getOne('member.overview.correspondence.chat'),
      ['Other']: await this.lang.getOne('member.overview.correspondence.other'),
    };

    const exportList = list.map((e) => ({
      [uid]: ExcelFormat.str(e.uid),
      [actCategory]: category[e.boardType] || '-',
      [date]: timeFormat(e.messageTime),
      [editor]: e.editor || '-',
      [problem]: this.getProblemLang(e.infoList),
    }));

    JSONToExcelDownload(exportList, 'correspondence-report-list' + Date.now());
  }
}
