import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { switchMap, map, filter, forkJoin, finalize, zip } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { UEditorComponent } from 'src/app/components/ueditor';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import {
  ActivityQualificationsStep1,
  ActivityQualificationsTypeEnum,
  ActivityTypeEnum,
  PrizeAmountType,
  PrizeType,
  PrizeTypeItem,
  TurntableCreate1Lang,
} from 'src/app/shared/interfaces/activity';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'exclusive-vip-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    LangTabComponent,
    UEditorComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    TimeFormatPipe,
    PrizeConfigPipe,
    AngularSvgIconModule,
    IconSrcDirective,
    FormWrapComponent,
    CurrencyIconDirective,
  ],
})
export class ExclusiveVipEditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public appService: AppService,
    public router: Router,
    private api: ActivityAPI,
    public prizeService: PrizeService,
    private modalService: MatModal,
    public lang: LangService
  ) {
    const { tenantId, id, code } = activatedRoute.snapshot.queryParams;

    this.id = +id || 0; // 0为新建
    this.tmpCode = code || '';
    this.tenantId = +tenantId;

    this.activityType = ActivityTypeEnum[ActivityTypeEnum.VipExclusive] as any;
  }

  activityType: ActivityTypeEnum;

  /** 语系数据 */
  curLang = 'zh-cn';
  selectLang = ['zh-cn'];

  /** 商户ID */
  tenantId;

  /** 活动ID */
  id = 0;

  /** 模板code - goGaming */
  tmpCode = '';

  /** 奖品类型合集 */
  prizeTypeList: PrizeTypeItem[] = [];

  formGroup: FormGroup = this.fb.group({
    time: [[] as any, Validators.required], // 活动时间
    lang: this.fb.array([this.generateLangItem()]),
  });

  /** 奖池 - 列表数据 */
  prizePoolList: any[] = [undefined];

  /** 名称多语系 */
  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.prize_getprizetypes(this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.prizeTypeList = [...(res?.data || [])];
      this.tmpCode && this.getDetail();
    });
  }

  /** 获取详情 */
  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    zip([
      this.api.activityDetailStep1(this.id, this.tenantId),
      this.api.vipexclusive_query_steptwo(this.tmpCode, this.tenantId),
      this.api.prize_getprizes({
        merchantId: this.tenantId,
        lang: this.lang.isLocal ? 'zh-cn' : 'en-us',
        pageIndex: 1,
        pageSize: 999,
      }),
    ]).subscribe(([goGamingRes, activityRes, prizeData]) => {
      this.appService.isContentLoadingSubject.next(false);

      /** 活动第一步 */
      if (!goGamingRes) {
        this.appService.showToastSubject.next(
          goGamingRes?.message ? { msg: goGamingRes.message } : { msgLang: 'common.fail' }
        );
      }

      this.formGroup.patchValue({
        time: [
          goGamingRes.startTime ? new Date(goGamingRes.startTime) : null,
          goGamingRes.endTime ? new Date(goGamingRes.endTime) : null,
        ],
      });

      if (goGamingRes?.infoList?.length) {
        this.selectLang = goGamingRes.infoList.map((e) => e.languageCode);
        this.formGroup.setControl(
          'lang',
          this.fb.array(
            goGamingRes.infoList.map((e) =>
              this.generateLangItem({
                ...e,
                activityName: e.name,
                activitySubName: e.subName,
                rule: e.content,
                description: e.slogan,
              })
            )
          )
        );
      }

      /** 活动第二步 */
      if (!activityRes || activityRes?.code !== '0000') {
        this.appService.showToastSubject.next(
          activityRes?.message ? { msg: activityRes?.message } : { msgLang: 'common.fail' }
        );
      }

      const list = activityRes?.data?.prizeItems || [];
      const prizes = prizeData.data?.prizes || [];

      if (!list.length || !prizes.length) return;

      this.prizePoolList = list.map((v) => prizes.find((j) => j?.id === +v?.prizeId));
    });
  }

  /** 提交 */
  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    if (this.prizePoolList.some((v) => !v?.id)) {
      // 请选择奖品
      this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli15.errorTips.tips2' });
      return;
    }

    this.base().subscribe(() => this.activity());
  }

  /** 活动创建 - 第一步 */
  base() {
    const infoList: TurntableCreate1Lang[] =
      this.formGroup.value.lang?.map((e) => ({
        languageCode: e.languageCode, // 语言Code
        name: e.activityName, // 名称
        subName: e.activitySubName, // 子名称
        slogan: e.description, // 宣传语
        content: e.rule, // 规则简介内容
      })) || [];

    const sendData = {
      tenantId: this.tenantId,
      id: String(this.id || 0), // 新增时，一定是0
      type: this.activityType,
      startTime: this.formGroup.value.time?.[0]?.getTime() || 0, // 开始时间
      endTime: this.formGroup.value.time?.[1]?.getTime() || 0, // 结束时间
      infoList, // 详情列表
    };

    const qualificationsSendData: ActivityQualificationsStep1 = {
      tenantId: this.tenantId,
      tmpStartTime: moment(this.formGroup.value.time?.[0]?.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      tmpEndTime: moment(this.formGroup.value.time?.[1]?.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      tmpName: infoList[0]?.name,
      tmpType: ActivityQualificationsTypeEnum[ActivityTypeEnum[this.activityType]],
      langConfig: infoList.map((e) => e.languageCode),
    };

    this.appService.isContentLoadingSubject.next(true);
    return this.api[this.id ? 'activityUpdateStep1' : 'activityCreateStep1'](sendData).pipe(
      switchMap((step1) => {
        // 资格接口
        const qualificationAPI = this.api
          .activityQualificationsStep1({ ...qualificationsSendData, tmpCode: step1.activityCode })
          .pipe(
            map((res) => {
              const isSuccess = res?.code === '0000';

              // 抛出返回的错误信息
              !isSuccess &&
                this.appService.showToastSubject.next(
                  res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
                );

              return isSuccess ? step1.activityCode : null;
            }),
            filter((e) => !!e)
          );

        return forkJoin([qualificationAPI]).pipe(map(() => step1));
      }),
      tap(({ id, activityCode }) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!(typeof activityCode === 'string' && activityCode.length)) {
          this.appService.toastOpera(false);
          throw new Error('responseData id is null or type is not number');
        }

        this.id = id;
        this.tmpCode = activityCode;
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** 活动创建 - 第二步 */
  activity() {
    let params = {
      tmpCode: this.tmpCode,
      tenantId: this.tenantId,
      prizeItems: this.prizePoolList.map((v) => ({ prizeId: String(v?.id) })),
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.vipexclusive_edit_steptwo(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0000')
        return this.appService.showToastSubject.next(
          res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.toList();
    });
  }

  /** 跳转到列表页 */
  toList() {
    this.router.navigate(['/bonus/activity-manage/' + ActivityTypeEnum[ActivityTypeEnum.VipExclusive]]);
  }

  /** 奖品 - 获取奖品状态 */
  getPrizeSatus(status: number) {
    const list = new Map([
      [1, 'member.coupon.pendingReview'],
      [3, 'member.coupon.beenRemoved'],
      [4, 'member.coupon.pendingReview'],
    ]);
    return list.get(status) || '-';
  }

  /** 打开奖品选择弹窗 */
  onOpenSelectPrize(index) {
    const modal = this.modalService.open(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });
    modal.result
      .then((v) => {
        if (
          ([PrizeType.Cash, PrizeType.Credit, PrizeType.AfterCash, PrizeType.NonStickyBonus].includes(v?.prizeType) &&
            v?.amountType === PrizeAmountType.Fixed) ||
          [PrizeType.FreeSpin].includes(v?.prizeType)
        ) {
          this.prizePoolList[index] = { ...v };
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'member.activity.sencli15.prizeSelectLimitTips',
          });
        }
      })
      .catch(() => {});
  }

  /** 更新语言表单 */
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.generateLangItem(value);
    });

    this.formGroup.setControl('lang', this.fb.array(langArray));
  }

  generateLangItem(data?: any) {
    return this.fb.group({
      activityName: [data?.activityName || '', Validators.required],
      activitySubName: [data?.activitySubName || ''],
      rule: [data?.rule || ''],
      description: [data?.description || ''],
      languageCode: [data?.languageCode || 'zh-cn'],
    });
  }

  /** 是否只读查看 */
  @Input() isView = false;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }
}

@Component({
  selector: 'exclusice-vip-edit-view',
  standalone: true,
  imports: [ExclusiveVipEditComponent],
  template: '<exclusive-vip-edit [isView]="true"></exclusive-vip-edit>',
})
export class ExclusiveVipEditViewComponent {}
