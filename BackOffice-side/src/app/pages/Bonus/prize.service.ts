import { Injectable } from '@angular/core';
import { Prize, PrizeAmountType, PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CurrencyValueService } from 'src/app/shared/pipes/currency-value.pipe';

interface typeItem {
  name: string;
  lang: string;
  value: PrizeType;
  typeName: string;
}

interface typeArray extends Array<typeItem> {
  getTypeName: (type: PrizeType) => string;
}

@Injectable({
  providedIn: 'root',
})
export class PrizeService {
  constructor(
    private lang: LangService,
    private currencyValueService: CurrencyValueService
  ) {}

  /**
   * 奖品类型列表
   */
  typeList: Array<typeItem> = [
    { name: '所有', typeName: '', lang: 'common.all', value: PrizeType.All },
    {
      name: '现金券',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.cashCoupon',
      value: PrizeType.Cash,
    },
    {
      name: '抵用金',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.credit',
      value: PrizeType.Credit,
    },
    {
      name: '后发现金券',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.goldCouponsLater',
      value: PrizeType.AfterCash,
    },
    {
      name: '实物',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.realObject',
      value: PrizeType.RealItem,
    },
    {
      name: '装备',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.equipment',
      value: PrizeType.Equipment,
    },
    {
      name: 'Free Spin',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.freespin',
      value: PrizeType.FreeSpin,
    },
    {
      name: 'SVIP体验券',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.svipExperienceCoupon',
      value: PrizeType.SvipEXP,
    },
    {
      name: '非粘性奖金',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.nonStickyBonus',
      value: PrizeType.NonStickyBonus,
    },
    {
      name: '粘性奖金',
      typeName: '',
      lang: 'member.activity.prizeCommon.configurationList.stickyBonus',
      value: PrizeType.StickyBonus,
    },
  ];

  /**
   * 获取翻译后的列表
   */
  async getTypeList() {
    const prizeTypeList = cloneDeep(this.typeList) as typeArray;
    for (const item of prizeTypeList) {
      item.typeName = (await this.lang.getOne(`${item.lang}`, { $defaultValue: '-' })) as string;
    }

    // 赋值获取翻译奖品类型方法
    prizeTypeList.getTypeName = (type: PrizeType | string) => {
      return (type && prizeTypeList.find((e) => e.value === type)?.typeName) || '-';
    };

    return prizeTypeList;
  }

  /**
   * 通过接口获取翻译name
   */
  getPrizeName(list: PrizeTypeItem[], type: number) {
    return list.find((e) => e.prizeTypeValue === type)?.prizeTypeName || '-';
  }

  /**
   * 获取奖品配置语言初始化
   */
  async getPrizeConfigLang() {
    const times = await this.lang.getOne('luckRoulette.times');
    const day = await this.lang.getOne('common.day');

    return this._getPrizeConfig.bind(this, { times, day });
  }

  /**
   * 获取奖品配置
   */
  private _getPrizeConfig(
    langObj: { times: string; day: string },
    value?: Pick<
      Prize,
      'prizeType' | 'amountType' | 'amount' | 'currency' | 'rate' | 'freeSpinTimes' | 'expirationDays'
    >
  ): string {
    if (!value) return '-';

    let res = '';

    switch (value.prizeType) {
      // 现金券 / 抵用券 / 后发现金券 / 非粘性奖金 / 粘性奖金
      case PrizeType.Cash:
      case PrizeType.Credit:
      case PrizeType.AfterCash:
      case PrizeType.NonStickyBonus:
      case PrizeType.StickyBonus:
        // 金额
        if (value.amountType === PrizeAmountType.Fixed) {
          res = value.amount + value.currency;
          // 比例
        } else if (value.amountType === PrizeAmountType.Rate) {
          res = value.rate + '%';
        }

        break;
      // Free Spin
      case PrizeType.FreeSpin:
        return value.freeSpinTimes + langObj.times;
      // SVIP体验券
      case PrizeType.SvipEXP:
        return value.expirationDays + langObj.day;
      default:
        res = '-';
        break;
    }

    return res;
  }

  /**
   * 获取显示的金额
   */
  getShowAmount(e: Pick<Prize, 'amount' | 'prizeType' | 'currency'>): string {
    return [PrizeType.SvipEXP, PrizeType.RealItem, PrizeType.Equipment, PrizeType.FreeSpin].includes(e.prizeType)
      ? '-'
      : this.currencyValueService.transform(e.amount, e.currency) + ' ' + e.currency;
  }
}
