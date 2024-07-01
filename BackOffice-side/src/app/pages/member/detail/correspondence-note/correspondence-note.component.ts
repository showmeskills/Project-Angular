import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe, TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CorrespondenceNoteEditComponent } from './edit/edit.component';
import { CorrespondenceNoteDeleteComponent } from './delete/delete.component';
import { CorrespondenceInfoItem, CorrespondenceItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'correspondence-note',
  templateUrl: './correspondence-note.component.html',
  styleUrls: ['./correspondence-note.component.scss'],
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
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LabelComponent,
    IconSrcDirective,
    TableSortComponent,
    TimeUTCFormatPipe,
    TimeFormatPipe,
  ],
})
export class CorrespondenceNoteComponent implements OnInit {
  constructor(
    public appService: AppService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private breadcrumbsService: BreadcrumbsService,
    private api: MemberApi,
    public lang: LangService,
    private modal: MatModal
  ) {
    const { id, uid, tenantId } = activatedRoute.snapshot.queryParams; // params参数;

    this.mid = id;
    this.uid = uid;
    this.tenantId = tenantId;
  }

  mid: string;
  uid: string;
  tenantId: string;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 类型 */
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
    category: '',
    problem: '',
    time: [] as Date[],
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: CorrespondenceItem[] = [];

  ngOnInit() {
    this.breadcrumbsService.setBefore([
      {
        name: '会员详情',
        lang: 'nav.memberDetail',
        click: () =>
          this.router.navigate(['/member/list/detail/overview'], {
            queryParams: { id: this.mid, uid: this.uid, tenantId: this.tenantId },
          }),
      },
    ]);

    this.onReset();
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      uid: this.uid,
      boardType: this.data.category,
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
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.getmessageboardlist(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = Array.isArray(res?.list) ? res?.list : [];
      this.paginator.total = res?.total || 0;
    });
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 打开通讯记录 - 编辑 */
  openCorrespondenceEdit(item?: CorrespondenceItem) {
    const modal = this.modal.open(CorrespondenceNoteEditComponent, {
      width: '800px',
    });

    modal.componentInstance['id'] = item?.id;
    modal.componentInstance['data'] = item;

    modal.componentInstance.editSuccess.subscribe(() => setTimeout(() => this.loadData(), 100));
    modal.result.then(() => {}).catch(() => {});
  }

  /** 打开通讯记录 - 删除 */
  openCorrespondenceDelete(item: CorrespondenceItem) {
    const modal = this.modal.open(CorrespondenceNoteDeleteComponent, {
      width: '750px',
    });

    modal.componentInstance['data'] = item;

    modal.componentInstance.deleteSuccess.subscribe(() => setTimeout(() => this.loadData(), 100));
    modal.result.then(() => {}).catch(() => {});
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
}
