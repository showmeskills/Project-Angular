import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { DailyRacesService } from 'src/app/pages/daily-races/daily-races.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { RetrieveAccountService } from 'src/app/pages/retrieve-account/retrieve-account.service';
import { environment } from 'src/environments/environment';
import { WagerRank } from '../interfaces/gameorder.interface';
import { ActivityService } from './../../pages/activity/activity.service';
import { NotificationService } from './../../pages/notification-center/notification.service';
import { LocaleService } from './locale.service';
import { LocalStorageService } from './localstorage.service';

import { KycService } from 'src/app/pages/kyc/kyc.service';
import { WalletApi } from '../apis/wallet.api';
import { EddPopupService } from '../components/edd-popup/edd-popup.service';
import { SignalRLeaderBoard, SignalRSelfRank } from '../interfaces/activity.interface';
import { SigalNonStickyStatus } from '../interfaces/bonus.interface';
import { KycDialogService } from './kyc-dialog.service';
import { ToastService } from './toast.service';

export interface signalrMessage {
  /**关联目标 已知有 Wallet 钱包 | Account 账户*/
  related: string;
  /**类型 */
  action?: string;
  /**数据 */
  data?: signalrDataItem;
  /**时间 */
  time?: number;
  /** 非粘性类型 */
  type?: 'NonStickyBalance';
}

