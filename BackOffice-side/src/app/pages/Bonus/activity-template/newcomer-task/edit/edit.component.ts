import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { newcomerTaskInstance } from 'src/app/pages/Bonus/bonus-routing';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { MultiLangType } from 'src/app/shared/interfaces/article';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';

@Component({
  selector: 'newcomer-task-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormWrapComponent,
    FormsModule,
    NgFor,
    AngularSvgIconModule,
    NgIf,
    LangTabComponent,
    CurrencyIconDirective,
    AsyncPipe,
    LangPipe,
    PrizeConfigPipe,
  ],
})
export class NewcomerTaskEditComponent implements OnInit {
  constructor(
    private modalService: MatModal,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    private destroy$: DestroyService,
    private settingService: ActivityStepService,
    private api: ActivityAPI,
    public lang: LangService,
    private articleApi: ArticleApi
  ) {
    const { id, code } = this.activatedRoute.snapshot.params; // 快照里的params参数
    const { tenantId } = this.activatedRoute.snapshot.queryParams; // 快照里的params参数
    const { sTime, eTime } = this.activatedRoute.snapshot.queryParams; // 快照里的params参数

    this.id = +id || 0;
    this.code = code || '';
    this.tenantId = tenantId;
    this.timeRange = [+sTime || 0, +eTime || 0];

    this.settingService.backList.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate([newcomerTaskInstance.link]);
    });
  }

  /** 是否只读查看 */
  @Input() isView = false;

  id = 0; // 当前第三步的活动id
  code = '';
  tenantId = ''; // 商户ID
  timeRange: any[] = []; // 活动时间区间

  minimumDeposit: any = ''; // 最低存款
  selectDefault: any = ''; // 是否默认

  prizeList: any[] = [];
  prizeFromList: any[] = [
    { name: '存款全场红利A', prizeCode: 'allA' },
    { name: '存款全场红利B', prizeCode: 'allB' },
    { name: '存款全场红利C', prizeCode: 'allC' },
    { name: '存款小游戏红利A', prizeCode: 'gameA' },
    { name: '存款小游戏红利B', prizeCode: 'gameB' },
    { name: '存款小游戏红利C', prizeCode: 'gameC' },
    { name: '存款真人红利A', prizeCode: 'liveA' },
    { name: '存款真人红利B', prizeCode: 'liveB' },
    { name: '存款真人红利C', prizeCode: 'liveC' },
    { name: '存款体育红利A', prizeCode: 'sportsA' },
    { name: '存款体育红利B', prizeCode: 'sportsB' },
    { name: '存款体育红利C', prizeCode: 'sportsC' },
  ];

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  ngOnInit() {
    this.prizeList = Array.from(this.prizeFromList, (item) => {
      return {
        name: item.name,
        isChoose: false,
        number: 1,
        prizeCode: item.prizeCode,
        prizeItems: [{ orderNum: 1, prizeId: null }],
        lang: {
          languageCode: ['zh-cn'],
          data: [{ content: { title: item.name, prizeName: '' }, lanageCode: 'zh-cn', isJsonObject: true }],
        },
      };
    });

    // 回溯
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .newuser_getstepthree({
        tenantId: this.tenantId,
        tmpCode: this.code,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res?.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message });
        this.edit(res?.data);
      });
  }

  edit(data: any) {
    if (!data) return;

    // 最低存款
    this.minimumDeposit = data?.minimumDeposit;

    // 回溯数据
    const editList: any[] = data?.prizeItems || [];

    const langParams = {
      source: MultiLangType.OA,
      tenantId: this.tenantId,
      keys: this.prizeFromList.map((v) => v.prizeCode + '_' + this.id),
    };
    const prizeParams = {
      merchantId: this.tenantId,
      lang: this.lang.isLocal ? 'zh-cn' : 'en-us',
      pageIndex: 1,
      pageSize: 999,
    };

    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.prize_getprizes(prizeParams), this.articleApi.getCustomListByKeys(langParams)).subscribe(
      ([prizeData, langData]) => {
        this.appService.isContentLoadingSubject.next(false);

        const prizeList: any[] = prizeData?.data?.prizes || [];
        let langList: any[] = langData || [];

        // 匹配奖品信息
        prizeList.forEach((a: any) => {
          editList.forEach((b: any, i) => {
            b.prizeItems.forEach((c: any, j) => {
              if (+c.prizeId === a.id) editList[i].prizeItems[j] = { ...c, ...a };
            });
          });
        });

        // 匹配默认选项及标题
        editList.forEach((a: any, i) => {
          if (a.isDefault) this.selectDefault = a.prizeCode;
          this.prizeFromList.forEach((b: any) => {
            if (a.prizeCode === b.prizeCode) editList[i].name = b.name;
          });
        });

        // 匹配多语系
        if (!langList.length) {
          langList = Array.from(this.prizeFromList, (item) => {
            return {
              prizeCode: item.prizeCode,
              languageCode: ['zh-cn'],
              data: [{ content: { title: item.name, prizeName: '' }, lanageCode: 'zh-cn', isJsonObject: true }],
            };
          });
          editList.forEach((a, i) => {
            langList.forEach((b) => {
              if (a.prizeCode === b.prizeCode) editList[i].lang = { languageCode: b.languageCode, data: b.data };
            });
          });
        } else {
          editList.forEach((a, i) => {
            langList.forEach((b) => {
              if (a.prizeCode === b.key.split('_')[0])
                editList[i].lang = { languageCode: b.infos.map((c) => c.lanageCode), data: b.infos };
            });
          });
        }

        // 赋值
        this.prizeList = editList;
      }
    );
  }

  // 奖品次数
  onPrizeTimesEdit(type: any, i: any) {
    if (type === 'add') {
      if (this.prizeList[i].number === 3) return;
      ++this.prizeList[i].number;
      this.prizeList[i].prizeItems.push({ orderNum: this.prizeList[i].number, prizeId: null });
    }
    if (type === 'cut') {
      if (this.prizeList[i].number === 1) return;
      --this.prizeList[i].number;
      this.prizeList[i].prizeItems = this.prizeList[i].prizeItems.slice(0, -1);
    }
  }

  onPrizeEdit(itemsIndex: any, idnex: any) {
    const modal = this.modalService.open(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });
    modal.result
      .then((v) => {
        this.prizeList[itemsIndex].prizeItems[idnex] = {
          ...this.prizeList[itemsIndex].prizeItems[idnex],
          ...v,
          prizeId: v.id,
        };
      })
      .catch(() => {});
  }

  // 更新语系
  updateLanguage(e, prod) {
    prod.lang.data = e.map((lanageCode) => ({
      lanageCode,
      isJsonObject: true,
      content: { title: '', prizeName: '' },
      ...prod.lang.data.find((e) => e.lanageCode === lanageCode), // 把之前的值保留下来
    }));
  }

  onSubmit() {
    if (!this.minimumDeposit)
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli3.isMinimumDeposit' });

    let verifyFlag = false;
    this.prizeList
      .filter((a) => a.isChoose)
      .forEach((b) => {
        if (b.prizeItems.some((c) => c.prizeId === null)) {
          verifyFlag = true;
          this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli3.isSelectPrize' });
        }
        if (b.lang.data.some((d) => d.content.title === '' || d.content.prizeName === '')) {
          verifyFlag = true;
          this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli3.isFillName' });
        }
      });

    if (verifyFlag) return;

    const params: any = {
      minimumDeposit: this.minimumDeposit,
      tenantId: this.tenantId,
      tmpCode: this.code,
      prizeItems: [],
    };
    params.prizeItems = this.prizeList.map((v) => ({
      isChoose: v.isChoose,
      isDefault: v.isChoose && v.prizeCode === this.selectDefault ? true : false,
      number: v.number,
      prizeCode: v.prizeCode,
      prizeItems: v.prizeItems.map((j) => ({
        orderNum: j.orderNum,
        prizeId: j.prizeId,
      })),
    }));

    this.appService.isContentLoadingSubject.next(true);
    this.api.newuser_stepthree(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message });
      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });

      this.updateLang();
    });
  }

  updateLang() {
    const parmas = {
      source: MultiLangType.OA,
      tenantId: this.tenantId,
      list: this.prizeList.map((v) => ({ key: v.prizeCode + '_' + this.id, infos: v.lang.data })),
    };
    this.appService.isContentLoadingSubject.next(true);
    this.articleApi.addOrUpdateCustom(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res === true) this.router.navigate([newcomerTaskInstance.link]);
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'member.activity.sencli3.i18nSaveSus' : 'member.activity.sencli3.i18nSaveFail',
        successed: res,
      });
    });
  }

  getPrizeSatus(status: any) {
    const list: any = new Map([
      [1, 'member.coupon.pendingReview'],
      [3, 'member.coupon.beenRemoved'],
      [4, 'member.coupon.pendingReview'],
    ]);
    return list.get(status) || '-';
  }

  onBack() {
    this.jump('qualifications');
  }

  jump(lastPath: string) {
    return this.router.navigate(
      [`${newcomerTaskInstance.stepPath}/${lastPath}${this.isReadonly ? '-view' : ''}`, this.id, this.code],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          sTime: this.timeRange[0] || 0,
          eTime: this.timeRange[1] || 0,
        },
      }
    );
  }
}

@Component({
  selector: 'newcomer-task-edit-view',
  standalone: true,
  imports: [NewcomerTaskEditComponent],
  template: '<newcomer-task-edit [isView]="true"></newcomer-task-edit>',
})
export class NewcomerTaskEditViewComponent {}
