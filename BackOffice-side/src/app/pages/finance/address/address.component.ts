import { Component, OnDestroy, OnInit, SkipSelf, TemplateRef } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { filter, forkJoin, Subject, switchMap } from 'rxjs';
import { JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { VirtualApi } from 'src/app/shared/api/virtual.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment';
import { RadioSelectComponent } from 'src/app/shared/components/radio-select/radio-select.component';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NgFor, NgSwitch, NgSwitchCase, NgIf, AsyncPipe } from '@angular/common';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  animations: [],
  standalone: true,
  imports: [
    FormsModule,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class AddressComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: VirtualApi,
    private selectApi: SelectApi,
    public appService: AppService,
    private modalService: MatModal,
    @SkipSelf() private subHeaderService: SubHeaderService,
    private lang: LangService
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
    currency: '',
    time: '',
    lockStatus: '',
    network: '',
    bindTime: '',
    lockTime: '',
  };

  currencyList: any[] = [];
  networkList: any[] = [];
  detailData: any = {};
  private _destroy = new Subject<void>();

  /** getters */
  get getCurrencyName(): string {
    return this.currencyList.find((e) => e.code === this.data.currency)?.description || '';
  }

  get getNetworkName(): string {
    return this.networkList.find((e) => e.code === this.data.network)?.description || '';
  }

  /** lifeCycle */
  async ngOnInit() {
    this.loading(true);
    const all = await this.lang.getOne('common.all');
    forkJoin([this.selectApi.getCurrencySelect(), this.api.getNetwork()]).subscribe(([currency, network]) => {
      this.currencyList = [
        { code: '', description: all },
        ...(Array.isArray(currency) ? currency.filter((e) => e.isDigital) : []),
      ];
      this.networkList = [
        { code: '', description: all },
        ...(Array.isArray(network) ? network : []).map((e) => ({
          code: e.categoryCode,
          description: e.categoryCode,
        })),
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
    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);

    this.loading(true);
    this.api
      .getList({
        TenantId: this.subHeaderService.merchantCurrentId,
        Uid: this.data.uid,
        CurrentName: this.data.currency,
        Network: this.data.network,
        LockStatus: this.data.lockStatus === '' ? undefined : this.data.lockStatus,
        BindingStartTime: toDateStamp(this.data.bindTime[0]),
        BindingEndTime: toDateStamp(this.data.bindTime[1], true),
        LockStartTime: toDateStamp(this.data.lockTime[0]),
        LockEndTime: toDateStamp(this.data.lockTime[1], true),
        ...this.paginator,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  // 导出
  async onExport() {
    const currency = await this.lang.getOne('finance.address.currency');
    const status = await this.lang.getOne('finance.address.status');
    const normal = await this.lang.getOne('finance.address.normal');
    const lockedAccount = await this.lang.getOne('finance.address.lockedAccount');
    const transferNetwork = await this.lang.getOne('finance.address.transferNetwork');
    const enabledTime = await this.lang.getOne('finance.address.enabledTime');
    const address = await this.lang.getOne('finance.address.address');
    const markedAddress = await this.lang.getOne('finance.address.markedAddress');
    const curCheckedArr = this.list
      .filter((e) => e.checked)
      .map((e) => ({
        UID: e.uid,
        [markedAddress]: e.remark,
        [currency]: e.currentName,
        [address]: e.address,
        [transferNetwork]: e.network,
        [enabledTime]: moment(e.bindingTime).format('YYYY-MM-DD HH:mm:ss'),
        [status]: !e.lockStatus ? normal : lockedAccount,
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.tickExport',
        successed: false,
      });
    }

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(curCheckedArr, 'virtual-currency-list ' + Date.now());
  }

  onClear(event: Event, field: string): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.data[field] === '') return;

    this.data[field] = '';
    this.loadData(true);
  }

  async onOpenSelect(field: string, title: string): Promise<void> {
    const getTitle = await this.lang.getOne(title);
    const modal = this.modalService.open(RadioSelectComponent, {
      width: '500px',
    });
    modal.componentInstance['title'] = getTitle;
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
      this.detailData = res;
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
    this.api
      .updateRemark(this.detailData.id, this.subHeaderService.merchantCurrentId, this.editAdminRemark)
      .subscribe((res) => {
        this.loading(false);

        const successed = res === true;
        const msg = '修改备注';
        this.appService.showToastSubject.next({
          msg: msg + (successed ? '成功' : '失败'),
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

    this.loading(true);
    this.api
      .updateStatus(this.detailData.id, this.subHeaderService.merchantCurrentId)
      .pipe(
        map((e) => e === true),
        tap((successed) => {
          this.loading(successed);
          this.appService.showToastSubject.next({
            msg: msg + (successed ? '成功' : '失败'),
            successed,
          });
        }),
        filter((e) => e),
        switchMap(() => this.api.getDetail(this.detailData.id))
      )
      .subscribe((res) => {
        this.loading(false);
        if (!res) return;

        this.detailData = res || {};
        this.loadData();
      });
  }
}