export interface signalrDataItem {
  /**金额 */
  Amount?: any;
  /**币种 */
  Currency?: any;
  /**如果是游戏下注会返回这个游戏的id */
  GameId?: string;
  /**某些时候有用。被踢出时候是1 */
  code?: number;
  /**领取卡券时候的卡券名称 */
  name?: string;
  /**重复登录时候的ip */
  ip?: string;
  /**钱包余额 */
  Balance?: any;
  /** 非粘性 类型 */
  Category?: 'SlotGame' | 'LiveCasino';
}

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private connection!: HubConnection; //Signalr连接
  private isDestory: boolean = false; //是否销毁

  constructor(
    private localStorageService: LocalStorageService,
    private appService: AppService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private localeService: LocaleService,
    private miniGameService: MiniGameService,
    private retrieveAccountService: RetrieveAccountService,
    private cardCenterService: CardCenterService,
    // private riskService: RiskControlService,
    public drs: DailyRacesService,
    private kycDialogService: KycDialogService,
    private eddPopupService: EddPopupService,
    private kycService: KycService,
    private activityService: ActivityService,
    private walletApi: WalletApi
  ) {
    //订阅销毁
    this.appService.signalrDestory$.subscribe(_ => this.destory());
  }

  /**
   * Connection 初始化
   */
  connectionInit() {
    const signalrUrl: string = environment.signalrUrl;
    this.connection = new HubConnectionBuilder()
      .withUrl(signalrUrl, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        accessTokenFactory: () => this.localStorageService.token!,
      })
      .build();
    this.connection.keepAliveIntervalInMilliseconds = 10 * 1000; //Ping检查间隔
    this.connection.onclose(async (error: Error | undefined) => {
      if (this.isDestory) {
        console.log('平台Signalr已销毁');
        return;
      }
      console.warn('平台Signalr断线了,10S后自动重连...', error);
      await firstValueFrom(timer(10 * 1000));
      await this.start();
    });

    //------------- 通知接口API START -------------//

    //成功登录
    this.connection.on('OnSuccess', userInfo => {
      this.appService.networkTips$.next(false);
      console.log('平台Signalr连接成功', userInfo);
    });

    this.connection.on('OnKickout', this.kickout); //后台管理员T出 Kickout
    this.connection.on('OnRepeatLogin', this.repeatLogin); //重复登录T出 RepeatLogin

    this.connection.on('OnWithdraw', this.assetChanges); //提款 Withdraw
    this.connection.on('OnDeposit', this.assetChanges); //存款 Deposit
    this.connection.on('OnWagerCancel', this.assetChanges); //取消 WagerCancel
    this.connection.on('OnReSettle', this.assetChanges); //重新结算 ReSettle
    this.connection.on('OnSettle', this.assetChanges); //结算 Settle
    this.connection.on('OnWager', this.assetChanges); //下注 Wager
    this.connection.on('OnTransfer', this.assetChanges); // 划转
    this.connection.on('OnAdjustment', this.assetChanges); // 调账
    this.connection.on('OnInviteFriendCommission', this.assetChanges); // 好友佣金
    this.connection.on('OnAgentCommission', this.assetChanges); // 代理佣金
    this.connection.on('OnWithdrawFreeze', this.assetChanges); // 取款冻结通知
    this.connection.on('OnCancelWithdrawThaw', this.assetChanges); // 取消取款冻结通知
    this.connection.on('OnTransferFailFreeze', this.assetChanges); // 划转失败冻结通知
    this.connection.on('OnTransferFailThaw', this.assetChanges); // 划转失败解冻通知
    this.connection.on('OnTakeBonusWater', this.assetChanges); // 领取卡劵
    this.connection.on('OnSiteMail', this.noticeCounts); // 站内信
    this.connection.on('OnTips', this.noticeCoupon); // 卡劵数量
    this.connection.on('OnLiveCheck', this.onLiveCheck); // 人脸活动验证结果推送
    // this.connection.on('OnSupplementInfo', this.onSupplementCheck); // 补充资料通知
    this.connection.on('OnWagerRank', this.onWagerRank); //排行榜推送
    this.connection.on('OnIdVerification', this.onIDVerification); //kyc登陆提示
    this.connection.on('OnRequestKycIntermediate', this.onRequestKycIntermediate); //后台强制发起中级kyc登陆提示
    this.connection.on('OnRequestKycAdvanced', this.onRequestKycAdvance);
    this.connection.on('OnEdd', this.onOpenEDD);
    this.connection.on('OnNonStickyWithdraw', this.assetChanges); // 非粘性更新余额
    this.connection.on('OnNonStickyStatus', this.onNonStickyStatus); // 卡券状态更新
    this.connection.on('OnNonStickyBalanceChange', this.nonStickyBalanceChange); // 头部钱包非粘性更新

    this.connection.on('OnNewRankSelfRank', this.onNewTournamentSelfRank); // tournament 弹窗推送
    this.connection.on('OnNewRankLeaderboard', this.onNewTournamentLeaderBoard); // tournament 详情页面排行推送

    //------------- 通知接口API END -------------//
  }

  /** 初始化平台Signalr */
  async init(): Promise<void> {
    this.isDestory = false;
    await this.start();
  }

  /** Signalr开始连接 */
  private async start(): Promise<void> {
    //如果已销毁，不进行连接
    if (this.isDestory) return;
    try {
      await this.connection.start();
    } catch (error) {
      console.warn('平台Signalr连接失败,10S后自动重连...');
      await firstValueFrom(timer(10 * 1000));
      await this.start();
    }
  }

  /** 销毁平台Signalr */
  async destory(): Promise<void> {
    this.isDestory = true;
    if (this.connection.state == HubConnectionState.Connected) {
      await this.connection.stop();
    }
  }

  /**
   * 被踢出登录
   *
   * @param msg
   */
  private kickout = (msg: signalrMessage) => {
    if (msg.data?.code === 1) {
      // 被禁用
      window.eventBank.push({ key: 'showForbidTip', payload: 'login' });
      this.appService.softlyLogout();
    } else {
      window.location.reload();
    }
  };

  /** 重复登录 */
  private repeatLogin = () => {
    this.appService.showRepeatLoginTip();
  };

  /**
   * 资金相关
   *
   * @param msg
   */
  private assetChanges = (msg: signalrMessage) => {
    console.log('---------收到资金变动signalr信息----------\n', msg);
    this.appService.assetChanges$.next(msg);
    switch (msg.action) {
      case 'Wager':
        if (msg.data?.GameId) {
          // 体育、彩票返回的 GameId 是空字符串
          this.miniGameService.checkRecentLyPlayeGames(msg.data.GameId);
        }
        break;
      case 'Deposit':
        // 充值Singlar 暂时没有区分是法币或虚拟币申诉充值 或者 其他充值， 所以暂时先放在这边，已经和后端沟通
        this.appService.currencies$
          .pipe(
            untilDestroyed(this),
            filter(x => x.length > 0)
          )
          .subscribe(currencies => {
            if (msg?.data?.Currency) {
              const currentCurrency = msg.data.Currency;
              const currency = currencies.filter(currency => currency.currency === currentCurrency);
              const isDigital = currency.length === 1 && currency[0].isDigital;
              if (isDigital) {
                this.retrieveAccountService.digitalRecordList$.next(true);
              } else {
                this.retrieveAccountService.currencyRecordList$.next(true);
              }
            }
          });
        if (Number(msg?.data?.Amount) > 0) {
          this.toastService.show({
            message:
              this.localeService.getValue('notice_header') +
              ` ${msg?.data?.Amount} ${msg?.data?.Currency} ` +
              this.localeService.getValue('notice_footer'),
            type: 'success',
          });
        } else {
          this.toastService.show({
            message: this.localeService.getValue('deposit_fail'),
            type: 'fail',
          });
        }
        break;
      default:
        break;
    }
  };

  /**站内信通知 */
  private noticeCounts = (data: any) => {
    // console.log('---------站内信 未读数量变动----------\n', data?.data);
    this.appService.noticeCounts$.next(data?.data);
    this.notificationService.reLoadData$.next(true);
  };

  /**用户异常通知 */
  // private onSupplementCheck = (msg: any) => {
  //   console.log('---------当前用户需补充资料----------\n', msg);
  //   if (msg.action == 'SupplementInfo') {
  //     this.riskService.showRiskBanner$.next(msg.data);
  //     this.localStorageService.riskBanner = msg.data;
  //   }
  // };

  /**
   * 卡券数量通知
   *
   * @param data
   */
  private noticeCoupon = (data: any) => {
    // console.log('---------卡券数量通知----------\n', data);
    if (data?.data?.code) {
      if (+data?.data?.code === 1) {
        this.cardCenterService.getBonusCount();
        this.cardCenterService._loadData.set(true);
      }
    }
  };

  /**
   * 人脸识别验证结果signal 回调
   *
   * @param data
   */
  private onLiveCheck = (data: any) => {
    console.log('---------人脸识别 验证结果----------\n', data);
    switch (data?.data?.Status) {
      case '0':
        this.toastService.show({ message: this.localeService.getValue('face_varifying'), type: 'success' });
        return;
      case '1':
        this.toastService.show({ message: this.localeService.getValue('face_varify_fail'), type: 'fail' });
        return;
      case '2':
        this.toastService.show({ message: this.localeService.getValue('face_varify_success'), type: 'success' });
        return;
      default:
        break;
    }
  };

  /**
   * 1秒一次刷新数据
   *
   * @param wagerRankData
   */
  onWagerRank = (wagerRankData: WagerRank) => {
    // console.log('---------排行榜推送----------\n', wagerRankData);
    if (!wagerRankData?.data) return;
    this.drs.collectionData.push(wagerRankData);
    this.drs.onWagerRank3LevelGame(wagerRankData);
  };

  /**
   * kyc安全验证提示框
   *
   * @param msg
   */
  private onIDVerification = (msg: any) => {
    // console.log('---------kyc验证提示----------\n', msg);
    if (msg.action == 'IDVerification' && this.kycService.getSwitchEuKyc) {
      this.kycDialogService.kycVarificationNoticeDialog();
    }
  };

  /**
   * 后台发起中级kyc安全验证提示框
   *
   * @param msg
   */
  private onRequestKycIntermediate = (msg: any) => {
    // console.log('---------后台强制发起中级kyc验证提示----------\n', msg);
    if (msg.action == 'RequestKycIntermediate' && this.kycService.getSwitchEuKyc) {
      this.kycDialogService.authenicationIntermediateNoticeDialog();
      this.kycService.bannerUpdate(true);
    }
  };

  /**
   * 后台发起高级验证
   *
   * @param msg
   */
  private onRequestKycAdvance = (msg: any) => {
    // console.log('---------后台强制发起高级kyc验证提示----------\n', msg);
    if (this.kycService.getSwitchEuKyc) {
      this.kycService.isAllowAdvancedEu = true;
      this.kycDialogService.authenicationIntermediateNoticeDialog('complete_adv', false);
      this.kycService._refreshKycStatus.set('admin-raised-advance-eu-kyc');
    }
  };

  /**
   * 推送EDD 开启问卷调查
   *
   * @param msg
   */
  private onOpenEDD = (msg: any) => {
    // console.log('---------EDD 推送开始----------\n', msg);
    if (this.kycService.getSwitchEuKyc) {
      this.eddPopupService.onJourneyStart();
    }
  };

  /**
   * 卡券状态更新
   *
   * @param msg
   */
  private onNonStickyStatus = (msg: SigalNonStickyStatus) => {
    // console.log('----------非粘性卡券状态更新--------------', msg);
    if (msg?.data?.Success) {
      this.cardCenterService._reloadNonSticky.set(true);
    }
  };

  private nonStickyBalanceChange = (msg: signalrMessage) => {
    console.log('----------非粘性卡券资金变动signalr信息--------------', msg);
    this.walletApi.getUserbalance().subscribe(userBalance => {
      if (Number(userBalance?.length) > 0) {
        this.appService.userBalance$.next(userBalance);
        this.appService.assetChanges$.next({
          ...msg,
          type: 'NonStickyBalance',
        });
      }
    });
  };

  private onNewTournamentLeaderBoard = (msg: SignalRLeaderBoard) => {
    const data = msg?.data;
    if (!data?.IsChange) return;
    // console.log('----------tournament 总排行数据变化--------------', msg);
    this.activityService.collectLeaderBoard.push(data);
  };

  private onNewTournamentSelfRank = (msg: SignalRSelfRank) => {
    const data = msg?.data;
    if (!data?.IsChange) return;
    // console.log('----------torunament 个人数据变化--------------', msg);
    if (this.appService.userInfo$.value?.uid === data?.Uid) {
      this.activityService.collectCurrentUser.push(data);
    }
  };
}
