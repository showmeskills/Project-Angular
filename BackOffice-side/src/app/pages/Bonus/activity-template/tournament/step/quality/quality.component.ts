import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { SelectLabelComponent } from 'src/app/pages/game/game-manage/select-label/select-label.component';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import {
  CurrencyIconDirective,
  IconCountryComponent,
  IconSrcDirective,
} from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import {
  InputFloatDirective,
  InputNumberDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { CouponNonStickyLimitEnumType } from 'src/app/shared/interfaces/coupon';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { SearchGamePopupComponent } from './search-game-popup/search-game-popup.component';
import { AddPopupComponent } from 'src/app/pages/Bonus/activity-template/add-popup/add-popup.component';
import { zip } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { SelectMemberComponent } from 'src/app/pages/Bonus/coupon-manage/send-coupon/select-member/select-member.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import moment from 'moment';
import { GameApi } from 'src/app/shared/api/game.api';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { NewContestStatusEnum } from 'src/app/shared/interfaces/activity';

@Component({
  selector: 'tournament-quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    LangPipe,
    OwlDateTimeModule,
    AngularSvgIconModule,
    IconSrcDirective,
    FormWrapComponent,
    InputFloatDirective,
    CurrencyIconDirective,
    NgbTooltip,
    HostPipe,
    IconCountryComponent,
    UploadComponent,
    InputNumberDirective,
    CurrencyValuePipe,
    InputTrimDirective,
  ],
})
export class TournamentQualityComponent implements OnInit {
  constructor(
    public appService: AppService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    private gameLabelApi: GameLabelApi,
    public lang: LangService,
    private selectApi: SelectApi,
    private bonusCouponApi: BonusCouponApi,
    private gameApi: GameApi,
    private api: ActivityAPI,
    private assetApi: AssetApi
  ) {
    const { id, code } = activatedRoute.snapshot.params;
    const { tenantId, configState } = activatedRoute.snapshot.queryParams;

    this.id = +id || 0;
    this.tmpCode = code;

    this.tenantId = +tenantId;
    this.configState = +configState;
  }

  /** 商户ID */
  tenantId;

  /** 活动ID */
  id = 0;

  /** 模板code - goGaming */
  tmpCode;

  /** 活动状态 */
  configState: NewContestStatusEnum;

  /** 基于USDT换算其他币种汇率列表 */
  rateList: any[] = [];
  /** 基于最低下注金额实时换算其他币种数量列表 */
  rateAmonutList: any[] = [];

  /** 游戏标签 - 总数据 */
  gameLabelList: any[] = [];
  /** 游戏标签 - 已选择的数据 */
  selectedLabelList: any[] = [];
  /** 游戏标签 - 选中的游戏列表数据 */
  selectedLabelGameList: any[] = [];

  /** 已选择的游戏 */
  selectedGameList: any[] = [];

  /** 国家数据 */
  countryList: any[] = [];
  /** 已选的国家 */
  selectCountryList: any[] = [];

  /** 产品列表 */
  productList = [
    {
      name: '娱乐场投注',
      lang: 'member.activity.prizeCommon.casinoBetting',
      value: CouponNonStickyLimitEnumType.SlotGame,
    },
    {
      name: '真人娱乐场投注',
      lang: 'member.activity.prizeCommon.liveCasinoBetting',
      value: CouponNonStickyLimitEnumType.LiveCasino,
    },
  ];

  /** 类型列表 */
  typeList = [{ name: '新竞赛活动', lang: 'member.activity.sencli12.title', value: 'Tournament' }];

  /** 条件列表 */
  criteriaList = [
    { name: '倍数', lang: 'Highest single win', value: 0 },
    { name: '投注总金额', lang: 'Total amount wagered', value: 1 },
    { name: '总旋转次数/总回合数', lang: 'Totalspins', value: 2 },
    { name: '总赢次数', lang: 'TotalWin', value: 3 },
  ];

  /** 玩家限制 - 发送对象列表 */
  playerSendList = [
    { name: '选择会员', lang: 'member.coupon.model.chooseMember', value: 0 },
    { name: '手动输入', lang: 'member.coupon.model.manualEntry', value: 1 },
    { name: '上传名单', lang: 'member.coupon.model.uploadList', value: 2 },
  ];

