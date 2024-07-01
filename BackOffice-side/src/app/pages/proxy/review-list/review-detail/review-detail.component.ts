import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule } from '@angular/forms';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { forkJoin, Subject } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SafeUrlPipe } from 'src/app/shared/pipes/safe-url.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { InputPercentageDirective } from 'src/app/shared/directive/input.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf } from '@angular/common';
import { NzImageDirective } from 'src/app/shared/components/image';

@Component({
  selector: 'review-detail',
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    FormRowComponent,
    NgIf,
    FormsModule,
    UploadComponent,
    InputPercentageDirective,
    TimeFormatPipe,
    SafeUrlPipe,
    LangPipe,
    NzImageDirective,
  ],
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private appService: AppService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = +id || 0;
  }

  id: number;
  tabIndex = 0;

  data: any = {
    auditList: [],
    proxyData: {},
  };

  commission: any = {};
  sendData: any = {
    isDailySettlement: false,
    isSafe: false,
  };

  helperList = [{ url: '' }, { url: '' }];
  _destroyed$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  /** getters */
  get tabHeader() {
    return this.data?.auditList || [];
  }

  get baseInfo() {
    return this.data?.proxyData || [];
  }

  get curData() {
    return this.tabHeader?.[this.tabIndex] || { supplementaryFile: ['', ''] };
  }

  get curInfo() {
    return this.baseInfo?.[0] || {}; // proxyData只会有当前id的一条数据 其他数据需要重新请求
  }

  /** 是否待审核状态 */
  get isPending() {
    return this.curData.state === 0 && this.curData.channelManager && this.curData.applyType === 1; // 代理申请
  }

  /** methods */
  init() {
    this._destroyed$.next();
    this._destroyed$.complete();
    this._destroyed$ = new Subject<void>();
    this.subHeader.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe((merchantId) => {
      this.appService.isContentLoadingSubject.next(true);
      forkJoin([this.api.proxy_audit_details({ id: this.id }), this.api.config_commission_query(merchantId)]).subscribe(
        ([detail, commission]) => {
          this.appService.isContentLoadingSubject.next(false);

          const data = detail?.data || {};

          data?.auditList?.forEach((e) => {
            let res = e?.supplementaryFile ? e?.supplementaryFile.split(',').map((e) => ({ url: e })) : [];

            // 如果是待审新增对象进行绑定
            if (e.state === 0 && e.applyType === 2) {
              if (!res.length) res = [{ url: '' }, { url: '' }];
            }

            e.supplementaryFile = res;
          });

          this.data = data;
          this.commission = commission?.data || {};
          this.tabIndex = this.tabHeader.findIndex((e) => e.id === this.id);
        }
      );
    });
  }

  // 是否批准/拒绝
  onPass(isPass: boolean) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .proxy_audit_save({
        auditId: this.curData.id,
        applyType: this.curData.applyType,
        explain: this.sendData.explain,
        isDailySettlement: this.sendData.isDailySettlement,
        supplementaryFile: this.helperList.map((e) => e.url).join(','),
        protectCommission: this.sendData.isSafe ? (this.sendData.protectCommission * 1e6) / 1e8 : undefined,
        action: isPass ? 'approved_application' : 'rejected_application',
        protectTime: moment(this.sendData.protectTime).add(this.commission.cycleMax, 'months').format('x'),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res.data === true) {
          this.back();
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.sucOperation',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.operationFailed',
            successed: false,
          });
        }
      });
  }

  // 返回
  back() {
    this.router.navigate(['/proxy/review']);
  }

  // 代理佣金百分比失去焦点
  onCommissionBlur(): void {
    if (!this.sendData.isSafe) {
      this.sendData.protectCommission = '';
      return this.appService.showToastSubject.next({
        msg: '请先勾选',
        successed: false,
      });
    }

    this.sendData.protectCommission = Math.min(this.sendData.protectCommission, this.commission.discountMax);
    this.sendData.protectCommission = Math.max(this.sendData.protectCommission, 0.01);
  }

  onSafe() {
    this.sendData.protectCommission = this.sendData.isSafe ? this.commission.discountMax : '';
  }

  onTab(i: number) {
    this.tabIndex = i;
    this.id = this.curData.id;
    this.router.navigate(['/proxy/review', this.id]);
    this.init();
  }
}
