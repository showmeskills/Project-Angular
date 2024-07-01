import { Component, OnDestroy, OnInit, SkipSelf, TemplateRef } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { filter, forkJoin, Subject, switchMap } from 'rxjs';
import { JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment';
import { RadioSelectComponent } from 'src/app/shared/components/radio-select/radio-select.component';
import { map, takeUntil, tap } from 'rxjs/operators';
import { BankApi } from 'src/app/shared/api/bank.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf } from '@angular/common';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
@Component({
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    AngularSvgIconModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgIf,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class BankComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: BankApi,
    private selectApi: SelectApi,
    private appService: AppService,
    private modalService: MatModal,
    public lang: LangService,
    @SkipSelf() private subHeaderService: SubHeaderService
  ) {
    this.data = { ...this.EMPTY_DATA };
  }

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  isFullLoading = false;
  list: any[] = [];
  data: any = {};
  editAdminRemark = '';
  EMPTY_DATA: any = {
    uid: '',
    name: '',
    bankName: '',
    currency: '',
    isLock: '',
    cardNum: '',
    bindTime: '',
  };

  currencyList: any[] = [];
  detailData: any = {};
  private _destroy = new Subject<void>();

  /** getters */
  get getCurrencyName(): string {
    return this.currencyList.find((e) => e.code === this.data.currency)?.description || '';
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loading(true);

    forkJoin([this.selectApi.getCurrencySelect()]).subscribe(async ([currency]) => {
      this.loading(false);

      const all = await this.lang.getOne('common.all');
      this.currencyList = [
        { code: '', description: all },
        ...(Array.isArray(currency) ? currency.filter((e) => !e.isDigital) : []),
      ];

      this.subHeaderService.merchantId$.pipe(takeUntil(this._destroy)).subscribe(() => this.loadData(true));
    });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  /** methods */
  onReset(): void {
    this.data = { ...this.EMPTY_DATA };
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isFullLoading = this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);

    this.loading(true);
    this.api
      .getList({
        TenantId: this.subHeaderService.merchantCurrentId,
        UID: this.data.uid,
        Name: this.data.name,
        Currency: this.data.currency,
        IsLocked: this.data.isLock === '' ? undefined : this.data.isLock,
        BankName: this.data.bankName,
        CardNum: this.data.cardNum,
        CreatedTimeStart: toDateStamp(this.data.bindTime[0]),
        CreatedTimeEnd: toDateStamp(this.data.bindTime[1], true),
        PageIndex: this.paginator.page,
        PageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  // 导出
  async onExport() {
    const currency = await this.lang.getOne('common.currency');
    const accountName = await this.lang.getOne('payment.finceBank.accountName');
    const bankName = await this.lang.getOne('payment.bank.bankName');
    const bindingTime = await this.lang.getOne('payment.finceBank.bindingTime');
    const status = await this.lang.getOne('common.status');
    const accountLockout = await this.lang.getOne('payment.finceBank.accountLockout');
    const normal = await this.lang.getOne('payment.finceBank.normal');

    const curCheckedArr = this.list
      .filter((e) => e.checked)
      .map((e) => ({
        UID: e.uid,
        [currency]: e.currency,
        [accountName]: e.name,
        [bankName]: e.bankName,
        [bindingTime]: moment(e.createdTime).format('YYYY-MM-DD HH:mm:ss'),
        [status]: !e.isLocked ? normal : accountLockout,
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.tickExport',
        successed: false,
      });
    }

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(curCheckedArr, 'bank-list ' + Date.now());
  }

  onClear(event: Event, field: string): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.data[field] === '') return;

    this.data[field] = '';
    this.loadData(true);
  }

  async onOpenSelect(field: string, title: string): Promise<void> {
    const modal = this.modalService.open(RadioSelectComponent, {
      width: '500px',
    });
    modal.componentInstance['title'] = title;
    modal.componentInstance['list'] = this[field + 'List'];
    modal.componentInstance['select'] = [this.data[field]];

    const res = (await modal.result) || '';
    if (res === this.data[field]) return;

    this.data[field] = res;
    this.loadData(true);
  }

  async onView(tpl: TemplateRef<any>, item: any) {
    this.loading(true);
    this.api.getDetail(item.id).subscribe((res) => {
      this.loading(false);
      if (!res) return;

      this.modalService.open(tpl, { width: '1000px' });
      this.detailData = { ...res, id: item.id };
      this.editAdminRemark = res.adminRemark;
    });
  }

  onUpdateState(closeModal: any): void {
    if (this.isLoading || this.isFullLoading) return;
    if (this.editAdminRemark === this.detailData.adminRemark) {
      closeModal();
      return this.clearDetail();
    }

    this.loading(true);
    this.api.updateRemark(this.detailData.id, this.editAdminRemark).subscribe(async (res) => {
      this.loading(false);
      // 成功
      const success = await this.lang.getOne('common.success');
      // 失败
      const fail = await this.lang.getOne('common.fail');
      const successed = res === true;
      const msg = await this.lang.getOne('payment.finceBank.editNotes');
      this.appService.showToastSubject.next({
        msg: msg + (successed ? success : fail),
        successed,
      });

      if (!successed) return;
      closeModal();
      this.clearDetail();
      this.loadData();
    });
  }

  clearDetail(): void {
    this.detailData = {};
  }

  async onOpera(tpl: TemplateRef<any>, msg: string): Promise<void> {
    const modal = this.modalService.open(tpl, { width: '500px' });

    if (!(await modal.result)) return;
    // 成功
    const success = await this.lang.getOne('common.success');
    // 失败
    const fail = await this.lang.getOne('common.fail');
    this.loading(true);
    this.api
      .updateStatus(this.detailData.id)
      .pipe(
        map((e) => e === true),
        tap((successed) => {
          this.loading(successed);
          this.appService.showToastSubject.next({
            msg: msg + (successed ? success : fail),
            successed,
          });
        }),
        filter((e) => e),
        switchMap(() => this.api.getDetail(this.detailData.id))
      )
      .subscribe((res) => {
        this.loading(false);
        if (!res) return;

        this.detailData = { ...res, id: this.detailData.id };
        this.loadData();
      });
  }
}
