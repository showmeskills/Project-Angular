import { VipApi } from 'src/app/shared/api/vip.api';
import { Component, OnInit } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { CurLangService } from 'src/app/shared/components/lang/lang.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { forkJoin, of, switchMap, zip, finalize } from 'rxjs';
import { catchError, combineLatestWith, takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { cloneDeep } from 'lodash';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { RecommendFriendsDetailPopupComponent } from './detail-popup/detail-popup.component';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { AllianceApi } from 'src/app/shared/api/alliance.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { MatTabsModule } from '@angular/material/tabs';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';

@Component({
  selector: 'app-recommend-friends',
  templateUrl: './recommend-friends.component.html',
  styleUrls: ['./recommend-friends.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    NgbTooltip,
    FormsModule,
    NgFor,
    LoadingDirective,
    NgIf,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    EmptyComponent,
    PaginatorComponent,
    LangTabComponent,
    MatTabsModule,
    UploadComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    VipNamePipe,
  ],
})
export class RecommendFriendsComponent implements OnInit {
  constructor(
    public curLangService: CurLangService,
    private api: AgentApi,
    private subHeader: SubHeaderService,
    public appService: AppService,
    private drawer: DrawerService,
    private destroy$: DestroyService,
    private allianceApi: AllianceApi,
    private vipApi: VipApi
  ) {}

  paginator: PaginatorState = new PaginatorState(); // 分页

  /** 顶部全局时间 */
  headerTime: number[] = [];

  /** 常规返佣 - 模式配置 */
  capFlag = false; // CAP奖励
  topFlag = false; // 顶级推荐人
  modelType = '-'; // 模式 A/B

  // 奖品发放
  rewardDbtList: any[] = [
    {
      name: '常规返佣',
      value: 'regularRebate',
      lang: 'marketing.recommendFriends.regularRebate',
      icon: './assets/images/svg/proxy/recommend-friends-1.svg',
    },
    {
      name: '顶级推荐人',
      value: 'topReferrer',
      lang: 'marketing.recommendFriends.topReferrer',
      icon: './assets/images/svg/proxy/recommend-friends-2.svg',
    },
    {
      name: 'CPA奖励',
      value: 'cpaRewards',
      lang: 'marketing.recommendFriends.cpaRewards',
      icon: './assets/images/svg/proxy/recommend-friends-3.svg',
    },
  ];

  curTab = 0; // 首存0/注册1
  depositRegisterList: any[] = [];
  depositRegisterLoading = true;

  /** 分享图配置 */
  curLang = 'zh-cn';
  selectLang: string[] = ['zh-cn']; // PM:默认值CN
  curPlat = 0; // plat当前选中的索引值
  plat: any[] = ['PC', 'H5', 'APP'];
  proportionList: any[] = ['9:16', '1:1', '16:9']; // 商户1/2 - 默认
  shareList: any = []; // // 商户1/2 - 默认分享图配置内容

  // 商户5 - 默认
  // defaultEmptyList: any[] = [
  //   { metaKey: '9:16', value: '' },
  //   { metaKey: '1:1', value: '' },
  //   { metaKey: '16:9', value: '' },
  // ];

  // defaultList: any[] = cloneDeep(this.defaultEmptyList);
  // otherList: any[] = []; // 商户5 - 其他

  // 商户5 - 当前语言下的上传地址
  uploadZipUrl = '';

  /** 红利设定 - 选项 */
  bonusType: any = 1;
  bonusTypeList: any[] = [
    { name: '顶级推荐人设定', lang: 'marketing.recommendFriends.topReferrer', value: 1 },
    { name: 'CPA奖励设定', lang: 'marketing.recommendFriends.cpaRewards', value: 2 },
  ];

  /** CAP奖励设定 - 列表数据 */
  isEdit = false; // 是否修改

  /** 顶级推荐推人设定 - 列表数据 */
  recommenderList: any[] = [];
  recommenderEditList: any[] = [];

  /** CAP奖励设定 - 列表数据 */
  capList: any[] = [];
  capEditList: any[] = [];

  /** CAP奖励设定 -VIP列表数据 */
  // vipList: any = [];
  vipLevelList: any[] = [];

  /** 分享图配置 - 当前选择的平台 */
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

  /** 是否商户5 - SIT：28; PROD: 20 */
  get isFiveMerchant() {
    return ['20', '28'].includes(this.subHeader.merchantCurrentId);
  }

  ngOnInit() {
    this.subHeader.merchantId$
      .pipe(
        switchMap(() =>
          this.merchantChangeLoadData$().pipe(
            combineLatestWith(this.subHeader.timeCurrent$.pipe(switchMap(() => this.timeChangeLoadData$())))
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // 区分商户，获取VIPA/VIPC 等级配置列表
        this.getVipLevelConfigList();
      });
  }

  // 商户请求流
  merchantChangeLoadData$() {
    return forkJoin([
      // 分享图配置（商户1/旧）
      this.getShareLang(),
      // 常规返佣 - 模式配置
      this.gettenantactivitysettings(),
      // CPA奖励设定
      this.getviplevelsettings(),
      // 顶级推荐人设定
      this.getRecommendReward(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  // 商户/时间 请求流
  timeChangeLoadData$() {
    this.paginator.pageSize = 8;
    // 时间初始化
    this.headerTime = this.subHeader.curTime.length ? [this.subHeader.curTime[0], this.subHeader.curTime[1]] : [];

    return forkJoin([
      // 最新首存/注册
      this.getDepositRegisterData(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  /** 区分商户，获取VIPA/VIPC 等级配置列表 */
  getVipLevelConfigList() {
    this.appService.isContentLoadingSubject.next(true);
    this.vipApi.vip_manage_level_simple_list(this.subHeader.merchantCurrentId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (Array.isArray(res?.data)) {
        this.vipLevelList = res?.data.map((v) => ({
          vipLevel: v?.vipLevel,
          totalPoints: v?.upgradePoints,
        }));
      }
    });
  }

  /** 获取常规返佣 - 模式配置 */
  gettenantactivitysettings() {
    return this.allianceApi.gettenantactivitysettings({ tenantId: this.subHeader.merchantCurrentId }).pipe(
      tap((res) => {
        this.capFlag = res?.data?.referralType === 1 ? true : false;
        this.topFlag = res?.data?.referralType === 2 ? true : false;

        const model = res?.data?.commissionType;
        if (model === 1) {
          this.modelType = 'B';
        } else if (model === 2) {
          this.modelType = 'A';
        }
      })
    );
  }

  /** 打开 详情弹窗 */
  openDetailPopup(type: any) {
    const modal = this.drawer.open(RecommendFriendsDetailPopupComponent, { width: '60%', maxWidth: '800px' });
    modal.componentInstance['type'] = type;
    modal.componentInstance['tenantId'] = this.subHeader.merchantCurrentId;
    modal.componentInstance['curTime'] = this.subHeader.curTime;
    modal.componentInstance['countryCurrentCode'] = this.subHeader.countryCurrentCode;
    modal.result.then(() => {}).catch(() => {});
  }

  /** 切换 最新首存/注册 */
  onChangeTab(tab: number) {
    this.curTab = tab;
    this.paginator.page = 1;
    this.depositRegisterList = [];
    this.getDepositRegisterData().subscribe();
  }

  /** 获取 最新首存/注册 */
  getDepositRegisterData() {
    const parmas = {
      tenantId: this.subHeader.merchantCurrentId,
      beginTime: this.headerTime[0],
      endTime: this.headerTime[1],
      ...(!this.isFiveMerchant
        ? {
            current: this.paginator.page,
            size: this.paginator.pageSize,
          }
        : {
            Page: this.paginator.page,
            PageSize: this.paginator.pageSize,
          }),
    };
    this.depositRegisterLoading = true;
    return this[!this.isFiveMerchant ? 'api' : 'allianceApi']
      [this.curTab === 0 ? 'getftdlistpage' : 'getregisterpage'](parmas)
      .pipe(
        tap((res) => {
          this.depositRegisterList = (!this.isFiveMerchant ? res?.data?.records : res?.list) || [];
          this.paginator.total = (!this.isFiveMerchant ? res?.data?.total : res?.total) || 0;
        }),
        finalize(() => (this.depositRegisterLoading = false))
      );
  }

  /** 分享图配置 - 新增其他 */
  // addShareOtherUplaod() {
  //   this.otherList.push({ metaKey: 'other-' + Date.now(), value: '' });
  // }

  /** 分享图配置 - 获取多语系 */
  getShareLang() {
    // 根据不同商户获取多语系前，将进行语系重置默认中文
    this.selectLang = ['zh-cn'];

    const parmas = {
      tenantId: +this.subHeader.merchantCurrentId,
      affiliateType: 2,
    };
    return (
      !this.isFiveMerchant ? this.api.config_language_query(parmas) : this.allianceApi.config_language_query(parmas)
    ).pipe(
      tap((res) => {
        if (Array.isArray(res?.data)) {
          this.selectLang = res.data;
          this.getShare();
        }
      })
    );
  }

  /** 分享图配置 - 获取内容 */
  getShare(language = 'zh-cn', deviceType = 'pc') {
    const parmas = {
      affiliateType: 2, // 1:联盟计划 2:推荐好友
      type: 3, // 1-佣金任务 2-佣金配置 3-分享页
      language,
      deviceType, // pc h5 app
    };

    // 商户1/2
    if (!this.isFiveMerchant) {
      this.appService.isContentLoadingSubject.next(true);
      zip(
        this.proportionList.map((proportion) =>
          this.api.config_share_query({
            ...parmas,
            proportion, // 比列
            merchant: this.subHeader.merchantCurrentId,
          })
        )
      ).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.shareList = res.map((e) => e?.data || '');
      });
      return;
    }

    // 商户5
    this.uploadZipUrl = '';
    const uploadQueryParmas = {
      tenantId: this.subHeader.merchantCurrentId,
      affiliateType: 2, // 1:联盟计划 2:推荐好友
      type: 3, // 1-佣金任务 2-佣金配置 3-分享页
      language,
      shareType: 'zip',
    };
    this.allianceApi.config_share_query(uploadQueryParmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.uploadZipUrl = res?.data || '';
    });

    // this.defaultList = cloneDeep(this.defaultEmptyList); // 重置商户5默认图片
    // this.appService.isContentLoadingSubject.next(true);
    // this.allianceApi
    //   .config_share_batchimagequery({ ...parmas, shareType: 'image', tenantId: this.subHeader.merchantCurrentId })
    //   .subscribe((res) => {
    //     this.appService.isContentLoadingSubject.next(false);
    //     if (res?.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message });

    //     // 默认
    //     const _defaultList = res?.data?.images.filter((v) => !v?.metaKey.includes('other'));
    //     if (_defaultList.length > 0)
    //       this.defaultList.forEach((a, i) => {
    //         _defaultList.forEach((b) => {
    //           if (a.metaKey === b.metaKey) this.defaultList[i].value = b.value;
    //         });
    //       });

    //     // 其他
    //     this.otherList = res?.data?.images.filter((v) => v?.metaKey.includes('other'));
    //   });
  }

  /** 分享图配置 - 语言列表的改变 */
  updateLanguageForm(languageValue: string[]) {
    this.appService.isContentLoadingSubject.next(true);

    const parmas = {
      affiliateType: 2, // 1:联盟计划 2:推荐好友
      languageValue,
      tenantId: this.subHeader.merchantCurrentId,
    };

    // 商户1/2
    if (!this.isFiveMerchant) {
      this.api.config_language_save(parmas).subscribe(() => this.appService.isContentLoadingSubject.next(false));
      return;
    }

    // 商户5
    this.allianceApi.config_language_save(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res?.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message });
      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });

      // 当语系更新成功，重新获取语系配置接口
      this.curLang = 'zh-cn';
      this.getShareLang().subscribe();
    });
  }

  /** 分享图配置 - 选择语言索引改变 */
  onLangChange(language: string) {
    this.curPlat = 0;
    this.getShare(language, this.curPlatValue);
  }

  /** 分享图配置 - 上传/删除 图片 */
  onUploadImgChange(value: string, i: number, item, language: string) {
    const parmasCom = {
      affiliateType: 2, // 1:联盟计划 2:推荐好友
      type: 3, // 1-佣金任务 2-佣金配置 3-分享页
      language,
      deviceType: this.curPlatValue, // pc h5 app,
      value,
    };

    // 商户1/2 - 保存
    if (!this.isFiveMerchant) {
      this.appService.isContentLoadingSubject.next(true);
      this.api
        .config_share_save({
          ...parmasCom,
          merchant: this.subHeader.merchantCurrentId,
          item, // '9:16' | '1:1' | '16:9'
        })
        .subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);

          if (!value) return; // 值为空不弹出提示

          this.shareList[i] = res?.data === true ? value : '';
          this.appService.showToastSubject.next({
            msgLang: res?.data === true ? 'common.uploadedSuc' : 'common.uploadFailed',
            successed: res?.data === true,
          });
        });
      return;
    }

    // 商户5 - 新增/删除
    // const paramsFive = {
    //   ...parmasCom,
    //   shareType: 'image',
    //   tenantId: this.subHeader.merchantCurrentId,
    // };
    // this.appService.isContentLoadingSubject.next(true);
    // this.allianceApi[value ? 'config_share_save' : 'config_share_batchimagedelete']({
    //   ...paramsFive,
    //   ...(value ? { metaKey: item?.metaKey } : { metaKeys: [item?.metaKey] }),
    // }).subscribe((res) => {
    //   this.appService.isContentLoadingSubject.next(false);
    //   if (res?.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message });
    //   this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
    //   this.getShare(language, this.curPlatValue);
    // });
  }

  /** 分享图配置（商户5） - 上传/删除 zip */
  onUploadZipChange(value: string, language: string) {
    const parmas = {
      tenantId: this.subHeader.merchantCurrentId,
      affiliateType: 2, // 1:联盟计划 2:推荐好友
      type: 3, // 1-佣金任务 2-佣金配置 3-分享页
      language,
      value: this.appService.joinHost(value),
      shareType: 'zip',
    };

    this.appService.isContentLoadingSubject.next(true);
    this.allianceApi.config_share_save(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res?.data === true);
    });
  }

  /** 推荐好友红利设定 - 选择类型 */
  selectBonusType(value: any) {
    this.isEdit = false;
    this.bonusType = value;
  }

  /** 获取 CPA奖励设定 */
  getviplevelsettings() {
    this.appService.isContentLoadingSubject.next(true);
    return this.allianceApi.getviplevelsettings({ tenantId: this.subHeader.merchantCurrentId }).pipe(
      tap((res) => {
        this.capList = res?.data || [];
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** 获取 顶级推荐人设定 */
  getRecommendReward() {
    // 获取数据时，关闭顶级推荐人设定编辑
    this.isEdit = false;
    const topList: any[] = [
      { limit: '1' },
      { limit: '2 - 10' },
      { limit: '11 - 20' },
      { limit: '21 - 50' },
      { limit: '51 - 100' },
    ];
    this.appService.isContentLoadingSubject.next(true);
    return this.api.config_top_query({ tenantId: this.subHeader.merchantCurrentId }).pipe(
      tap((res) => {
        if (!res?.data.length) {
          this.recommenderList = [];
        } else {
          res.data.forEach((a, i) => {
            topList[i] = { ...topList[i], ...a };
          });
          this.recommenderList = topList;
        }
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** CPA奖励/顶级推荐人设定 - 修改 */
  onEdit() {
    this.isEdit = !this.isEdit;
    if (this.bonusType === 1) this.recommenderEditList = cloneDeep(this.recommenderList);
    if (this.bonusType === 2) {
      this.capEditList = cloneDeep(this.capList);
      if (this.capEditList.length > 0 && this.vipLevelList.length > 0) this.selectVipLevel();
    }
  }

  /** CPA奖励设定 - 编辑VIP等级时，校正成长值 */
  selectVipLevel() {
    this.capEditList.forEach((a, i) => {
      this.vipLevelList.forEach((b) => {
        if (a.vipLevel === b.vipLevel) this.capEditList[i].totalPoints = b.totalPoints;
      });
    });
  }

  /** CPA奖励/顶级推荐人设定 - 新增 */
  addBonusVip() {
    // if (this.bonusType === 1) this.recommenderEditList.push({ first: 0, last: 0, moeny: 0 });
    if (this.bonusType === 2) this.capEditList.push({ id: 0, vipLevel: 0, totalPoints: 0, reward: 0 });
  }

  /** CPA奖励设定 - 删除 */
  deleteVip(i: number) {
    this.capEditList.splice(i, 1);
  }

  /** CPA奖励/顶级推荐人设定 - 确认 */
  editSettings() {
    // 顶级推荐人设定
    if (this.bonusType === 1) {
      this.updateTopsettings();
      return;
    }

    // CPA奖励
    const addList = this.capEditList.filter((v) => v.id === 0);
    zip(
      this.capEditList.length > 0 ? this.updateviplevelsettings() : of(undefined),
      addList.length > 0 ? this.addviplevelsettings(addList) : of(undefined)
    ).subscribe(() => {
      this.isEdit = false;
      setTimeout(() => {
        this.getviplevelsettings().subscribe();
      }, 100);
    });
  }

  /** CPA奖励设定 - 更新API */
  updateviplevelsettings() {
    const params = {
      tenantId: this.subHeader.merchantCurrentId,
      settingsList: [...this.capEditList].filter((v) => v.id !== 0),
    };
    this.appService.isContentLoadingSubject.next(true);
    return this.allianceApi.updateviplevelsettings(params).pipe(
      tap((res) => {
        if (res?.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message });
        this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** CPA奖励设定 - 新增API */
  addviplevelsettings(list: any) {
    const params = {
      tenantId: this.subHeader.merchantCurrentId,
      settingsList: [...list],
    };
    this.appService.isContentLoadingSubject.next(true);
    return this.allianceApi.addviplevelsettings(params).pipe(
      tap((res) => {
        if (res?.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message });
        this.appService.showToastSubject.next({ msgLang: 'budget.addSuc', successed: true });
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** 顶级推荐人设定 - 更新API */
  updateTopsettings() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .config_top_save({
        rewards: this.recommenderEditList.map((v) => ({ dictId: v.dictId, reward: v.reward })),
        tenantId: this.subHeader.merchantCurrentId,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res?.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message });
        this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
        setTimeout(() => {
          this.getRecommendReward().subscribe();
        }, 100);
      });
  }
}
