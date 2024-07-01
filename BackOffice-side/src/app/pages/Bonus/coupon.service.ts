import { Injectable } from '@angular/core';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CouponTypeEnum } from 'src/app/shared/interfaces/coupon';

interface typeItem {
  name: string;
  lang: string;
  value: CouponTypeEnum;
}

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private lang: LangService) {}

  /** 优惠卷类型列表 */
  typeList: Array<typeItem> = [
    {
      name: '现金券',
      lang: 'member.coupon.cashCoupon',
      value: CouponTypeEnum.CashCoupons,
    },
    {
      name: '抵用券',
      lang: 'member.coupon.bettingCredit',
      value: CouponTypeEnum.Voucher,
    },
    {
      name: 'SVIP体验券',
      lang: 'member.coupon.model.experienceVolume',
      value: CouponTypeEnum.SVIPExperienceCoupon,
    },
    {
      name: '非粘性奖金',
      lang: 'member.activity.prizeCommon.configurationList.nonStickyBonus',
      value: CouponTypeEnum.NonStickyBonus,
    },
    {
      name: '免费旋转',
      lang: 'member.activity.prizeCommon.configurationList.freespin',
      value: CouponTypeEnum.FreeSpin,
    },
  ];

  /**
   * 通过类型获取翻译
   */
  getCouponTypeLang(type: number) {
    return this.typeList.find((e) => e.value === type)?.lang || 'common.unknown';
  }
}
