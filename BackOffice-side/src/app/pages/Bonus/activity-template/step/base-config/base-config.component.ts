import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import {
  ActivityCycleEnum,
  ActivityQualificationsStep1,
  ActivityQualificationsTypeEnum,
  ActivityTypeEnum,
  TurntableCreate1Lang,
} from 'src/app/shared/interfaces/activity';
import { filter, finalize, forkJoin, of, switchMap, zip } from 'rxjs';
import moment from 'moment';
import { map } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { UEditorComponent } from 'src/app/components/ueditor/ueditor.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { weekList } from 'src/app/shared/models/tools.model';
import { CheckboxArrayControlDirective } from 'src/app/shared/directive/input.directive';
import {
  SelectAllDirective,
  SelectChildrenDirective,
  SelectGroupDirective,
} from 'src/app/shared/directive/select.directive';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'config-view',
  template: '<base-config [isView]="true"></base-config>',
  standalone: true,
  imports: [forwardRef(() => BaseConfigComponent)],
})
export class ConfigViewComponent {}

@Component({
  selector: 'base-config',
  templateUrl: './base-config.component.html',
  styleUrls: ['./base-config.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    NgFor,
    NgIf,
    FormRowComponent,
    UEditorComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AsyncPipe,
    TimeFormatPipe,
    LangPipe,
    AttrDisabledDirective,
    CheckboxArrayControlDirective,
    SelectChildrenDirective,
    SelectGroupDirective,
    SelectAllDirective,
    JsonPipe,
  ],
})
export class BaseConfigComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private api: ActivityAPI,
    public appService: AppService,
    public router: Router
  ) {
    const { activityType } = activatedRoute.snapshot.params; // 快照里的params参数
    const { id, code } = activatedRoute.snapshot.params; // 快照里的params参数
    const { tenantId } = activatedRoute.snapshot.queryParams; // 快照里的params参数
    const { activityCode } = activatedRoute.snapshot.queryParams; // 快照里的params参数

    this.id = +id || 0; // 空为新建
    this.code = code || '';
    this.activityType = ActivityTypeEnum[activityType] as any;
    this.activityCode = activityCode || '';
    this.tenantId = +tenantId || 0;
  }

  id = 0;
  code = '';
  activityType: ActivityTypeEnum;
  activityCode = '';
  tenantId = 0;
  selectLang = ['zh-cn']; // PM:默认值CN
  curLang = 'zh-cn';
  repeatCycleList = [
    { name: '单次', value: ActivityCycleEnum.Once, lang: 'common.once' },
    { name: '每次', value: ActivityCycleEnum.EveryTime, lang: 'member.activity.sencli2.everyTime' },
    { name: '每天', value: ActivityCycleEnum.Day, lang: 'member.activity.sencli2.everyDay' },
    { name: '每周', value: ActivityCycleEnum.Week, lang: 'member.activity.sencli2.everyWeek' },
    { name: '每月', value: ActivityCycleEnum.Month, lang: 'member.activity.sencli2.everyMonth' },
  ];

  protected readonly ActivityCycleEnum = ActivityCycleEnum;
  protected readonly weekList = cloneDeep(weekList) /*.sort((a, b) => a.num - b.num)*/;

  formGroup = this.fb.group({
    discountEnable: [true],
    time: [[] as any, Validators.required], // 活动时间
    repeatCycle: [ActivityCycleEnum.Once, Validators.required], // 重复周期
    weekRange: [[] as number[]], // 周 范围
    monthRange: [[] as number[]], // 月 范围
    lang: this.fb.array([this.generateLangItem()]),
    langJudgement: [false], // 语言资格开关 0=停用 1=启用
  });

  monthList = new Array(31).fill(0).map((_, i) => ({ name: i + 1, value: i + 1 }));

  ngOnInit() {
    this.id && this.getDetail();
  }

  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    zip([
      this.api.activityDetailStep1(this.id, this.tenantId),
      this.api.activityDetailStep1Cycle(this.code, this.tenantId).pipe(
        map((e) => {
          if (e.code !== '0000') {
            this.appService.showToastSubject.next({ msg: e.message || 'fail' });
            return null;
          }

          return e;
        })
      ),
    ]).subscribe(([goGamingRes, cycleRes]) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!goGamingRes) return;

      this.tenantId = goGamingRes.tenantId;

      this.formGroup.patchValue({
        time: [
          goGamingRes.startTime ? new Date(goGamingRes.startTime) : null,
          goGamingRes.endTime ? new Date(goGamingRes.endTime) : null,
        ],
        repeatCycle: cycleRes?.data.triggerPeriod || ActivityCycleEnum.Once,
        weekRange: cycleRes?.data.triggerPeriod === ActivityCycleEnum.Week ? cycleRes?.data.periodDays || [] : [],
        monthRange: cycleRes?.data.triggerPeriod === ActivityCycleEnum.Month ? cycleRes?.data.periodDays || [] : [],
        langJudgement: Boolean(cycleRes?.data.langSwitch || 0),
        discountEnable: goGamingRes.isOpenCoupon ?? true,
      });

      if (goGamingRes.infoList?.length) {
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
          ) as any
        );
      }
    });
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

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
      type: this.activityType, // 未知: Unknown = 0   大转盘: Turntable = 1
      isOpenCoupon: !!this.formGroup.value.discountEnable, // 是否开启券码
      startTime: this.formGroup.value.time?.[0]?.getTime() || 0, // 开始时间
      endTime: this.formGroup.value.time?.[1]?.getTime() || 0, // 结束时间
      infoList, // 详情列表
    };

    const triggerPeriod = this.formGroup.value.repeatCycle || ActivityCycleEnum.Once;
    const periodDays = ((triggerPeriod: ActivityCycleEnum) => {
      switch (triggerPeriod) {
        case ActivityCycleEnum.Week:
          return this.formGroup.getRawValue().weekRange || [];
        case ActivityCycleEnum.Month:
          return this.formGroup.getRawValue().monthRange || [];
        default:
          return [];
      }
    })(triggerPeriod);
    const qualificationsSendData: ActivityQualificationsStep1 = {
      tenantId: this.tenantId,
      tmpStartTime: moment(this.formGroup.value.time?.[0]?.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      tmpEndTime: moment(this.formGroup.value.time?.[1]?.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      tmpName: infoList[0]?.name,
      tmpType: ActivityQualificationsTypeEnum[ActivityTypeEnum[this.activityType]],
      triggerPeriod,
      periodDays,
      langConfig: infoList.map((e) => e.languageCode),
      langSwitch: +this.formGroup.getRawValue().langJudgement!,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api[this.id ? 'activityUpdateStep1' : 'activityCreateStep1'](sendData)
      .pipe(
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

          // 大转盘第三步模块的时间更新接口
          const updateTurntableTimeAPI =
            this.activityType === (ActivityTypeEnum[ActivityTypeEnum.Turntable as any] as any)
              ? this.api
                  .turntable_update3Time({
                    merchantId: String(this.tenantId || ''),
                    activityCode: String(step1.activityCode),
                    startTime: this.formGroup.value.time?.[0]?.getTime() || 0, // 开始时间
                    endTime: this.formGroup.value.time?.[1]?.getTime() || 0, // 结束时间
                  })
                  .pipe(
                    filter((e) => {
                      const success = !!e?.success;

                      if (!success) {
                        this.appService.showToastSubject.next(
                          e?.message ? { msg: e?.message } : { msgLang: 'bonus.activity.updateTurnTableTimeFail' }
                        );
                        throw new Error('update turntable time fail');
                      }

                      return success;
                    })
                  )
              : of(null);

          return forkJoin([qualificationAPI, updateTurntableTimeAPI]).pipe(map(() => step1));
        }),
        finalize(() => this.appService.isContentLoadingSubject.next(false))
      )
      .subscribe(({ id, activityCode }) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!(typeof activityCode === 'string' && activityCode.length)) {
          this.appService.toastOpera(false);
          throw new Error('responseData id is null or type is not number');
        }

        this.id = id;
        this.code = activityCode;
        this.jump('qualifications');
      });
  }

  jump(lastPath: string) {
    const prefix = this.router.url.split('/').slice(0, 7).join('/');
    return this.router.navigate([`${prefix}/${lastPath}${this.isReadonly ? '-view' : ''}`, this.id, this.code], {
      queryParamsHandling: 'merge',
      queryParams: {
        tenantId: this.tenantId,
        sTime: this.formGroup.value.time?.[0]?.getTime() || 0,
        eTime: this.formGroup.value.time?.[1]?.getTime() || 0,
      },
    });
  }

  get langArrayForm() {
    return this.formGroup.controls.lang;
  }

  // 更新语言表单
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
      activityId: [data?.activityId || 0],
      activityName: [data?.activityName || '', Validators.required],
      activitySubName: [data?.activitySubName || ''],
      rule: [data?.rule || ''],
      description: [data?.description || ''],
      languageCode: [data?.languageCode || 'zh-cn'],
    });
  }

  /**
   * 是否只读查看
   */
  @Input() isView = false;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }
}
