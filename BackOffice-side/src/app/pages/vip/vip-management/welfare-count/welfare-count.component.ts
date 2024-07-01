import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, Subject, takeUntil, forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VipSettingComponent } from 'src/app/pages/vip/vip-management/vip-setting/vip-setting.component';

@Component({
  selector: 'welfare-count',
  templateUrl: './welfare-count.component.html',
  styleUrls: ['./welfare-count.component.scss'],
  standalone: true,
  imports: [
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgFor,
    NgIf,
    AngularSvgIconModule,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class WelfareCountComponent implements OnInit, OnDestroy {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private vipApi: VipApi,
    private subHeaderService: SubHeaderService,
    private appService: AppService,
    private modal: NgbModal
  ) {}

  isLoading = false; // 是否处于加载

  list: any = []; // 福利总览数据
  time: Date[] = []; // 时间区间

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      // 没有商户
      if (!this.subHeaderService.merchantCurrentId) return;
      this.loadData();
    });
  }

  loadData() {
    this.loading(true);
    const param = {
      TenantId: this.subHeaderService.merchantCurrentId,
      ...(this.time[0] ? { StartTime: toDateStamp(this.time[0]) } : {}),
      ...(this.time[1] ? { EndTime: toDateStamp(this.time[1], true) } : {}),
    };
    this.vipApi
      .getVipOverview(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.list = res || [];
      });
  }

  /** 红利配置设定 */
  async openSetting(): Promise<void> {
    this.loading(true);
    forkJoin([
      this.vipApi.getBasicConfigInfo(this.subHeaderService.merchantCurrentId),
      this.vipApi.getLevelConfigList(this.subHeaderService.merchantCurrentId),
    ]).subscribe(([basicRes, levelRes]) => {
      this.loading(false);
      if (levelRes?.data.length === 0 || basicRes.code !== '0000') return;
      const modal = this.modal.open(VipSettingComponent, {
        centered: true,
        windowClass: 'vip-settings-modal',
      });
      modal.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
      modal.componentInstance['levelConfigList'] = levelRes?.data || [];
      modal.componentInstance['basicConfigList'] = basicRes?.data || {};
      modal.result.then(({ value }) => {
        value && this.loadData();
      });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
