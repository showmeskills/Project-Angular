import { AppService } from 'src/app/app.service';
import { Component, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { combineLatest, takeUntil } from 'rxjs';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { DestroyService } from 'src/app/shared/models/tools.model';
@Component({
  selector: 'app-risk-level-congfiguraion',
  templateUrl: './risk-level-congfiguraion.component.html',
  styleUrls: ['./risk-level-congfiguraion.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, LangPipe, KeyValuePipe, FormsModule, FormRowComponent, AttrDisabledDirective, EmptyComponent],
})
export class RiskLevelCongfiguraionComponent implements OnInit {
  constructor(
    private appService: AppService,
    public lang: LangService,
    private riskApi: RiskApi,
    private memberApi: MemberApi,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService
  ) {}

  isLoading = signal(false);

  /** 被禁止的列表 */
  forbidActivityCodes: WritableSignal<{
    [key: string]: Array<{ activityCode: string; displayName: string; isBlocked: boolean }>;
  }> = signal({
    R1: [],
    R2: [],
    R3: [],
    R4: [],
    R5: [],
  });

  renderActivityCodes = computed(() => {
    if (Object.values(this.forbidActivityCodes()).filter((item) => item.length > 0).length) {
      return this.forbidActivityCodes();
    }
    return null;
  });

  renderDisabled = computed(() => {
    if (this.isLoading()) return 'disabled';
    return null;
  });

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onLoadData();
    });
  }

  onLoadData() {
    this.loading(true);
    combineLatest([
      this.riskApi.getRiskControlConfig({ tenantId: this.subHeaderService.merchantCurrentId }),
      this.memberApi.getForbidActivityCodes(),
    ]).subscribe(([config, forbidActivityCodes]) => {
      this.forbidActivityCodes.update((item) => {
        return {
          ...item,
          R1: forbidActivityCodes.map((codes) => ({
            ...codes,
            isBlocked: config.r1.activityCodes?.find((code) => code === codes.activityCode) ? true : false,
          })),
          R2: forbidActivityCodes.map((codes) => ({
            ...codes,
            isBlocked: config.r2.activityCodes?.find((code) => code === codes.activityCode) ? true : false,
          })),
          R3: forbidActivityCodes.map((codes) => ({
            ...codes,
            isBlocked: config.r3.activityCodes?.find((code) => code === codes.activityCode) ? true : false,
          })),
          R4: forbidActivityCodes.map((codes) => ({
            ...codes,
            isBlocked: config.r4.activityCodes?.find((code) => code === codes.activityCode) ? true : false,
          })),
          R5: forbidActivityCodes.map((codes) => ({
            ...codes,
            isBlocked: config.r5.activityCodes?.find((code) => code === codes.activityCode) ? true : false,
          })),
        };
      });
      this.loading(false);
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading.set(true);
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 修改 状态
   * @param key
   * @param activityCode
   * @param isBlocked
   */
  onChange(key: string, activityCode: string, isBlocked: boolean) {
    this.forbidActivityCodes.update((list) => ({
      ...list,
      [key]: list[key]?.map((item) => ({
        ...item,
        isBlocked: item.activityCode === activityCode ? isBlocked : item.isBlocked,
      })),
    }));
  }

  submit() {
    this.loading(true);
    this.riskApi
      .updateRiskControlConfig({
        tenantId: this.subHeaderService.merchantCurrentId,
        r1: {
          activityCodes:
            this.forbidActivityCodes()
              ['R1']?.filter((item) => item.isBlocked)
              .map((item) => item.activityCode) || [],
        },
        r2: {
          activityCodes:
            this.forbidActivityCodes()
              ['R2']?.filter((item) => item.isBlocked)
              .map((item) => item.activityCode) || [],
        },
        r3: {
          activityCodes:
            this.forbidActivityCodes()
              ['R3']?.filter((item) => item.isBlocked)
              .map((item) => item.activityCode) || [],
        },
        r4: {
          activityCodes:
            this.forbidActivityCodes()
              ['R4']?.filter((item) => item.isBlocked)
              .map((item) => item.activityCode) || [],
        },
        r5: {
          activityCodes:
            this.forbidActivityCodes()
              ['R5']?.filter((item) => item.isBlocked)
              .map((item) => item.activityCode) || [],
        },
      })
      .subscribe((data) => {
        if (data) {
          this.onLoadData();
        }

        this.appService.showToastSubject.next({
          msgLang: data ? 'risk.config.suc' : 'risk.config.fail',
          successed: data,
        });
        this.loading(false);
      });
  }
}
