import { Component, DestroyRef, Inject, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter, mergeMap, take } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { PaymentIqService } from 'src/app/shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { SelectDepositBonusService } from '../select-deposit-bonus.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-select-dividend-dialog',
  templateUrl: './select-dividend-dialog.component.html',
  styleUrls: ['./select-dividend-dialog.component.scss'],
})
export class SelectDividendDialogComponent implements OnInit {
  constructor(
    private appService: AppService,
    private router: Router,
    public dialogRef: MatDialogRef<SelectDividendDialogComponent>,
    private piqService: PaymentIqService,
    private bonusApi: BonusApi,
    private toast: ToastService,
    private localeService: LocaleService,
    public selectDepositBonusService: SelectDepositBonusService,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: DialogDataSubmitCallback<unknown>;
      bonusList: BonusList[];
      currencyInfor?: any;
      seletedDividend?: BonusList;
      isShowTimes?: boolean;
      isPiq?: boolean;
      selectDepositMethod?: 'fiat' | 'crypto';
      // 兑换码
      couponCodeParams?: {
        amount: number;
        currency: string;
      };
    },
  ) {}

  /** 红利卡券 */
  bonusList: WritableSignal<BonusList[]> = signal(JSON.parse(JSON.stringify(this.data.bonusList)));
  renderBonusList = computed(() => {
    if (this.bonusList().length > 0) return this.bonusList();
    return [];
  });
  getActive = computed(() => {
    if (this.bonusList()?.filter(e => e?.isActive).length > 0) return this.bonusList()?.filter(e => e?.isActive)[0];
    return null;
  });

  bonusLoading: boolean = false;

  /** 选择按钮 */
  switchBtn: string[] = [this.localeService.getValue('use_coupon'), this.localeService.getValue('use_coupon_code')];

  /** 当前已经选择的 红利模式 */
  selectCurrentIndex: number = 0;

  /** 获取 coupon code loading */
  couponLoading: boolean = false;

  /** coupon 值 */
  couponValue: string = '';

  /** 默认币种 */
  defaultCurrency: string | null = null;

  ngOnInit() {
    if (this.data?.isPiq) {
      this.getBonusList();
    } else {
      this.dividendChange(this.data.seletedDividend);
    }
  }

  /** 用于PIQ 红利 */
  getBonusList() {
    this.bonusLoading = true;
    this.appService.currentCurrency$
      .pipe(
        filter(v => !!v),
        take(1),
        takeUntilDestroyed(this.destroyRef),
        mergeMap(currency => {
          this.defaultCurrency = currency?.currency || null;
          return this.selectDepositBonusService.getTopUpBonus(
            this.data.couponCodeParams?.currency || currency?.currency,
          );
        }),
      )
      .subscribe(data => {
        if (data?.length > 0) {
          this.bonusList.set(data);
          this.dividendChange(this.data.seletedDividend);
        }
        this.bonusLoading = false;
      });
  }

  /**
   * 切换卡券后再打开自动选中
   *
   * @param e
   */
  dividendChange(e?: BonusList) {
    if (e && Object.keys(e ?? {}).length > 0) {
      this.bonusList.set(
        this.bonusList().map(list => {
          if (list?.bonusActivitiesNo === e?.bonusActivitiesNo) {
            return {
              ...list,
              isActive: true,
            };
          }
          return {
            ...list,
            isActive: false,
          };
        }),
      );
    }
  }

  /**
   * 选择 当前的卡券
   *
   * @param item
   */
  handleSelected(item: BonusList) {
    this.bonusList.set(
      this.bonusList().map(list => {
        if (list?.bonusActivitiesNo === item?.bonusActivitiesNo) {
          return {
            ...list,
            isActive: true,
          };
        }
        return {
          ...list,
          isActive: false,
        };
      }),
    );
  }

  jumpToPage(page: string) {
    this.router.navigateByUrl(`/${this.appService.languageCode}/${page}`);
    this.close();
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /** 不限制红利 */
  cancelPopup() {
    this.bonusList.set(
      this.bonusList().map(list => ({
        ...list,
        isActive: false,
      })),
    );
    this.confirm();
  }

  confirm() {
    if (this.selectCurrentIndex === 0) {
      const item = this.getActive();
      this.data.callback(item);
      this.close();
    }

    if (this.selectCurrentIndex === 1) {
      this.onGetCouponCode();
    }
  }

  /**
   * 选择红利方式
   *
   * @param index
   */
  onSwitchBonusType(index: number) {
    this.selectCurrentIndex = index;
  }

  /**
   * coupon code 修改
   *
   * @param event
   */
  onCoupnValueChange(event: string) {
    this.couponValue = event;
  }

  onGetCouponCode() {
    if (!this.couponValue) return;
    this.couponLoading = true;
    this.bonusApi
      .getCoupondeposit({
        amount: this.data.couponCodeParams?.amount || 0,
        currency: this.data.couponCodeParams?.currency || this.defaultCurrency || '',
        couponCode: this.couponValue,
      })
      .subscribe(response => {
        const data = response?.data;
        if (data) {
          this.data.callback({
            ...data,
            rateVos: [
              {
                minDepositUsdt: data.minDepositUsdt,
                rate: data.returnPercentage,
              },
            ],
          });
          this.selectDepositBonusService.isCouponCodeWay = true;
          this.close();
        } else {
          if (response?.code === '2121') {
            this.toast.show({ message: response?.message || '', type: 'fail' });
          } else {
            this.toast.show({ message: this.localeService.getValue('exch_fail00'), type: 'fail' });
          }
        }
        this.couponLoading = false;
      });
  }
}
