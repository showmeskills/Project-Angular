import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusActivityApi } from 'src/app/shared/api/bonus-activity.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { BonusService } from '../../bonus.service';
import { AddPopupComponent } from '../add-popup/add-popup.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { cloneDeep } from 'lodash';
import { GameApi } from 'src/app/shared/api/game.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconCountryComponent, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgIf, NgFor } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    NgIf,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgFor,
    IconCountryComponent,
    AngularSvgIconModule,
    CurrencyIconDirective,
    SelectChildrenDirective,
    SelectGroupDirective,
    FormWrapComponent,
    LangPipe,
  ],
})
export class CompetitionComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modalService: MatModal,
    private appService: AppService,
    private api: BonusActivityApi,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bonusService: BonusService,
    private selectApi: SelectApi,
    public lang: LangService,
    private breadcrumbsService: BreadcrumbsService,
    private gameApi: GameApi
  ) {}

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  selectLang = ['zh-cn']; // PM:默认值CN
  isLoading = false;

  tenantId: any;
  type: any;
  id: any;

  time: any[] = []; // 活动时间

  limit: any = 0;
  limitList: any[] = [
    { name: '全场', value: 0 },
    { name: '指定厂商', value: 1 },
    // { name: '指定游戏', value: 2 },
  ];

  providerList: any[] = []; // 游戏厂商列表
  gameProviderList: any[] = []; // 指定游戏 - 游戏厂商列表
  gameCode: any = '';

  cycle: any = 2;
  cycleList: any[] = [
    { name: '日', value: 0 },
    { name: '周', value: 1 },
    { name: '月', value: 2 },
    // { name: '单次', value: 4 },
  ];

  content: any = 0;
  contentList: any[] = [
    { name: '有效流水', value: 0 },
    { name: '大赢家', value: 1 },
    { name: '运气最好', value: 2 },
    // { name: '积分规则', value: 3 },
  ];

  win: any = 11;
  bigWinlist: any[] = [
    { name: '总输赢', value: 10 },
    { name: '单笔最大盈利', value: 11 },
  ];

  rankContentList: any[] = [
    { rankNumStart: 1, rankNumEnd: 3, rankBonus: [{ currency: 'USDT', money: 50 }] },
    { rankNumStart: 4, rankNumEnd: 6, rankBonus: [{ currency: 'USDT', money: 50 }] },
    { rankNumStart: 7, rankNumEnd: 9, rankBonus: [{ currency: 'USDT', money: 50 }] },
  ];

  countryList: any[] = [];
  currencyList: any[] = [];
  selectCountryList: any[] = [];
  selectCurrencyList: any[] = [];

  gameList: any[] = [];

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  ngOnInit() {
    this.loadForm();

    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.tenantId = v?.tenantId;
      this.type = v?.type || 'add';

      this.breadcrumbsService.setBefore([
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        {
          name: '活动列表',
          lang: 'breadCrumb.eventsList',
          click: () =>
            this.router.navigate(['/bonus/activity-manage/activity-list'], {
              queryParams: { activityId: 9, tenantId: v?.tenantId },
            }),
        },
      ]);
    });

    this.loading(true);
    zip(
      this.selectApi.getCountry(),
      this.selectApi.getCurrencySelect(),
      this.selectApi.getCategorySelect(this.tenantId, ['Online', 'Maintenance'])
    ).subscribe(([countryList, currencyList, provider]) => {
      this.loading(false);
      this.countryList = countryList || [];
      this.currencyList = currencyList || [];
      this.providerList = cloneDeep(provider) || [];
      this.gameProviderList = cloneDeep(provider).filter((v) => ['SlotGame', 'LiveCasino'].includes(v.code));
      if (this.type === 'edit') this.edit();
    });
  }

  edit() {
    const data: any = this.bonusService.activityInfo.value;
    if (data) {
      this.formGroup.setControl(
        'lang',
        this.fb.array([
          this.fb.group({
            name: [data?.tmpName, Validators.required],
            languageCode: ['zh-cn'],
          }),
        ])
      );
      this.formGroup.patchValue({ code: data?.tmpCode });
      this.id = data?.id;
      this.time = [new Date(data?.tmpStartTime), new Date(data?.tmpEndTime)];
      this.selectCurrencyList = [...(data?.currency || [])];
      this.cycle = data?.period;
      this.rankContentList = [...(data?.rankNum || [])];
      this.selectCountryList = [...this.countryList.map((v) => v.countries)]
        .flat(Infinity)
        .filter((item) => data?.country.indexOf(item.countryIso3) > -1);
      // 竞赛内容
      if ([...this.bigWinlist.map((v) => v.value)].includes(data?.executeType)) {
        this.content = 1;
        this.win = data?.executeType;
      } else {
        this.content = data?.executeType;
      }
      // 竞赛范围
      this.limit = data?.gameTypeNumber;
      if (data?.gameTypeNumber !== 0) {
        const list: any = this.limit === 1 ? [...this.providerList] : [...this.gameProviderList];
        list.forEach((a) => {
          data?.gameTypeLimit?.categorys.forEach((b) => {
            if (a.code === b.code) {
              a.providers.forEach((c) => {
                b.providers.forEach((d) => {
                  if (c.providerCatId === d.newId) c.checked = true;
                });
              });
            }
          });
        });
        if (data?.gameTypeNumber === 2) this.gameCode = data?.gameTypeLimit?.gameCodes.join(';');
      }
    }
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          name: ['', Validators.required],
          languageCode: ['zh-cn'],
        }),
      ]),
      code: ['', Validators.required],
    });

    this.validator = new FormValidator(this.formGroup);
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        name: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        name: [value.name, Validators.required],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  getGameImg() {
    this.gameList = [];
    this.loading(true);
    this.gameApi.getQueryGame({ query: this.gameCode }).subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) {
        this.gameList = res || [];
      }
    });
  }

  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    if (!this.time.length)
      return this.appService.showToastSubject.next({
        msgLang: 'member.activity.sencli9.timeWaring',
        successed: false,
      });

    const params: any = {
      tenantId: this.tenantId,
      tmpName: this.formGroup.value.lang[0]?.name,
      tmpStartTime: moment(+this.time[0]).format('YYYY-MM-DD') + ' 00:00:00',
      tmpEndTime: moment(+this.time[1]).format('YYYY-MM-DD') + ' 23:59:59',
      tmpCode: this.formGroup.value.code,
      country: [...this.selectCountryList.map((v) => v.countryIso3)],
      currency: [...this.selectCurrencyList],
      executeType: this.content === 1 ? this.win : this.content,
      gameTypeNumber: this.limit,
      gameTypeLimit: {},
      period: this.cycle,
      // ...(this.cycle === 4
      //   ? {
      //       periodStart: moment(+this.time[0], false).format('YYYY-MM-DD HH:mm:ss').slice(0, -2) + '00',
      //       periodEnd: moment(+this.time[1], true).format('YYYY-MM-DD HH:mm:ss').slice(0, -2) + '59',
      //     }
      //   : {}),
      rankNum: [...this.rankContentList],
      ...(this.id
        ? {
            id: this.id,
          }
        : {}),
    };

    // 竞赛范围
    if (this.limit !== 0) {
      let categorys: any;
      const list: any = this.limit === 1 ? [...this.providerList] : [...this.gameProviderList];
      categorys = list.map((a) => ({
        code: a.code,
        providers: a.providers
          .filter((b) => b.checked)
          .map((c) => ({ providerId: c.providerId, newId: c.providerCatId })),
      }));
      params.gameTypeLimit['categorys'] = categorys.filter((v) => v.providers.length > 0);
      if (this.limit === 2) params.gameTypeLimit['gameCodes'] = this.gameCode.split(';').filter((v) => v);
    }

    // 模板 创建成功/更新成功
    const success = await this.lang.getOne(
      this.type === 'add' ? 'member.activity.sencliCommon.createSuccess' : 'member.activity.sencliCommon.updateSuccess'
    );
    // 模板 创建失败/更新失败
    const fail = await this.lang.getOne(
      this.type === 'add' ? 'member.activity.sencliCommon.createFail' : 'member.activity.sencliCommon.updateFail'
    );

    this.loading(true);
    this.api[this.type === 'add' ? 'competitionCreate' : 'competitionUpdate'](params).subscribe((res) => {
      this.loading(false);

      this.appService.showToastSubject.next({
        msg: res?.code === '0000' ? success : res?.message || fail,
        successed: res?.code === '0000',
      });
      if (res.code === '0000') this.back();
    });
  }

  back() {
    this.router.navigate(['/bonus/activity-manage/activity-list'], {
      queryParams: { activityId: 9, tenantId: this.tenantId },
    });
  }

  openAddPopup(type: any) {
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = type === 'area' ? this.countryList : this.currencyList;
    modalRef.componentInstance['selectedList'] = type === 'area' ? this.selectCountryList : this.selectCurrencyList;
    modalRef.componentInstance.confirm.subscribe((selCountryList) =>
      type === 'area' ? (this.selectCountryList = selCountryList) : (this.selectCurrencyList = selCountryList)
    );
    modalRef.result.then(() => {}).catch(() => {});
  }

  addRank() {
    this.rankContentList.push({ rankNumStart: 0, rankNumEnd: 0, rankBonus: [{ currency: 'USDT', money: 0 }] });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
