import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ApprovalProgressComponent } from 'src/app/pages/proxy/approval/approval-progress/approval-progress.component';
import { AppService } from 'src/app/app.service';
import { lastValueFrom, Subject, switchMap, zip } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Router } from '@angular/router';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { takeUntil } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PayService } from 'src/app/pages/proxy/approval/approval-apply/pay.service';
import { WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { WithdrawalApprovalItem } from 'src/app/shared/interfaces/transaction';
import { FinancialWithdrawStatus } from 'src/app/shared/interfaces/status';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { WordHidePipe, WordHideFirstPipe } from 'src/app/shared/pipes/common.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ApprovalStatusComponent } from './approval-status/approval-status.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';

@Component({
  selector: 'budget-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    CurrencyIconDirective,
    NgIf,
    NgbTooltip,
    ApprovalStatusComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    ModalTitleComponent,
    ReactiveFormsModule,
    InputTrimDirective,
    ModalFooterComponent,
    TimeFormatPipe,
    WordHidePipe,
    WordHideFirstPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ApprovalComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    public modal: MatModal,
    private appService: AppService,
    private channelApi: ChannelApi,
    private selectApi: SelectApi,
    public subHeader: SubHeaderService,
    public ls: LocalStorageService,
    public lang: LangService,
    public payService: PayService,
    private fb: FormBuilder
  ) {}

  WithdrawalTypeEnum = WithdrawalTypeEnum;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: WithdrawalApprovalItem[] = [];
  channelList: any[] = [];
  currencyList: any[] = [];
  labelList: any[] = [];
  isLoading = false;
  data: any = {};
  defaultData: any = {
    currency: '',
    label: '',
    channel: '',
    info: '',
    time: '',
    applicant: '',
  };

  /**
   * 审批Control
   */
  approvalGroup = this.fb.group(
    {
      approval: [true],
      note: [''],
    },
    { validators: [this.validApproval()] }
  );

  protected readonly _destroy$ = new Subject<void>();

  /** getters */
  get isSuper() {
    return Boolean(this.ls.userInfo.isSuperAdmin);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.merchantId$
      .pipe(
        takeUntil(this._destroy$),
        switchMap(() => zip(this.selectApi.getDrawLabelList(this.subHeader.merchantCurrentId, true)))
      )
      .subscribe(([label]) => {
        this.labelList = label;
        this.onReset();
      });

    zip(this.selectApi.goMoneyGetCurrencies(true), this.channelApi.getAllChannels(true, true)).subscribe(
      ([currency, channel]) => {
        this.currencyList = currency;
        this.channelList = channel;
      }
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  onReset(): void {
    this.data = { ...this.defaultData };
    this.loadData(true);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .getReviewWithdrawList({
        MerchantId: this.subHeader.merchantCurrentId,
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
        MultipleConditions: this.data.info,
        Currency: this.data.currency,
        WithdrawTabId: this.data.label,
        ChannelId: this.data.channel,
        applicant: this.data.applicant,
        StartTime: toDateStamp(this.data.time[0]),
        EndTime: toDateStamp(this.data.time[1], true),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.list = res?.list || [];
        this.paginator.total = res?.total;
      });
  }

  async openApply(): Promise<void> {
    // this.modal.open(ApprovalApplyComponent, { centered: true, windowClass: 'approval-apply-modal' });
    this.router.navigate(['/proxy/budget-apply']);
  }

  async onDetail(item: WithdrawalApprovalItem): Promise<void> {
    const pullDetail = async () => {
      this.appService.isContentLoadingSubject.next(true);
      const detail = await lastValueFrom(this.channelApi.getWithdrawDetail(item.id));
      this.appService.isContentLoadingSubject.next(false);
      return detail;
    };

    const detail = await pullDetail();
    if (!detail) return this.appService.showToastSubject.next({ msgLang: 'budget.failGetDetails' });

    const modal = this.modal.open<ApprovalProgressComponent, boolean>(ApprovalProgressComponent, {
      maxWidth: '1280px',
      minWidth: '1050px',
      width: '100%',
    });

    modal.componentInstance['data'] = detail;
    modal.componentInstance.reload.subscribe(async (res) => {
      const detail = await pullDetail();
      if (!detail) return this.appService.showToastSubject.next({ msgLang: 'budget.failGetDetails' });

      modal.componentInstance['data'] = detail;
      res && this.loadData();
    });

    const res = await modal.result;
    res && this.loadData();
  }

  /** 审核 */
  onApproval(item: WithdrawalApprovalItem, close: any) {
    this.approvalGroup.markAllAsTouched();
    if (this.approvalGroup.invalid) return;

    const pass = !!this.approvalGroup.value.approval;
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi[item.status === FinancialWithdrawStatus.Waiting ? 'updateWithdrawStatus' : 'updateWithdrawStatus2'](
      item.id,
      pass ? FinancialWithdrawStatus.Permission : FinancialWithdrawStatus.Rejected,
      this.approvalGroup.value.note?.trim() || ''
    ).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);

      let approve = await this.lang.getOne('common.approve');
      let reject = await this.lang.getOne('common.reject');
      let success = await this.lang.getOne('common.success');
      let fail = await this.lang.getOne('common.fail');

      const successed = res === true;
      const prefix = pass ? approve : reject;
      const suffix = successed ? success : fail;

      this.appService.showToastSubject.next({
        msg: prefix + suffix,
        successed,
      });

      if (successed) {
        close(true);
        this.loadData();
      }
    });
  }

  /**
   * 打开分级别审核弹窗
   * @param approvalTpl
   * @param item
   */
  onOpenApprove(
    approvalTpl: TemplateRef<{ currentItem: WithdrawalApprovalItem; isFirst: boolean }>,
    item: WithdrawalApprovalItem
  ) {
    this.approvalGroup.patchValue({
      approval: true,
      note: '',
    });
    this.modal.open(approvalTpl, {
      data: { currentItem: item, isFirst: item.status === FinancialWithdrawStatus.Waiting },
      width: '540px',
    });
  }

  /**
   * 验证审批
   * @private
   */
  private validApproval(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const approval = control.get('approval')?.value;
      if (!approval && !control.get('note')?.value) {
        (control as FormGroup).controls['note'].setErrors({ required: true });
      } else {
        (control as FormGroup).controls['note'].setErrors(null);
      }

      return null;
    };
  }

  protected readonly FinancialWithdrawStatus = FinancialWithdrawStatus;
}
