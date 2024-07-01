import '../../../../common/lang/locale_lang.dart';
import '../../../../common/utils/util.dart';

class GamingWalletInfoModel {
  GamingWalletInfoModel(
      {required this.category,
      required this.providerId,
      required this.isFirst,
      this.totalBalance = 0.0,
      this.availBalanceForWithdraw = 0.0});

  String category;

  int providerId;
  double totalBalance;
  double availBalanceForWithdraw;
  //这个值来自于 子钱包余额查询的API
  double convertToUSDTrate = 0.0;
  // List<GamingUserBalance> currencies;
  bool isFirst;

  String get transferWalletCurrency {
    String callback = '';
    return callback;
  }

  String getWalletName() {
    String langKey = "${category.toLowerCase()}_wal";
    String findWalletName = localized(langKey);
    return findWalletName;
  }

  factory GamingWalletInfoModel.fromJson(dynamic map) {
    return GamingWalletInfoModel(
      category: map['category'].toString(),
      providerId: GGUtil.parseInt(map['providerId']),
      isFirst: map['isFirst'] == null ? true : GGUtil.parseBool(map['isFirst']),
    );
  }
}
