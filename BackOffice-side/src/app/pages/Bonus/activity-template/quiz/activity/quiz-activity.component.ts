import { ChangeDetectorRef, Component, Input, OnInit, forwardRef } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AddPopupComponent } from '../../add-popup/add-popup.component';
import { QuizActivityApi } from 'src/app/shared/api/quiz-activity.api';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { DefaultDirective } from 'src/app/shared/components/upload/default.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgIf, NgFor } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'quiz-activity-view',
  template: '<quiz-activity [isView]="true"></quiz-activity>',
  standalone: true,
  imports: [forwardRef(() => QuizActivityComponent)],
})
export class QuizActivityViewComponent {}

@Component({
  selector: 'quiz-activity',
  templateUrl: './quiz-activity.component.html',
  styleUrls: ['./quiz-activity.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    NgIf,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    FormWrapComponent,
    NgFor,
    InputNumberDirective,
    CurrencyIconDirective,
    AngularSvgIconModule,
    LangTabComponent,
    UploadComponent,
    DefaultDirective,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class QuizActivityComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modalService: MatModal,
    private api: QuizActivityApi,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private appService: AppService,
    public lang: LangService,
    private cdr: ChangeDetectorRef,
    public subHeaderService: SubHeaderService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  /** 币种基准 */
  baseCurrency = 'USDT';

  /** 编辑时的id */
  id = 0;

  /** 编辑时活动的id */
  activeId = 0;

  /** 标题id */
  activityNameId = 0;
  formGroup = this.fb.group({
    activeTitle: ['', Validators.required],
    code: ['', Validators.required],
  });

  data: any = {};

  selectLang = ['zh-cn']; // PM:默认值CN

  screenList: any = [];

  code: any = '';
  time: Date[] = []; // 活动时间
  settleTime: any = ''; // 完赛时间

  /** 竞赛内容 */
  contestContent: any = {
    correct_Score: true, // 正确比分
    win_Loss: true, // 独赢
    over_Under: true,
    text: 2.5,
  };

  isRisk = false; // 是否风控

  uploadImg: any = ''; //上传图片

  // 奖励类型
  cycle: any = '1';
  cycleList: any[] = [
    { name: '正确比分', value: 5, lang: 'member.activity.sencli6.correctScore' },
    { name: '独赢', value: 2, lang: 'member.activity.sencli6.winAlone' },
    { name: '进球大小盘', value: 1, lang: 'member.activity.sencli6.goalOver' },
  ];

  // 最大比分之和
  maxTotalScore: string | number = '';
  // 最大单边比分
  maxScore: string | number = '';

  // 波胆大奖
  bold = {
    id: 0,
    ranking_Max: 0,
    ranking_Min: 0,
    currency: 1003,
    bonus: 0,
  };

  rankContentList: any[] = [
    {
      ranking_Max: 1,
      ranking_Min: 1,
      currency: 1003,
      bonus: 500,
      id: 0,
    },
    {
      ranking_Max: 2,
      ranking_Min: 2,
      currency: 1003,
      bonus: 250,
      id: 0,
    },
    {
      ranking_Max: 3,
      ranking_Min: 3,
      currency: 1003,
      bonus: 150,
      id: 0,
    },
    {
      ranking_Max: 4,
      ranking_Min: 4,
      currency: 1003,
      bonus: 75,
      id: 0,
    },
    {
      ranking_Max: 5,
      ranking_Min: 5,
      currency: 1003,
      bonus: 25,
      id: 0,
    },
  ];

  /**
   * 是否只读查看
   */
  @Input() isView = false;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  /** 获取名次数组的长是否超过5 */
  get rankContentListLength() {
    return this.rankContentList.length < 5;
  }

  ngOnInit() {
    // 判断是否为编辑
    if (this.id) {
      this.initData();
    } else {
      this.screenList = Array.from(Array(8), () => {
        return {
          home: {
            languageCode: ['zh-cn'],
            icon: '',
            data: [{ name: '', icon: '', lang: 'zh-cn' }],
          },
          away: { languageCode: ['zh-cn'], icon: '', data: [{ name: '', icon: '', lang: 'zh-cn' }] },
        };
      });
    }
  }

  /** 编辑初始化数据 */
  initData() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.predictionEdit(this.id).subscribe((res) => {
      if (res?.success) {
        this.appService.isContentLoadingSubject.next(false);
        const data = res?.data || {};
        this.activeId = data?.id || '';
        this.activityNameId = data?.activityNames?.[0]?.id;
        this.formGroup.patchValue({ activeTitle: data?.activityNames?.[0]?.activity_Name || '' });
        this.formGroup.patchValue({ code: data?.activity_Code || '' });
        this.time = [new Date(data?.start_Time), new Date(data?.end_Time)];
        this.settleTime = data.settle_Time ? new Date(data.settle_Time) : '';
        this.contestContent.correct_Score = data?.correct_Score || ''; // 正确比分
        this.contestContent.win_Loss = data?.win_Loss || ''; // 独赢
        this.contestContent.over_Under = data?.over_Under || ''; // 大小盘
        this.contestContent.text = data?.sbv || ''; // 大小盘输入框
        this.cycleList[0].value = data?.correct_Score_Points || ''; // 正确比分积分
        this.cycleList[1].value = data?.win_Loss_Points || ''; // 独赢积分
        this.cycleList[2].value = data?.over_Under_Points || ''; // 大小盘积分
        // bonus_Type: 0, //奖金类型，0:现金券，1:抵用金 默认现金劵，先不做抵用金
        this.uploadImg = data?.picture || ''; // 上传图片
        this.isRisk = data?.is_Risk || false; //是否风控
        this.maxScore = data?.maxScore || ''; // 单边最大比分
        this.maxTotalScore = data?.maxTotalScore || ''; // 最大比分之和
        this.data = data;

        // 竞赛奖金
        this.splitBonusSetting(data?.bonusSettings || []);
        this.screenList = this.setLangCode(data?.matchCombinationSettings || []);
      }
    });
  }

  async onSubmit() {
    // 活动标题与活动代码为必填
    if (!this.formGroup.value.activeTitle || !this.formGroup.value.code) {
      return this.appService.showToastSubject.next({
        msgLang: 'member.activity.sencli6.activityRequired', // 模板更新成功
      });
    }

    // 参赛时间和完赛时间未填或未填完整
    if (this.time?.length != 2 || !this.settleTime) {
      return this.appService.showToastSubject.next({
        msgLang: 'member.activity.sencli6.settlementPeriod',
      });
    }

    // 参赛时间大于完赛时间
    const settleTime: any = this.settleTime.getTime();
    const endTime: any = this.time[1].getTime();
    if (settleTime < endTime) {
      return this.appService.showToastSubject.next({
        msgLang: 'member.activity.sencli6.timeLongerThan',
      });
    }

    // 每一场的主队客队中文名都必须输入
    for (const value of this.screenList) {
      if (!value.home.data[0].name || !value.away.data[0].name) {
        return this.appService.showToastSubject.next({
          msgLang: 'member.activity.sencli6.enteredChinese',
        });
      }
    }

    // 设置参数
    const matchPrediction = this.getParams();
    const updateFail = await this.lang.getOne('member.activity.sencliCommon.updateFail'); // 模板更新失败
    const createFail = await this.lang.getOne('member.activity.sencliCommon.createFail'); // 模板创建失败

    this.appService.isContentLoadingSubject.next(true);
    if (this.id) {
      // 编辑
      this.api.competitionPut({ matchPrediction }).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res.success) {
          this.appService.showToastSubject.next({
            msgLang: 'member.activity.sencliCommon.updateSuccess', // 模板更新成功
            successed: true,
          });
          this.back();
        } else {
          this.appService.showToastSubject.next({
            msg: res.message ? res.message : updateFail, // 模板更新失败
          });
        }
      });
      // 编辑
    } else {
      // 新增
      this.api.competitionCreate({ matchPrediction }).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res.success) {
          this.appService.showToastSubject.next({
            msgLang: 'member.activity.sencliCommon.createSuccess', // 模板创建成功
            successed: true,
          });
          this.back();
        } else {
          this.appService.showToastSubject.next({
            msg: res.message ? res.message : createFail, // 模板创建失败
          });
        }
      });
    }
  }

  openAddPopup(type: any) {
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = [];
    modalRef.result.then(() => {}).catch(() => {});
  }

  addRank() {
    this.rankContentList.push({ ranking_Max: 0, ranking_Min: 0, currency: 1003, bonus: 0, id: 0 });
  }

  /** 删除名次 */
  deleteRank(i) {
    this.rankContentList.splice(i, 1);
  }

  /** 删除场次 */
  deleteScreenList(i) {
    this.screenList.splice(i, 1);
  }

  /** 新增场次 */
  addList() {
    this.screenList.push({
      id: 0,
      home: {
        languageCode: ['zh-cn'],
        icon: '',
        data: [{ name: '', icon: '', lang: 'zh-cn' }],
      },
      away: { languageCode: ['zh-cn'], icon: '', data: [{ name: '', icon: '', lang: 'zh-cn' }] },
    });
  }

  // 更新竞猜活动赛事表单左
  updateLanguageLeft(e, prod) {
    prod.home.data = e.map((lang) => ({
      lang,
      name: '',
      icon: '',
      ...prod.home.data.find((e) => e.lang === lang), // 把之前的值保留下来
    }));
  }

  // 更新竞猜活动赛事表单右
  updateLanguageRight(e, prod) {
    prod.away.data = e.map((lang) => ({
      lang,
      name: '',
      icon: '',

      ...prod.away.data.find((e) => e.lang === lang), // 把之前的值保留下来
    }));
  }

  /**去除languageCode + icon赋值*/
  deleteLangCode(langArray) {
    let lang = cloneDeep(langArray);
    lang.forEach((a) => {
      a?.home?.data.forEach((b) => {
        b.icon = a?.home?.icon || '';
      });
      a?.away?.data.forEach((b) => {
        b.icon = a?.away?.icon || '';
      });
    });

    return lang?.map((value) => ({
      id: value.id ? value.id : 0,
      home: value.home.data,
      away: value.away.data,
    }));
  }

  /**组合languageCode*/
  setLangCode(langArray) {
    return langArray?.map((value) => ({
      id: value.id,
      home: {
        languageCode: value.home.map((e) => e.lang),
        icon: value.home?.find((v) => v?.icon)?.icon || '',
        data: value.home,
      },
      away: {
        languageCode: value.away.map((e) => e.lang),
        icon: value.away?.find((v) => v?.icon)?.icon || '',
        data: value.away,
      },
    }));
  }

  /** 设置参数 */
  getParams() {
    return {
      tenantId: this.subHeaderService.merchantCurrentId,
      Id: this.activeId,
      Activity_Code: this.formGroup.value.code,
      start_Time: this.time[0]?.getTime(),
      end_Time: this.time[1]?.getTime(),
      settle_Time: this.settleTime.getTime(),
      correct_Score: this.contestContent.correct_Score, //正确比分
      win_Loss: this.contestContent.win_Loss, //独赢
      over_Under: this.contestContent.over_Under, //大小盘
      sbv: this.contestContent.text, //大小盘输入框
      correct_Score_Points: this.cycleList[0].value, //正确比分积分
      win_Loss_Points: this.cycleList[1].value, //独赢积分
      over_Under_Points: this.cycleList[2].value, //大小盘积分
      bonus_Type: 0, //奖金类型，0:现金券，1:抵用金 默认现金劵，先不做抵用金
      picture: this.uploadImg, //上传图片
      is_Risk: this.isRisk, //是否风控
      maxTotalScore: this.maxTotalScore || null, // 最大比分
      maxScore: this.maxScore || null, // 单边最大比分
      // 活动标题默认中文
      activityNames: [
        {
          id: this.activityNameId,
          activity_Name: this.formGroup.value.activeTitle,
          lang: 'zh-cn',
        },
      ],
      // 竞赛奖金
      bonusSettings: [this.bold, ...this.rankContentList],
      matchCombinationSettings: this.deleteLangCode(this.screenList),
    };
  }

  /**拆分大奖数组 */
  splitBonusSetting(data) {
    if (!data?.length) {
      return;
    }

    const list: any = [];
    for (const value of data) {
      // 同时为0的情况为波胆大奖
      if (!value.ranking_Max && !value.ranking_Max) {
        this.bold = value;
      } else {
        list.push(value);
      }
    }

    this.rankContentList = list;
  }

  back() {
    this.router.navigate(['/bonus/activity-manage/quiz']);
  }

  /**排名名次发生变化 */
  rankValueChange(newValue, i, flag = false) {
    this.cdr.detectChanges();
    if (newValue > 10) {
      flag ? (this.rankContentList[i].ranking_Min = 10) : (this.rankContentList[i].ranking_Max = 10);
    }
  }
}
