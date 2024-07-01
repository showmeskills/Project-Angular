import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/utils/util.dart';

import 'gaming_currency_payment_tips_model.dart';

class GamingCurrencyPaymentModel {
  String code;
  List<String> type;
  String category;
  String name;
  double minAmount;
  double maxAmount;
  double fee;
  String? desc;
  List<String> icons;

  /// 固定金额选项
  List<num> fixedAmounts;
  int actionType;
  bool needBankCode;
  List<GamingCurrencyPaymentTipsModel> tipsInfo;
  bool? isNeedWalletAddress;

  /// 是否推荐方式
  bool? isRecommend;
  String? walletAddressValid;

  /// 人工通道
  bool get isArtificial => code == 'OverTheCounterTransfer';

  /// actionType = 6 数字货币类（目前正式环境不支持，用来做排除的字段）
  bool get isCrypto => actionType == 6;

  /// actionType = 3 电子钱包类（需要提交redirectUrl）
  bool get isEWallet => actionType == 3;

  /// actionType = 2，需要提交redirectUrl 和 bankCode
  bool get isHtmlOnlineBank => actionType == 2;

  /// actionType = 2，需要提交userName
  bool get isBankTransfer => actionType == 1;

  /// actionType = 6，存虚拟币得法币
  bool get isDepositVirtualGetCurrency => actionType == 6;

  String get feeText => fee.stripTrailingZeros();

  String get minAmountText => minAmount.stripTrailingZeros();

  String get maxAmountText => maxAmount.stripTrailingZeros();

  String get operateContent {
    return tipsInfo
        .singleWhere(
          (element) => element.tipsType == 'Operate',
          orElse: () => GamingCurrencyPaymentTipsModel(tipsType: 'Operate'),
        )
        .content;
  }

  bool get showRecommend {
    return isRecommend ?? false;
    // return GGUtil.parseStr(code).toLowerCase() == 'ebpayqrcode' ||
    //     GGUtil.parseStr(code).toLowerCase() == 'topayqrcode';
  }

  String get depositContent {
    return tipsInfo
        .singleWhere(
          (element) => element.tipsType == 'Deposit',
          orElse: () => GamingCurrencyPaymentTipsModel(tipsType: 'Deposit'),
        )
        .content;
  }

  String get detailContent {
    return tipsInfo
        .singleWhere(
          (element) => element.tipsType == 'Detail',
          orElse: () => GamingCurrencyPaymentTipsModel(tipsType: 'Detail'),
        )
        .content;
  }

  GamingCurrencyPaymentModel({
    required this.code,
    required this.type,
    required this.category,
    this.name = '',
    required this.minAmount,
    required this.maxAmount,
    required this.fee,
    this.desc,
    this.icons = const [],
    this.fixedAmounts = const [],
    required this.actionType,
    required this.needBankCode,
    this.tipsInfo = const [],
    this.isRecommend,
  });

  @override
  String toString() {
    return 'PaymentList(code: $code, type: $type, category: $category, name: $name, minAmount: $minAmount, maxAmount: $maxAmount, fee: $fee, desc: $desc, icons: $icons, actionType: $actionType, needBankCode: $needBankCode, tipsInfo: $tipsInfo)';
  }

  factory GamingCurrencyPaymentModel.fromJson(Map<String, Object?> json) =>
      GamingCurrencyPaymentModel(
        code: json['code'] as String,
        type: List<String>.from(json['type'] as List<dynamic>? ?? []),
        category: json['category'] as String,
        name: json['name'] as String? ?? '',
        minAmount: (json['minAmount'] as num).toDouble(),
        maxAmount: (json['maxAmount'] as num).toDouble(),
        fee: (json['fee'] as num).toDouble(),
        desc: json['desc'] as String?,
        icons: List<String>.from(json['icons'] as List<dynamic>? ?? []),
        fixedAmounts:
            List<num>.from(json['fixedAmounts'] as List<dynamic>? ?? []),
        actionType: json['actionType'] as int,
        needBankCode: json['needBankCode'] as bool,
        isRecommend: GGUtil.parseBool(json['isRecommend']),
        tipsInfo: (json['tipsInfo'] as List<dynamic>?)
                ?.map((e) => GamingCurrencyPaymentTipsModel.fromJson(
                    e as Map<String, Object?>))
                .toList() ??
            [],
      );

  Map<String, Object?> toJson() => {
        'code': code,
        'type': type,
        'category': category,
        'name': name,
        'minAmount': minAmount,
        'maxAmount': maxAmount,
        'fee': fee,
        'desc': desc,
        'icons': icons,
        'actionType': actionType,
        'needBankCode': needBankCode,
        'isRecommend': isRecommend,
        'tipsInfo': tipsInfo.map((e) => e.toJson()).toList(),
      };

  GamingCurrencyPaymentModel copyWith({
    String? code,
    List<String>? type,
    String? category,
    String? name,
    double? minAmount,
    double? maxAmount,
    double? fee,
    String? desc,
    List<String>? icons,
    int? actionType,
    bool? needBankCode,
    List<GamingCurrencyPaymentTipsModel>? tipsInfo,
  }) {
    return GamingCurrencyPaymentModel(
      code: code ?? this.code,
      type: type ?? this.type,
      category: category ?? this.category,
      name: name ?? this.name,
      minAmount: minAmount ?? this.minAmount,
      maxAmount: maxAmount ?? this.maxAmount,
      fee: fee ?? this.fee,
      desc: desc ?? this.desc,
      icons: icons ?? this.icons,
      actionType: actionType ?? this.actionType,
      needBankCode: needBankCode ?? this.needBankCode,
      tipsInfo: tipsInfo ?? this.tipsInfo,
    );
  }
}
