import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, switchMap, zip } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { takeUntil, tap } from 'rxjs/operators';
import { bigNumber } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NumberSignPipe } from 'src/app/shared/pipes/big-number.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { MatTabsModule } from '@angular/material/tabs';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import {
  InputPercentageDirective,
  InputNumberDirective,
  InputFloatDirective,
} from 'src/app/shared/directive/input.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AngularSvgIconModule,
    NgFor,
    FormsModule,
    InputPercentageDirective,
    InputNumberDirective,
    FormRowComponent,
    InputFloatDirective,
    ReactiveFormsModule,
    LangTabComponent,
    MatTabsModule,
    UploadComponent,
    NumberSignPipe,
    LangPipe,
  ],
})
export class PlanComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private zoneApi: ZoneApi,
    private api: AgentApi,
    public appService: AppService,
    private activatedRoute: ActivatedRoute,
    private modal: NgbModal,
    private subHeader: SubHeaderService,
    protected langService: LangService
  ) {}

  isLoading = false; // 是否加载中

  curType = 0;
  isEdit = false; // 是否修改
  langList: any[] = []; // 语言列表
  curTab = 0; // 当前tab索引

  commissionConfig: any = {};
  commissionConfigForm: any = {};

  commissionTask: any = [];
  shareList: any = {};

  _destroy$ = new Subject<void>();

  curPlat = 0;
  // 'PC端', 'H5端', 'APP端'
  plat: any[] = ['dashboard.plan.pc', 'dashboard.plan.h5', 'dashboard.plan.app'];
  selectLang: string[] = ['zh-cn']; // PM:默认值CN
  affiliateType = 1;
  proportionList: any[] = ['9:16', '1:1', '16:9'];

  /** 顶级推荐人奖励设定 */
  recommendList: any[] = [
    { name: '1' },
    { name: '2 ~ 10' },
    { name: '11 ~ 20' },
    { name: '21 ~ 50' },
    { name: '51 ~ 100' },
  ];

  /** 顶级推荐人奖励设定编辑的formControl */
  rewardForm = (() => this.fb.array(this.recommendList.map(() => new FormControl('' /*, validatorNumberRequired*/))))();

  get curPlatValue() {
    switch (this.curPlat) {
      case 0:
        return 'pc';
      case 1:
        return 'h5';
      case 2:
        return 'app';
    }
    return '';
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.merchantId$
      .pipe(
        takeUntil(this._destroy$),
        switchMap(() => zip([this.commissionConfig$(), this.commissionTask$(), this.getRecommendReward$()]))
      )
      .subscribe(() => {
        this.appService.isContentLoadingSubject.next(false);
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  loadData(): void {}

  onSubmit(): void {}

  onTab(i: number): void {
    this.isEdit = false;
    this.curTab = i;
  }

  // 佣金任务提交
  onCommissionTaskSubmit(): void {
    this.api
      .config_task_save(
        this.commissionTask.map((e) => ({
          id: e.id,
          typeName: e.typeName,
          condition: (+e.conditionEdit * 1e6) / 1e8 || undefined,
          proportion: (+e.proportionEdit * 1e6) / 1e8 || undefined,
          merchant: this.subHeader.merchantCurrentId,
          type: 1,
        }))
      )
      .subscribe((res) => {
        if (res.data === true) {
          this.isEdit = false;
          this.commissionTask$().subscribe();
          this.appService.showToastSubject.next({
            msgLang: 'common.operationSuccess',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'common.operationFailed',
            successed: false,
          });
        }
      });
  }

  // 佣金配置提交
  onCommissionSubmit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .config_commission_save({
        cycleMax: +this.commissionConfigForm.cycleMax || undefined,
        baseProportion: (+this.commissionConfigForm.baseProportion * 1e6) / 1e8 || undefined,
        discountMax: (+this.commissionConfigForm.discountMax * 1e6) / 1e8 || undefined,
        merchant: this.subHeader.merchantCurrentId,
        type: 2, // 配置类型(1-佣金任务 2-佣金配置3-分享页)
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res.data === true) {
          this.isEdit = false;
          this.appService.isContentLoadingSubject.next(true);
          this.commissionConfig$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
          this.appService.showToastSubject.next({
            msgLang: 'common.operationSuccess',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'common.operationFailed',
            successed: false,
          });
        }
      });
  }

  // 获取佣金配置
  commissionConfig$() {
    return this.api.config_commission_query(this.subHeader.merchantCurrentId).pipe(
      tap((res) => {
        this.commissionConfig = res?.data || {};
      })
    );
  }

  // 获取佣金任务
  commissionTask$() {
    return this.api
      .config_task_query({
        merchant: this.subHeader.merchantCurrentId,
        type: 1,
        lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
      })
      .pipe(
        tap((res) => {
          this.commissionTask = (res?.data || []).map((e) => {
            e.condition = bigNumber(e.condition || 0)
              .times(100)
              .toNumber();
            e.proportion = bigNumber(e.proportion || 0)
              .times(100)
              .toNumber();
            e.conditionEdit = e.condition;
            e.proportionEdit = e.proportion;

            return e;
          });
        })
      );
  }

  onEdit() {
    this.commissionConfigForm = { ...this.commissionConfig };
    this.updateRewardForm();

    this.isEdit = !this.isEdit;
  }

  // 打开分享页配置弹窗
  async openShare(ref: TemplateRef<any>, type: number): Promise<void> {
    this.curPlat = 0;
    this.affiliateType = type;
    this.api
      .config_language_query({
        tenantId: this.subHeader.merchantCurrentId,
        affiliateType: type,
      })
      .subscribe((res) => {
        if (res?.data) {
          this.selectLang = res.data;
          this.getShare(type);
        }
      });

    const modal = this.modal.open(ref, {
      centered: true,
      windowClass: 'share-pic-config-modal',
    });
    const res = await modal.result;

    if (!res) return;
  }

  // 获取分享配置
  getShare(type: number, language = 'zh-cn', deviceType = 'pc') {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.proportionList.map((proportion) =>
        this.api.config_share_query({
          affiliateType: type, // 1:联盟计划 2:推荐好友
          merchant: this.subHeader.merchantCurrentId,
          type: 3,
          deviceType, // pc h5 app
          language,
          proportion, // 比列
        })
      )
    ).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.shareList = res.map((e) => e?.data || '');
    });
  }

  // 语言列表改变
  updateLanguageForm(languageValue: string[]) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .config_language_save({
        affiliateType: this.affiliateType,
        languageValue,
        tenantId: this.subHeader.merchantCurrentId,
      })
      .subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  // 选择语言索引改变
  onLangChange(code: string) {
    this.curPlat = 0;
    this.getShare(this.affiliateType, code, this.curPlatValue);
  }

  // 上传图片改变
  onUploadChange(value: string, i: number, proportion, code: string) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .config_share_save({
        affiliateType: this.affiliateType,
        deviceType: this.curPlatValue,
        language: code,
        merchant: this.subHeader.merchantCurrentId,
        proportion,
        type: 3,
        value,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!value) return; // 值为空不弹出提示

        if (res?.data === true) {
          this.shareList[i] = value;
          this.appService.showToastSubject.next({
            msgLang: 'common.uploadedSuc',
            successed: true,
          });
        } else {
          this.shareList[i] = '';
          this.appService.showToastSubject.next({
            msgLang: 'common.uploadFailed',
            successed: false,
          });
        }
      });
  }

  onType(number: number) {
    this.curType = number;
    this.curTab = 0;
    this.isEdit = false;
  }

  /** 拉取推荐奖励 */
  getRecommendReward$() {
    return this.api.config_top_query({ tenantId: this.subHeader.merchantCurrentId }).pipe(
      tap((res) => {
        if (!res.data.length) return;

        this.updateRewardForm(res.data);
      })
    );
  }

  onRecommendRewardSubmit() {
    // this.rewardForm.markAllAsTouched();
    // if (this.rewardForm.invalid) return;
    // const val = this.rewardForm.value as string[];
    // const isPass = val.every((e, i) => !i || +val[i - 1] >= +e);
    //
    // if (!isPass) return this.appService.showToastSubject.next({ msg: '低排名奖金不可高于高排名！' });

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .config_top_save({
        rewards: this.getRewards(),
        tenantId: this.subHeader.merchantCurrentId,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res.data === true) {
          this.isEdit = false;
          this.appService.isContentLoadingSubject.next(true);
          this.getRecommendReward$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
          this.appService.showToastSubject.next({
            msgLang: 'common.sucOperation',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'common.operationFailed',
            successed: false,
          });
        }
      });
  }

  /** 获取推荐奖励提交数据 */
  getRewards(): any[] {
    return this.recommendList.map((e, i) => ({
      dictId: e.dictId || undefined,
      reward: this.rewardForm.value[i],
    }));
  }

  /** 获取推荐奖励提交数据 */
  updateRewardForm(data?: any): void {
    data = data || this.recommendList;

    this.recommendList.forEach((e, i) => {
      e.dictId = data?.[i]?.dictId || undefined;
      e.reward = data?.[i]?.reward || '';

      this.rewardForm.at(i).patchValue(e.reward);
    });
  }
}
