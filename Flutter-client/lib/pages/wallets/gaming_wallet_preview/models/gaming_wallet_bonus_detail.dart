import '../../../../common/components/number_precision/number_precision.dart';
import '../../../../common/utils/util.dart';

class GamingWalletBonusDetail {
  /// 金额 usdt
  double amount;

  /// 活动名称
  String bonusName;

  /// 活动对应的code
  String typeCode;

  /// 当前币种
  String currency;

  GamingWalletBonusDetail({
    required this.amount,
    required this.bonusName,
    required this.typeCode,
    required this.currency,
  });

  String get balanceText {
    return NumberPrecision(amount).balanceText(false);
  }

  factory GamingWalletBonusDetail.fromJson(dynamic map) {
    return GamingWalletBonusDetail(
        amount: GGUtil.parseDouble(map['amount']),
        bonusName: GGUtil.parseStr(map['bonusName']),
        currency: GGUtil.parseStr(map['currency']),
        typeCode: GGUtil.parseStr(map['typeCode']));
  }
}