  /** 发送对象 - 手动选择会员UID */
  memberSelectedList: any[] = [];

  /** 发送对象 - 手动输入会员UID */
  memberManualRemark = '';

  /** 发送对象 - 上传会员UID */
  memberManualUploadList = [];

  data = {
    product: CouponNonStickyLimitEnumType.SlotGame, // 产品
    type: 'Tournament', // 类型
    time: [] as any, // 开始&结束时间
    beforeHours: 0, // 活动开始前几小时
    afterHours: 0, // 活动结束后几小时
    criteria: 0, // 条件 - 默认【倍数】
    minBet: 1, // 最低下注金额（USDT）
    countryRestrictions: 0, // 国家限制 0=不限制 1=限制
    playerRestrictions: 0, // 玩家限制 0=不限制 1=白名单 2=黑名单
    playerSend: 0, // 玩家限制 - 限制方式：0=选择会员 1=手动输入 2=上传名单
  };

  /** 编辑 - 活动状态为手动停止 */
  get isManualStopEdit(): boolean {
    return this.configState === NewContestStatusEnum.ManualStop;
  }

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.getCountry(),
      this.gameLabelApi.getList(this.tenantId),
      this.assetApi.getrate({
        baseCurrency: 'USDT',
        exchangeCurrencies: 'XRP,GBP,USD,THB,CNY,SOL,BNB,SHIB,NZD,DOGE,LED,USDC,XEM,MYR,IDR,BCH,BTC,CAD,AUD',
      })
    ).subscribe(([countryList, gameLabelList, rateData]) => {
      this.appService.isContentLoadingSubject.next(false);

      // 获取国家数据
      this.countryList = countryList || [];
      // 获取游戏标签数据
      this.gameLabelList = gameLabelList || [];
      // 获取基于USDT换算其他币种汇率
      this.rateList = rateData?.data?.rates || [];

      // 获取详情
      this.tmpCode && this.getDetail();
    });
  }

  /** 获取详情 */
  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.newrank_get_steptwo(this.tmpCode, this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res || res.code !== '0000') {
        this.appService.showToastSubject.next(res?.message ? { msg: res.message } : { msgLang: 'common.fail' });
      }

      const config = res?.data || {};
      // 产品 - 类型
      this.data.product = config?.provider;

      // 类型
      this.data.type = config?.type;

      // 活动开始&结束时间
      this.data.time = [
        config?.tmpStartTime ? new Date(config?.tmpStartTime) : null,
        config?.tmpEndTime ? new Date(config?.tmpEndTime) : null,
      ];

      // 活动开始前几小时&活动结束后几小时
      this.data.beforeHours = config?.tmpBeginShowHours;
      this.data.afterHours = config?.tmpEndShowHours;

      // 条件 - 类型
      this.data.criteria = config?.rankType;

      // 最低下注金额（U）
      this.data.minBet = config?.minBetUsdt;
      this.minBetChange();

      // 游戏列表 - 标签
      if (config?.labelIds && config?.labelIds?.length) {
        // 获取标签列表
        this.selectedLabelList = this.gameLabelList.filter((v) => [...(config?.labelIds || [])].includes(v.id));
        // 获取标签的游戏列表
        this.getgamelistbylabelids(config?.labelIds);
      }

      // 游戏列表 - 游戏数据
      if (config?.byGameTypes && config?.byGameTypes?.length) {
        const gameIdsList = config?.byGameTypes.map((v) => v?.gameId).filter((j) => j) || [];
        this.getgamelistbygameids(gameIdsList);
      }

      // 国家限制 - 类型
      this.data.countryRestrictions = config.countryType;
      // 国家限制 - 获取国家
      if (config.countryType === 1 && config.countrys.length) {
        this.selectCountryList = this.countryList
          .map((e) => e.countries.filter((j) => config.countrys?.includes(j.countryIso3)))
          .flat(Infinity);
      }

      // 玩家限制- 类型
      this.data.playerRestrictions = config.uidType;
      // 玩家限制：发送对象 - 类型
      if ([1, 2].includes(config.uidType)) {
        this.data.playerSend = config.uids?.chooseType;
        // 玩家限制：发送对象 - 获取会员信息
        switch (config.uids?.chooseType) {
          case 0:
            this.memberSelectedList = config.uids?.users || [];
            break;
          case 1:
            this.memberManualRemark = config.uids?.users?.map((v) => v.uid).join(';') || '';
            break;
          case 2:
            this.memberManualUploadList = config.uids?.users || [];
            break;
        }
      }
    });
  }

  /** 产品 - 选择操作 */
  productChange(e) {
    if (e === this.data.product) return;
    // 切换产品，需要重置游戏列表的 标签游戏获取 和 清空游戏
    if (this.selectedLabelList.length) this.getgamelistbylabelids(this.selectedLabelList.map((v) => v.id));
    this.selectedGameList = [];
  }

  /** 通知时间 - 加减操作 */
  onAddCutHours(type, value) {
    if (this.isManualStopEdit) return;

    if (type === 'add') ++this.data[value];
    if (type === 'cut' && this.data[value] > 0) --this.data[value];
  }

  /** 最低下注金额 - 监听 */
  minBetChange() {
    if (!this.data.minBet || !this.rateList.length) {
      this.rateAmonutList = [];
      return;
    }
    this.rateAmonutList = this.rateList.map((v) => ({
      currency: v?.currency,
      rateAmount: +this.data.minBet / v?.rate,
    }));
  }

  /** 游戏列表 - 打开标签弹窗 */
  onOpenLabelPopup() {
    const modalRef = this.modalService.open(SelectLabelComponent, {
      width: '800px',
      disableClose: true,
    });
    console.log(this.tenantId);
    modalRef.componentInstance['tenantId'] = this.tenantId;
    modalRef.componentInstance['selectType'] = 'gameLabel';
    modalRef.componentInstance['selectList'] = this.selectedLabelList;
    modalRef.componentInstance['labelProviderList'] = this.gameLabelList;

    modalRef.componentInstance.selectConfirm.subscribe((selectList) => {
      this.selectedLabelList = selectList;
      if (!this.selectedLabelList.length) {
        this.selectedLabelGameList = [];
      } else {
        this.getgamelistbylabelids();
      }
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 游戏列表 - 通过游戏标签获取游戏列表 */
  getgamelistbylabelids(idsList?: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      category: this.data.product,
      ids: this.selectedLabelList.length ? this.selectedLabelList.map((v) => v.id) : idsList,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi.getgamelistbylabelids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.selectedLabelGameList = res || [];
    });
  }

  /** 游戏列表 - 删除游戏标签 */
  onDeteleLabel(item, i) {
    this.selectedLabelList.splice(i, 1);
    this.selectedLabelGameList.forEach((v, j) => {
      if (v.id === item.id) this.selectedLabelGameList.splice(j, 1);
    });
  }

  /** 游戏列表 - 打开游戏弹窗 */
  onOpenGamePopup() {
    const modalRef = this.modalService.open(SearchGamePopupComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: false,
    });

    modalRef.componentInstance['tenantId'] = this.tenantId;
    modalRef.componentInstance['gameCategory'] = this.data.product;
    modalRef.componentInstance['selectedGameList'] = this.selectedGameList;

    modalRef.componentInstance.confirmSuccess.subscribe((list) => {
      this.selectedGameList = list;
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 游戏列表 - 游戏ids获取游戏列表 */
  getgamelistbygameids(idsList: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      ids: idsList,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi.getgamelistbygameids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.selectedGameList = res || [];
    });
  }

  /** 国家限制 - 选择国家 */
  onOpenCountryPopup() {
    const type = 'area';
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = this.countryList;
    modalRef.componentInstance['selectedList'] = this.selectCountryList;
    modalRef.componentInstance.confirm.subscribe((selList) => {
      this.selectCountryList = selList;
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 发送对象 - 选择会员弹窗 */
  onOpenMemberSelectPopup() {
    const modalRef = this.modalService.open(SelectMemberComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance['tenantId'] = this.tenantId;

    modalRef.componentInstance.selectSuccess.subscribe((list) => {
      const all = [...this.memberSelectedList, ...list];
      // 对象数组去重
      const res = new Map();
      this.memberSelectedList = all.filter((item) => !res.has(item['uid']) && res.set(item['uid'], 1));
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 发送对象 - 会员名单上传 */
  customUpload = async (file /*{ done }*/) => {
    this.appService.isContentLoadingSubject.next(true);
    this.api.newrank_import_data(file).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msgLang: res?.code === '0000' ? 'member.coupon.model.uploadSuccess' : 'member.coupon.model.uploadFailed',
        successed: res?.code === '0000',
      });
      this.memberManualUploadList = res.data || [];
    });
  };

  /** 发送对象 - 下载会员名单模板 */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.newrank_download_template().subscribe((isSuccess) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.downloadSuccessful' : 'member.coupon.model.downloadFailed',
        successed: isSuccess,
      });
    });
  }

  /** 
    提交
    @type activity=进入第三步，draft=保存草稿
  */
  onSubmit(type) {
    if (this.submitInvalid()) return;

    let parmas: any = {
      tmpCode: this.tmpCode,
      tenantId: this.tenantId,
      provider: this.data.product, // 产品类型
      type: this.data.type, // 类型
      tmpStartTime: moment(this.data.time?.[0]?.getTime()).format('YYYY-MM-DD HH:mm:ss'), // 活动开始时间
      tmpEndTime: moment(this.data.time?.[1]?.getTime()).format('YYYY-MM-DD HH:mm:ss'), // 活动结束时间
      tmpBeginShowHours: +this.data.beforeHours, // 活动开始前几小时
      tmpEndShowHours: +this.data.afterHours, // 活动结束后几小时
      rankType: this.data.criteria, // 条件
      minBetUsdt: +this.data.minBet, // 最低下注金额（U）
      labelIds: [], // 游戏列表 - 标签合集
      byLabelTypes: [], // 游戏列表 - 标签合集：对应的游戏数据合集
      byGameTypes: [], // 游戏列表 - 游戏合集
      countryType: this.data.countryRestrictions, // 国家限制 - 当前类型
      countrys: [], // 国家限制 - 限制：选择的国家三码合集
      uidType: this.data.playerRestrictions, // 玩家限制 - 当前类型
      uids: {
        chooseType: this.data.playerSend, // 玩家限制:限制对象 - 当前类型
        users: [], // 玩家限制:限制对象 - UID对象合集
      },
    };

    // 游戏列表 - 标签合集 + 标签对应的游戏数据合集
    if (this.selectedLabelList.length) {
      parmas.labelIds = this.selectedLabelList.map((v) => v?.id);

      if (this.selectedLabelGameList.length) {
        const byLabelTypes = this.selectedLabelGameList
          .map((v) => v.gameList)
          .flat(Infinity)
          .filter((e) => e)
          .map((j) => ({ gameCategory: j?.category, gameCode: j?.gameCode, gameProvider: j?.providerId }));
        parmas.byLabelTypes = byLabelTypes || [];
      }
    }

    // 游戏列表 - 游戏合集
    if (this.selectedGameList.length) {
      parmas.byGameTypes = this.selectedGameList.map((v) => ({
        gameCategory: v?.category,
        gameCode: v?.gameId || v?.gameCode,
        gameId: v?.id,
        gameProvider: v?.providerId,
      }));
    }

    // 国家限制 - 限制：选择的国家三码合集
    if (this.data.countryRestrictions === 1) {
      parmas.countrys = this.selectCountryList.map((v) => v?.countryIso3);
    }

    // 玩家限制 - 限制：会员UID合集
    if ([1, 2].includes(this.data.playerRestrictions)) {
      switch (this.data.playerSend) {
        // 会员选择
        case 0:
          parmas.uids.users = this.memberSelectedList.map((v) => ({ uid: v.uid, uact: v.name || v.uact }));
          break;
        // 手动输入
        case 1:
          parmas.uids.users = this.memberManualRemark
            .split(';')
            .filter((v) => v)
            .map((v) => ({ uid: v, uact: '' }));
          break;
        // 上传名单
        case 2:
          parmas.uids.users = this.memberManualUploadList;
          break;
      }
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api.newrank_addorupdate_steptwo(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0000') {
        return this.appService.showToastSubject.next(
          res.message ? { msg: res.message } : { msgLang: 'bonus.activity.updateActivityFail' }
        );
      }

      if (type === 'activity') this.jump('activity');
      if (type === 'draft') this.router.navigate(['/bonus/activity-manage/NewRank']);
    });
  }

  /** 字段校验 */
  submitInvalid() {
    // 请选择产品！
    if (!this.data.product) {
      this.errorToast('member.activity.sencli12.errorTips.tips1');
      return true;
    }

    // 请选择类型！
    if (!this.data.type) {
      this.errorToast('member.activity.sencli12.errorTips.tips2');
      return true;
    }

    // 请选择开始时间！
    if (!this.data.time?.[0]) {
      this.errorToast('member.activity.sencli12.errorTips.tips3');
      return true;
    }
    // 请选择结束时间！
    if (!this.data.time?.[1]) {
      this.errorToast('member.activity.sencli12.errorTips.tips4');
      return true;
    }

    // 通知时间 - 活动开始前几小时/活动结束后几小时
    if (
      (!this.data.beforeHours && this.data.beforeHours !== 0) ||
      (!this.data.afterHours && this.data.afterHours !== 0)
    ) {
      // 请输入活动通知时间！
      this.errorToast('member.activity.sencli12.errorTips.tips5');
      return true;
    }

    // 条件
    if (!this.data.criteria && this.data.criteria !== 0) {
      // 请选择条件！
      this.errorToast('member.activity.sencli12.errorTips.tips6');
      return true;
    }

    // 最低下注金额
    if (!this.data.minBet) {
      // 请输入正确的最低下注金额！
      this.errorToast('member.activity.sencli12.errorTips.tips7');
      return true;
    }

    // 游戏列表
    if (!this.selectedLabelList.length && !this.selectedGameList.length) {
      // 请至少选择一个游戏标签或者游戏！
      this.errorToast('member.activity.sencli12.errorTips.tips19');
      return true;
    }

    // 国家限制
    if (![0, 1].includes(this.data.countryRestrictions)) {
      // 请选择国家限制！
      this.errorToast('member.activity.sencli12.errorTips.tips8');
      return true;
    }
    // 国家限制 - 选择国家
    if (this.data.countryRestrictions === 1 && !this.selectCountryList.length) {
      // 请选择国家！
      this.errorToast('member.activity.sencli12.errorTips.tips9');
      return true;
    }

    // 玩家限制
    if (![0, 1, 2].includes(this.data.playerRestrictions)) {
      // 请选择玩家限制！
      this.errorToast('member.activity.sencli12.errorTips.tips10');
      return true;
    }

    // 玩家限制 - 发送对象
    if ([1, 2].includes(this.data.playerRestrictions)) {
      if (![0, 1, 2].includes(this.data.playerSend)) {
        // 请选择发送对象！
        this.errorToast('member.activity.sencli12.errorTips.tips11');
        return true;
      }
      // 发送对象:会员UID信息
      if (this.data.playerSend === 0 && !this.memberSelectedList.length) {
        // 请选择会员！
        this.errorToast('member.activity.sencli12.errorTips.tips12');
        return true;
      }
      if (this.data.playerSend === 1 && !this.memberManualRemark) {
        // 请输入会员UID！
        this.errorToast('member.activity.sencli12.errorTips.tips13');
        return true;
      }
      if (this.data.playerSend === 2 && !this.memberManualUploadList.length) {
        // 请上传会员名单！
        this.errorToast('member.activity.sencli12.errorTips.tips14');
        return true;
      }
    }

    return false;
  }

  jump(lastPath: string) {
    const prefix = this.router.url.split('/').slice(0, 7).join('/');
    return this.router.navigate([`${prefix}/${lastPath}`, this.id, this.tmpCode], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  errorToast(msgLang) {
    this.appService.showToastSubject.next({
      msgLang,
    });
  }
}
