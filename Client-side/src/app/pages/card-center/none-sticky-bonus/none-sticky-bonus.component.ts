import { Component, DestroyRef, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { SelectDepositBonusService } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.service';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import {
  NoneActivated,
  NoneActivatedAttri,
  NoneInActivatedCards,
  OverviewData,
} from 'src/app/shared/interfaces/bonus.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { MiniGameService } from '../../minigame/minigame.service';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-none-sticky-bonus',
  templateUrl: './none-sticky-bonus.component.html',
  styleUrls: ['./none-sticky-bonus.component.scss'],
})
export class NoneStickyBonusComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private bonusApi: BonusApi,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService,
    private toast: ToastService,
    private cardCenterService: CardCenterService,
    private popup: PopupService,
    private currencyValue: CurrencyValuePipe,
    private piqService: PaymentIqService,
    private destroyRef: DestroyRef,
    private miniGameService: MiniGameService,
    private settingsService: SettingsService,
    private selectDepositBonusService: SelectDepositBonusService,
  ) {}

  /**
   * 1. 用户未做KYC 按钮 显示 认证并解锁
   * 2. 用户做完kyc 后 就需要判断 是否 符合 当前这个非粘活动 注册kyc， 不符合要弹窗
   * 3. 当用点击时候 也需要判断 这个非粘活动 是否符合注册kyc
   * 4. 符合就是走 正常的充值流程 欧洲和亚洲
   */

  /** 是否是 H5 */
  isH5 = toSignal(this.layout.isH5$);

  /** 组件loading */
  componentLoading = signal(false);
  renderComponentLoading = computed(() => this.componentLoading());

  /** 总览 */
  overview: WritableSignal<OverviewData> = signal({
    cashableBonus: {
      text: this.localeService.getValue('cashable_bonus'),
      amount: 0,
      currency: 'USDT',
      cashableBonusInfos: [],
      showToolTips: false,
    },
    lockedBonus: {
      text: this.localeService.getValue('lock_bonus'),
      amount: 0,
      currency: 'USDT',
    },
    casinoBonus: {
      text: this.localeService.getValue('casino_bonus'),
      amount: 0,
      currency: 'USDT',
    },
    liveCasinoBonus: {
      text: this.localeService.getValue('live_casino_bonus'),
      amount: 0,
      currency: 'USDT',
    },
  });
  renderOverview = computed(() => this.overview());
  overviewLoading = signal(false);
  renderOverviewLoading = computed(() => this.overviewLoading());

  /** 已激活非粘性卡券 */
  activatedCards: WritableSignal<NoneActivated | null> = signal(null);
  renderActivatedCards = computed(() => {
    if (Object.values(this.activatedCards() ?? {}).filter(item => !!item).length > 0) return this.activatedCards();
    return null;
  });
  activatedCardsLoading = signal(false);
  renderActivatedCardsLoading = computed(() => this.activatedCardsLoading());

  /** 非激活卡券 */
  inActivatedCards: WritableSignal<NoneInActivatedCards | object> = signal({});
  renderInActivatedCards = computed(() => {
    if (Object.values(this.inActivatedCards() ?? {}).filter(item => item.length > 0).length > 0)
      return this.inActivatedCards();
    return null;
  });
  inActivatedCardsLoading = signal(false);
  renderInActivatedLoading = computed(() => this.inActivatedCardsLoading());

  /** 一件领取 */
  oneCallLoading = signal(false);
  isCanClickOneCall = computed(() => {
    if (this.overview().cashableBonus.amount === 0) return true;
    return false;
  });
  renderOneCallLoading = computed(() => this.oneCallLoading());

  /** 推送更新 */
  reloadNonSticky$ = toObservable(this.cardCenterService._reloadNonSticky).pipe(takeUntilDestroyed());

  /** 用户kyc */
  userInfo: WritableSignal<AccountInforData | null> = signal(null);
  /** 用户是否进行kyc初级验证 */
  isUserNeedToVerify = computed(() => {
    if (this.userInfo()?.isBindMobile || this.userInfo()?.kycGrade) {
      return false;
    }
    return true;
  });

  defaultImg: string = '';

  ngOnInit() {
    this.defaultImg = this.miniGameService.defaultImg;

    this.appService.userInfo$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(v => !!v),
      )
      .subscribe(userInfo => {
        if (userInfo) {
          this.userInfo.set(userInfo);
          this.onInitData();
        }
      });

    this.reloadNonSticky$.subscribe(value => {
      if (value) {
        this.onInitData();
      }
      this.cardCenterService._reloadNonSticky.set(false);
    });
  }

  /** 初始化数据 */
  onInitData() {
    this.getOverview();
    this.getActivatedNoneSticky();
    this.getNoneInActivatedCards();
  }

  /** 卡券兑换后更新数据 */
  onReload() {
    this.onInitData();
  }

  /** 获取卡券总览 */
  getOverview() {
    this.overviewLoading.set(true);
    this.componentLoading.set(true);
    this.bonusApi.getNoneStickyOverview().subscribe(data => {
      this.overviewLoading.set(false);
      this.componentLoading.set(false);
      if (data) {
        this.overview.set({
          cashableBonus: {
            ...this.overview().cashableBonus,
            amount: data.cashableBonus ?? 0,
            cashableBonusInfos: data.cashableBonusInfos ?? [],
            showToolTips: (data.cashableBonusInfos ?? []).length > 0,
          },
          lockedBonus: {
            ...this.overview().lockedBonus,
            amount: data.lockedBonus ?? 0,
          },
          casinoBonus: {
            ...this.overview().casinoBonus,
            amount: data.casinoBonus ?? 0,
          },
          liveCasinoBonus: {
            ...this.overview().liveCasinoBonus,
            amount: data.liveCasinoBonus ?? 0,
          },
        });
      }
    });
  }

  /** 获取激活卡券 */
  getActivatedNoneSticky() {
    this.activatedCardsLoading.set(true);
    this.componentLoading.set(true);
    this.bonusApi
      .getActivatedNoneSticky()
      .pipe(
        map(v => ({
          ...v,
          // casinoBonus: null,
          // liveCasinoBonus: null,
          casinoBonus: v?.casinoBonus
            ? {
                ...v.casinoBonus,
                showIntro: false,
                isTargetBetDone: this.canWithdrawal(
                  v.casinoBonus?.currentBetTurnover || 0,
                  v.casinoBonus?.targetBetTurnover || 0,
                  v.casinoBonus?.currentBetNum || 0,
                  v.casinoBonus?.targetBetNum || 0,
                ),
                processed: this.onCalc(v.casinoBonus?.currentBetTurnover, v.casinoBonus?.targetBetTurnover),
                leftToWallet:
                  Number(v.casinoBonus?.targetBetTurnover || 0).minus(v.casinoBonus?.currentBetTurnover || 0) > 0
                    ? Number(v.casinoBonus?.targetBetTurnover || 0).minus(v.casinoBonus?.currentBetTurnover || 0)
                    : 0,
                loading: false,
                submitLoading: false,
                intro: '',
                calc: `calc(${
                  this.onCalc(v.casinoBonus?.currentBetTurnover, v.casinoBonus?.targetBetTurnover) <= 3
                    ? 3
                    : this.onCalc(v.casinoBonus?.currentBetTurnover, v.casinoBonus?.targetBetTurnover)
                }% - 15px)`,
                typeCode: this.onFilterTypeCode(v.casinoBonus?.typeCode, false),
                rates: `${v.casinoBonus?.currentBetNum || 0}/${
                  v.casinoBonus?.targetBetNum || 0
                } ${this.localeService.getValue('times_for_none')}`,
                isLocked: (v.casinoBonus?.balance || 0) <= 0,
                isLeft:
                  this.onCalc(v.casinoBonus?.currentBetTurnover, v.casinoBonus?.targetBetTurnover) >= 40 &&
                  this.onCalc(v.casinoBonus?.currentBetTurnover, v.casinoBonus?.targetBetTurnover) <= 70
                    ? '80%'
                    : '50%',
              }
            : null,
          liveCasinoBonus: v?.liveCasinoBonus
            ? {
                ...v.liveCasinoBonus,
                showIntro: false,
                isTargetBetDone: this.canWithdrawal(
                  v.liveCasinoBonus?.currentBetTurnover || 0,
                  v.liveCasinoBonus?.targetBetTurnover || 0,
                  v.liveCasinoBonus?.currentBetNum || 0,
                  v.liveCasinoBonus?.targetBetNum || 0,
                ),
                processed: this.onCalc(v.liveCasinoBonus?.currentBetTurnover, v.liveCasinoBonus?.targetBetTurnover),
                leftToWallet:
                  Number(v.liveCasinoBonus?.targetBetTurnover || 0).minus(v.liveCasinoBonus?.currentBetTurnover || 0) >
                  0
                    ? Number(v.liveCasinoBonus?.targetBetTurnover || 0).minus(
                        v.liveCasinoBonus?.currentBetTurnover || 0,
                      )
                    : 0,
                loading: false,
                submitLoading: false,
                intro: '',
                calc: `calc(${
                  this.onCalc(v.liveCasinoBonus?.currentBetTurnover, v.liveCasinoBonus?.targetBetTurnover) <= 3
                    ? 3
                    : this.onCalc(v.liveCasinoBonus?.currentBetTurnover, v.liveCasinoBonus?.targetBetTurnover)
                }% - 15px)`,
                typeCode: this.onFilterTypeCode(v.liveCasinoBonus?.typeCode, false),
                rates: `${v.liveCasinoBonus?.currentBetNum || 0}/${
                  v.liveCasinoBonus?.targetBetNum || 0
                } ${this.localeService.getValue('times_for_none')}`,
                isLocked: (v.liveCasinoBonus?.balance || 0) <= 0,
                isLeft:
                  this.onCalc(v.liveCasinoBonus?.currentBetTurnover, v.liveCasinoBonus?.targetBetTurnover) >= 40 &&
                  this.onCalc(v.liveCasinoBonus?.currentBetTurnover, v.liveCasinoBonus?.targetBetTurnover) <= 70
                    ? '80%'
                    : '50%',
              }
            : null,
        })),
      )
      .subscribe(data => {
        this.activatedCardsLoading.set(false);
        this.componentLoading.set(false);
        if (data) this.activatedCards.set(data);
      });
  }

  /**
   * 计算当前bar 值和位置
   *
   * @param current
   * @param target
   * @returns number;
   */
  onCalc(current: number, target: number): number {
    const processed = Number(current || 0)
      .divide(Number(target || 0))
      .subtract(100)
      .toFixed(2);
    if (Number(processed) >= 100) return 100;
    return Number(processed);
  }

  /**
   * 是否可以提现
   *
   * @param currentBetTurnover 当前投注额
   * @param targetBetTurnover 目标投注额
   * @param currentBetNum 当前投注次数
   * @param targetBetNum 目标投注次数
   * @returns boolean
   */
  canWithdrawal(
    currentBetTurnover: number,
    targetBetTurnover: number,
    currentBetNum: number,
    targetBetNum: number,
  ): boolean {
    if (currentBetTurnover >= targetBetTurnover && currentBetNum >= targetBetNum) return true;
    return false;
  }

  /**
   * 获取卡券介绍
   *
   * @param value
   */
  getNoneStickyDetail(value: NoneActivatedAttri) {
    value.loading = true;
    this.componentLoading.set(true);
    this.cardCenterService
      .getNoneStickyDetail({
        code: value.code,
        isDeposit: value.isDeposit,
        category: value.category,
        isFreeSpin: value.isFreeSpin,
      })
      .subscribe(data => {
        value.loading = false;
        this.componentLoading.set(false);
        value.intro = data?.content || '';
        value.showIntro = true;
      });
  }

  /** 获取未激活卡券 */
  getNoneInActivatedCards() {
    this.inActivatedCardsLoading.set(true);
    this.componentLoading.set(true);
    this.bonusApi
      .getNoneInActivatedCards()
      .pipe(
        map(v => {
          return {
            // casinoBonusList: [],
            // liveCasinoBonusList: [],
            casinoBonusList:
              (v?.casinoBonusList?.length || 0) > 0
                ? v?.casinoBonusList
                    ?.map(item => ({
                      ...item,
                      showIntro: false,
                      intro: '',
                      loading: false,
                      submitLoading: false,
                      typeCode: this.onFilterTypeCode(item?.typeCode, item.isDeposit),
                      rate: `${item?.rate || 0}%`,
                      // countryCheck: true,
                    }))
                    // 要過濾掉是免費旋轉又沒有providerCatId和gameId的
                    .filter(item =>
                      item.isFreeSpin
                        ? item.providerCatId !== null || item.gameId !== null
                        : item.providerCatId == null || item.gameId == null,
                    )
                : [],
            liveCasinoBonusList:
              (v?.liveCasinoBonusList?.length || 0) > 0
                ? v?.liveCasinoBonusList
                    ?.map(item => ({
                      ...item,
                      showIntro: false,
                      intro: '',
                      loading: false,
                      submitLoading: false,
                      typeCode: this.onFilterTypeCode(item?.typeCode, item.isDeposit),
                      rate: `${item?.rate || 0}%`,
                      // countryCheck: false,
                    }))
                    // 要過濾掉是免費旋轉又沒有providerCatId和gameId的
                    .filter(item =>
                      item.isFreeSpin
                        ? item.providerCatId !== null || item.gameId !== null
                        : item.providerCatId == null || item.gameId == null,
                    )
                : [],
          };
        }),
      )
      .subscribe(data => {
        this.inActivatedCardsLoading.set(false);
        this.componentLoading.set(false);
        if (data) {
          this.inActivatedCards.set(data);
        }
      });
  }

  /**
   * 激活卡的操作
   *
   * @param card card value
   */
  onHandleActiveCard(card: NoneActivatedAttri) {
    if (card.showIntro) {
      // 放弃
      this.popup.open(StandardPopupComponent, {
        data: {
          type: 'warn',
          content: this.localeService.getValue('give_up_bonus'),
          info: `
                <div class='give-up-none-sticky'>
                  <div class='give-up-text'>${card?.name || ''}</div>
                  <div class='give-up-text'>${this.localeService.getValue('none_sticky_popup_1')}</div>
                  <div class='give-up-text'>${this.localeService.getValue('none_sticky_popup_2')}:
                    <p class='give-up-text-number'>
                      ${Number(
                        String(this.currencyValue.transform(card?.balance || 0, card?.currency || 'USDT')).replace(
                          ',',
                          '',
                        ),
                      )} ${card?.currency || 'USDT'}
                    </p>
                  </div>
                  <div class='give-up-text'>${this.localeService.getValue('left_to_wallet')}:
                    <p class='give-up-text-number'>
                      ${Number(
                        String(this.currencyValue.transform(card?.leftToWallet || 0, card?.currency || 'USDT')).replace(
                          ',',
                          '',
                        ),
                      )}
                      ${card?.currency || 'USDT'}
                    </p>
                  </div>
                </div>
          `,
          buttons: [
            { text: this.localeService.getValue('cancels'), primary: false },
            { text: this.localeService.getValue('give_up_1'), primary: true },
          ],
          callback: () => {
            card.submitLoading = true;
            this.componentLoading.set(true);
            this.bonusApi.onDiscardNoneStickyCard({ code: card.code }).subscribe(data => {
              if (data) {
                this.toast.show({ message: this.localeService.getValue('give_up'), type: 'success' });
                this.getActivatedNoneSticky();
                this.getOverview();
                this.appService.assetChanges$.next({ related: 'Wallet' });
              } else {
                this.toast.show({ message: this.localeService.getValue('give_up_failed'), type: 'fail' });
              }
              card.submitLoading = false;
              this.componentLoading.set(false);
            });
          },
        },
      });
    } else {
      // 前往游戏界面
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/home/index`);
    }
  }

  /**
   * 未激活卡券 操作
   *
   * @param card
   * @param key
   */
  onHandleInactiveCard(card: NoneActivatedAttri, key: 'liveCasinoBonusList' | 'casinoBonusList') {
    if (card.isDeposit) {
      if (this.isUserNeedToVerify()) {
        // 走充值红利流程
        this.onBonusList(card);
      } else {
        // 判断用户 是否 已经做过初级KYC 并且 当前非粘性 是否符合注册kyc
        if (!card?.countryCheck) {
          // 不符合
          this.cardCenterService.onNonStickyCheckPopup();
        } else {
          // 走充值红利流程
          this.onBonusList(card);
        }
      }
    } else {
      if (card.isFreeSpin) {
        // 自动帮用户切换符合freeSpin币种
        if (this.appService.currentCurrency$.value.currency !== card.currency) {
          this.settingsService.setUserDefaultCurrency({ defaultCurrencyType: card.currency }, card.currency);
        }
        // 前往游戏界面
        if (card.providerCatId && card.gameId) {
          this.router.navigateByUrl(
            `${this.appService.languageCode}/casino/games/${card.providerCatId}/${card.gameId}`,
          );
        }
      } else {
        // 当前 娱乐场或者真人娱乐场已经 激活
        if (this.activatedCards()?.casinoBonus && key === 'casinoBonusList') {
          this.popup.open(StandardPopupComponent, {
            data: {
              type: 'warn',
              content: this.localeService.getValue('tips'),
              description: this.localeService.getValue('casino_tips'),
              buttons: [{ text: this.localeService.getValue('notice_dialog_ok'), primary: true }],
            },
          });
        } else if (this.activatedCards()?.liveCasinoBonus && key === 'liveCasinoBonusList') {
          this.popup.open(StandardPopupComponent, {
            data: {
              type: 'warn',
              content: this.localeService.getValue('tips'),
              description: this.localeService.getValue('live_casino_tips'),
              buttons: [{ text: this.localeService.getValue('notice_dialog_ok'), primary: true }],
            },
          });
        } else {
          // 允许激活
          this.componentLoading.set(true);
          card.submitLoading = true;
          this.bonusApi.onActivateNoneStickyCard({ code: card.code }).subscribe(data => {
            if (data) {
              this.getOverview();
              this.getActivatedNoneSticky();
              this.getNoneInActivatedCards();
              this.appService.assetChanges$.next({ related: 'Wallet' });
              this.toast.show({ message: this.localeService.getValue('active_success'), type: 'success' });
            } else {
              this.toast.show({ message: this.localeService.getValue('active_failed'), type: 'fail' });
            }
            this.componentLoading.set(false);
            card.submitLoading = false;
          });
        }
      }
    }
  }

  /**
   * 获取红利数据
   *
   * @param card
   */
  onBonusList(card: NoneActivatedAttri) {
    if (this.selectDepositBonusService.switchEuBonusFlow) {
      // 开启欧洲流程
      if (this.piqService.checkedLoading()) return;
      card.loading = true;
      this.selectDepositBonusService
        .getTopUpBonus(this.appService.currentCurrency$.value?.currency || 'USDT')
        .subscribe(data => {
          if (data?.length > 0) {
            this.cardCenterService.nonStickyWithKyc.set({
              bonusActivitiesNo: card.tmpCode,
              countryCheck: card.countryCheck,
            });
            this.piqService.seletedDividend.set(this.cardCenterService.onNoneStickyWithBonus(data));
            this.piqService.allowRoute.set(false);
            this.router.navigate([this.appService.languageCode, 'deposit']); // 路由中处理 欧/亚 用户
          }
          card.loading = false;
        });
    } else {
      // 未开启欧洲流程
      // 去 法币/虚拟充值页面认证/并保存当前 非粘性 红利 活动编号
      this.cardCenterService.nonStickyWithKyc.set({
        bonusActivitiesNo: card.tmpCode,
        countryCheck: card.countryCheck,
      });
      // 符合条件 前往充值页面
      this.router.navigateByUrl(`/${this.appService.languageCode}/deposit`);
    }
  }

  /** 一件领取全部 */
  onReceiveAll() {
    this.oneCallLoading.set(true);
    this.componentLoading.set(true);
    this.bonusApi.onWithdrawalAllCards().subscribe(data => {
      this.oneCallLoading.set(false);
      this.componentLoading.set(false);
      if (data) {
        this.getActivatedNoneSticky();
        this.getOverview();
        this.toast.show({ message: this.localeService.getValue('wd_success'), type: 'success' });
      } else {
        this.toast.show({ message: this.localeService.getValue('wd_fail'), type: 'fail' });
      }
    });
  }

  /**
   * 返回 对应的图片 名称
   *
   * @param typeCode 图片code
   * @param isDeposit 是否 需要存款 - true 需要 - false 不需要
   * @returns 图片字段
   */
  onFilterTypeCode(typeCode: string | null, isDeposit: boolean): string {
    // typecode 为 null 返回 slot game 图片
    if (typeCode === null) return 'slot';

    // 为充值卡时候， 如果不需要充值 返回 已充值图片
    if (typeCode === 'Deposit' && !isDeposit) {
      return 'Deposited';
    }

    return typeCode;
  }

  /**
   * 当cdn 图片删除时 换成 avatar-1
   *
   * @param imgElement
   */
  onImageError(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/images/card-center/Unknown.png';
  }
}
