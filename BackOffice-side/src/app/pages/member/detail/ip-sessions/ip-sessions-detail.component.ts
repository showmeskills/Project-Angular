import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { lastValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { finalize } from 'rxjs/operators';
import { JSONToExcelDownload, timeFormat } from 'src/app/shared/models/tools.model';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { cloneDeep } from 'lodash';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IpSessionsItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'ip-sessions-detail',
  templateUrl: './ip-sessions-detail.component.html',
  styleUrls: ['./ip-sessions-detail.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    IconSrcDirective,
    NgSwitchDefault,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    EmptyComponent,
    TimeFormatPipe,
    LabelComponent,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    FormRowComponent,
  ],
})
export class IpSessionsComponent implements OnInit {
  constructor(
    public appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public lang: LangService,
    private breadcrumbsService: BreadcrumbsService,
    private api: MemberApi,
    private modalService: MatModal,
    private currencyService: CurrencyService
  ) {
    const { uid, id, tenantId } = activatedRoute.snapshot.queryParams; // params参数;
    this.id = id;
    this.uid = uid;
    this.tenantId = tenantId;
  }

  id: string;
  uid: string;
  tenantId: string;
  EMPTY_DATA = {
    category: '',
    time: [] as Date[], // 时间范围
    ip: '',
  };

  data = cloneDeep(this.EMPTY_DATA);
  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 列表数据 */
  list: IpSessionsItem[] = [];

  ngOnInit() {
    this.breadcrumbsService.setBefore([
      {
        name: '会员详情',
        lang: 'nav.memberDetail',
        click: () =>
          this.router.navigate(['/member/list/detail/overview'], {
            queryParams: { id: this.id, uid: this.uid, tenantId: this.tenantId },
          }),
      },
    ]);

    this.loadData(true);
  }

  /** 列表数据 */
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
      uid: this.uid,
      ip: this.data.ip,
      tenantId: this.tenantId,
      category: this.data.category,
      StartTime: timeFormat(this.data.time[0], 'YYYY-MM-DD') || undefined,
      EndTime: timeFormat(this.data.time[1], 'YYYY-MM-DD') || undefined,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getipsessions(parmas);
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list = this.list;

    if (isAll) {
      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : [];
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const loginTime = await this.lang.getOne('member.detail.ipsessionstable.loginTime');
    const endTime = await this.lang.getOne('member.detail.ipsessionstable.endTime');
    const startBalance = await this.lang.getOne('member.detail.ipsessionstable.startBalance');
    const endBalance = await this.lang.getOne('member.detail.ipsessionstable.endBalance');
    const totalActiveFlow = await this.lang.getOne('member.detail.ipsessionstable.totalActiveFlow');
    const ipLocation = await this.lang.getOne('member.detail.ipsessionstable.ipLocation');
    const fingerprint = await this.lang.getOne('member.detail.ipsessionstable.fingerprint');
    const device = await this.lang.getOne('member.detail.ipsessionstable.device');
    const os = await this.lang.getOne('member.detail.ipsessionstable.os');
    const browser = await this.lang.getOne('member.detail.ipsessionstable.browser');

    JSONToExcelDownload(
      list.map((e: any) => ({
        [loginTime]: timeFormat(e.loginTime) || '-',
        [endTime]: timeFormat(e.endTime) || '-',
        [startBalance]: this.currencyService.toFormatCurrency('USDT', e?.startBalance),
        [endBalance]: this.currencyService.toFormatCurrency('USDT', e?.endBalance),
        [totalActiveFlow]: this.currencyService.toFormatCurrency('USDT', e?.totalActiveFlow),
        IP: e.ip,
        [ipLocation]: e.ipLocation || '-',
        [fingerprint]: e.fingerprint,
        [device]: e.device,
        [os]: e.os,
        [browser]: e.browser,
      })),
      'ip-sessions' + Date.now()
    );
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.list = [];
    this.loadData(true);
  }
}
