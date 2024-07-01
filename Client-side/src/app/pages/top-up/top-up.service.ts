import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { PaymentListResponse } from 'src/app/shared/interfaces/deposit.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@Injectable({
  providedIn: 'root',
})
export class TopUpService {
  // dialog?: MatDialogRef<any>;

  constructor(
    private localeService: LocaleService,
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private bonusApi: BonusApi,
  ) {}
  /** 订阅faq list h5的时候使用 */
  h5FaqList$: BehaviorSubject<any> = new BehaviorSubject({});
  /** 法币充值(泰岳网银页面）数据 */
  vnThTransferOnlineCallBackData: BehaviorSubject<any> = new BehaviorSubject({});
  /** 法币充值电子钱包数据 */
  onlineTransfeCallBackData: BehaviorSubject<any> = new BehaviorSubject({});
  /** 第三方订单创建后数据 */
  orderInfor: any = {
    orderId: '',
    amount: '',
    symbol: '',
  };

  /**
   * 商户配置 虚拟货币充值时，是否启用手机验证
   *
   * @returns
   */
  get phoneVerifyCryptoDeposit(): boolean {
    return JSON.parse(this.appService.tenantConfig?.config?.phoneVerifyCryptoDeposit || 'false');
  }

  // openPopup(popup: any) {
  //   if (this.dialog) return;
  //   this.dialog = this.popup.open(popup, {
  //     inAnimation: 'fadeInUp',
  //     outAnimation: 'fadeOutDown',
  //     speed: 'fast',
  //     autoFocus: false,
  //   });
  // }

  // 关闭弹窗
  // closePopup() {
  //   this.dialog?.close();
  //   this.dialog = undefined;
  // }

  /**
   * 前往帮助中心
   *
   * @param isQueryRouter
   * @param item
   * @isQueryRouter 通过queryParams
   * @item faq 数据
   */
  jumpToPage(isQueryRouter: boolean, item?: any): void {
    if (isQueryRouter) {
      this.router.navigate([this.appService.languageCode, 'help-center', 'faq']);
    } else {
      this.router.navigate([this.appService.languageCode, 'help-center', 'faq', item.categoryId], {
        queryParams: {
          articleCode: item.id,
        },
      });
    }
  }

  /**
   * 处理 Paymentlist
   *
   * @param types
   * @param paymentList
   * @returns data
   */
  processPaymentlist(types: string[], paymentList: PaymentListResponse[], snowflakeMode = false) {
    const result: {
      typeName: string;
      key: number;
      isActive: boolean;
      list: PaymentListResponse[];
    }[] = [];

    // 压缩分组 用于 H5时候，超过两种支付类型，分为推荐、加密货币、其他支付
    // 下面的逻辑中：
    // -如果结果没有“其它”这个分类，那么如果某支付方式的 type 的标签 在 types 里没有，这个支付方式会被忽略
    // -如果结果有“其它”这个分类，即使 type 的标签 在 types 里没有，也会被归类到“其它”分类里
    if (this.layout.isH5$.value && types.length > 2) {
      // 处理推荐，这里前提是，返回的types里必须含有["推荐"]且要在types里排第一位，否则会出错
      const recommendName = types[0];
      const recommend = paymentList.filter(e => e.actionType !== 6 && e.type.includes(recommendName));
      if (recommend.length > 0) {
        result.push({
          typeName: recommendName,
          key: 0,
          isActive: false,
          list: recommend,
        });
      }

      // 处理加密货币类型
      const cryptoFiat = paymentList.find(x => x.actionType === 6);
      const cryptoFiatName = cryptoFiat?.type && cryptoFiat?.type[0];
      const cryptoFiatItem = cryptoFiatName && {
        typeName: cryptoFiatName,
        key: 1,
        isActive: false,
        list: [cryptoFiat],
      };
      if (cryptoFiatItem) result.push(cryptoFiatItem);

      // 处理其它
      const other = paymentList.filter(e => {
        // 过滤掉推荐的
        if (e.type.includes(recommendName)) return false;
        // 过滤掉加密货币的
        if (cryptoFiatItem && e.type.includes(cryptoFiatName)) return false;
        // 返回剩下的
        return true;
      });
      if (other.length > 0) {
        result.push({
          typeName: this.localeService.getValue('other_pay'),
          key: result.length,
          isActive: false,
          list: other,
        });
      }
    } else {
      // 不压缩 简单分类
      types.forEach(type => {
        const list = paymentList.filter(
          e =>
            e.type &&
            e.type.includes(type) &&
            (!snowflakeMode || result.every(x => x.list.every(y => y.code !== e.code))),
        );
        if (list.length > 0) {
          result.push({
            typeName: type,
            key: result.length,
            isActive: false,
            list: list,
          });
        }
      });
      if (result.length < 1) {
        result.push({
          typeName: this.localeService.getValue('other_pay'),
          key: 0,
          isActive: false,
          list: paymentList,
        });
      }
    }

    return result;
  }

  /**
   * 检查存续得法/提法得虚 是否为第一个返回值
   *
   * @param paymentList
   * @param actionType 6 为存虚得法 7 为提法得虚
   * @returns 返回boolean值
   */
  onCheckFiatToCrypto(paymentList: PaymentListResponse[], actionType: 6 | 7): boolean {
    // 第一个必须是 存虚或者提虚
    const firstElement = paymentList[0];
    if (firstElement && [firstElement].find(list => list?.actionType !== actionType)) return false;

    return true;
  }
}
