import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/widget_header.dart';
import '../../../../service/currency/currency_service.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

/// 卡券状态
enum GamingCouponStatus {
  pending, // 待领取
  received, // 已领取
  using, // 使用中
  used, // 已使用
  expired, // 已失效
  review, // 审核中
  reject, // 审核拒绝
}

/// 兑换记录
class GamingCouponExchangeRecord {
  String? exchangeCode;
  String? name;
  int? createTime;
  GamingCouponExchangeRecord({
    this.exchangeCode,
    this.name,
    this.createTime,
  });

  factory GamingCouponExchangeRecord.fromJson(Map<String, Object?> json) {
    return GamingCouponExchangeRecord(
      exchangeCode: json['exchangeCode'] as String?,
      name: json['name'] as String?,
      createTime: json['createTime'] as int?,
    );
  }
}

class GamingCouponModel {
  GamingCouponModel(
      {this.id,
      this.currency,
      this.title,
      this.introduction,
      this.expiredTime,
      this.createdTime,
      this.activityType,
      this.grantType,
      this.cardStatus,
      this.amount,
      this.balance,
      this.multiCurrency,
      this.bonusRate,
      this.isAccumulate,
      this.receiveTime,
      this.vipLevel,
      this.activitiesNo,
      this.withdrawFlowMultiple,
      this.labels,
      this.maxBetRate,
      this.maxBetAmount,
      this.minBetLimit});

  int? id; // 卡券id（主键）

  String? currency; // 币种

  String? title; // 标题

  String? introduction; // 卡券简介

  int? expiredTime; // 到期时间，时间戳 13 位

  int? createdTime; // 发放时间，时间戳 13 位
  int? receiveTime; // 领取时间，时间戳 13 位
  int? vipLevel; // 发放卡券时候的vip等级
  String? activitiesNo; // 红利活动编号
  int? withdrawFlowMultiple; // 取款流水倍数
  List<String>? labels; // 活动关联的标签
  double? maxBetRate; // 单笔抵扣，百分比
  double? maxBetAmount; // 最高可抵扣 USDT
  double? minBetLimit; // 最低投注额
  String? activityType; // [ Bonus, Vip ]

  /// 发放方式 Cash:现金券,Coupon:抵用金,SVIP:SVIP体验券,inKind:实物,Equip:装备,FreeSpin:Free Spin,Later:后发现金券
  String? grantType; // [ Cash, Coupon ]

  String? cardStatus; // 卡片状态 Unclaimed, Received, InUse, Used, Invalid, Review, Rejected

  num? amount; // 卡卷金额

  num? balance; // 卡卷余额

  Map<String, dynamic>? multiCurrency; // 多币种 key:币种名 value:金额

  double? bonusRate; // 奖金比列

  bool? isAccumulate; // 卡券是否累加

  // 用于拖拽排序的key
  ValueKey<int> get sortKey => ValueKey(id!);

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency ?? '');
  }

  bool get isCash => grantType == 'Cash';
  bool get isCoupon => grantType == 'Coupon';
  bool get isSvip => grantType == 'SVIP';

  String? get activityTypeText {
    if (activityType == 'Vip') {
      return localized('vip_bene00');
    }
    return null;
  }

  String? get grantTypeText {
    switch (grantType) {
      case 'Cash':
        return localized('cash_coupons');
      case 'Coupon':
        return localized('select_coupon');
      case 'SVIP':
        return localized('svip_coupon');
      case 'inKind':
        return localized('physical_coupon');
      case 'Equip':
        return localized('equipment_coupon');
      case 'FreeSpin':
        return localized('free_spin_coupon');
      case 'Later':
        return localized('later_cash_coupon');
      default:
        return null;
    }
  }

  factory GamingCouponModel.fromJson(Map<String, Object?> json) {
    return GamingCouponModel(
      id: json['id'] as int?,
      currency: json['currency'] as String?,
      title: json['title'] as String?,
      introduction: json['introduction'] as String?,
      expiredTime: asT<int?>(json['expiredTime']),
      createdTime: asT<int?>(json['createdTime']),
      receiveTime: asT<int?>(json['receiveTime']),
      vipLevel: json['vipLevel'] as int?,
      activitiesNo: json['activitiesNo'] as String?,
      withdrawFlowMultiple: json['withdrawFlowMultiple'] as int?,
      labels: List<String>.from(json['labels'] as List<dynamic>? ?? []),
      maxBetRate: json['maxBetRate'] as double?,
      maxBetAmount: json['maxBetAmount'] as double?,
      minBetLimit: json['minBetLimit'] as double?,
      activityType: json['activityType'] as String?,
      grantType: json['grantType'] as String?,
      cardStatus: json['cardStatus'] as String?,
      amount: json['amount'] as num?,
      balance: json['balance'] as num?,
      bonusRate: json['bonusRate'] as double?,
      multiCurrency: json['multiCurrency'] as Map<String, dynamic>?,
      isAccumulate: json['isAccumulate'] as bool?,
    );
  }
}

/// 卡券类型数据
class GamingCouponTypeModel {
  GamingCouponTypeModel({
    this.title,
    this.typeCode,
    this.grantType,
    this.total,
  });

  String? title;
  String? typeCode;
  String? grantType;
  int? total;

  factory GamingCouponTypeModel.fromJson(Map<String, Object?> json) {
    return GamingCouponTypeModel(
      title: json['title'] as String?,
      typeCode: json['typeCode'] as String?,
      grantType: json['grantType'] as String?,
      total: json['total'] as int?,
    );
  }
}

/// 卡券状态数据
class GamingCouponStatusModel {
  GamingCouponStatusModel({
    this.statusCode,
    this.categoryDescription,
  });

  String? statusCode;
  String? categoryDescription;

  factory GamingCouponStatusModel.fromJson(Map<String, Object?> json) {
    return GamingCouponStatusModel(
      statusCode: json['code']?.toString(),
      categoryDescription: json['description']?.toString(),
    );
  }
}

/// 抵用金使用详情
class GamingCouponCreditDetailModel {
  GamingCouponCreditDetailModel({
    this.wagerNum,
    this.amount,
    this.isWin,
    this.consumeAmount,
    this.currency,
  });

  String? wagerNum; //交易单号

  num? amount; //交易金额

  bool? isWin; // 是否赢 true：赢 false：输

  num? consumeAmount; // 抵用金消耗金额

  /// [ Unknown, CNY, USD, THB, VND, AUD, JPY, EUR, GBP, NZD, CAD, BTC, ETH, USDT, TRX, USDC ]
  String? currency;

  factory GamingCouponCreditDetailModel.fromJson(Map<String, Object?> json) {
    return GamingCouponCreditDetailModel(
      wagerNum: json['wagerNum']?.toString(),
      amount: json['amount'] as num?,
      isWin: json['isWin'] as bool?,
      consumeAmount: json['consumeAmount'] as num?,
      currency: json['currency']?.toString(),
    );
  }
}

/// 返水详情
class GamingCoupoRebateDetailModel {
  GamingCoupoRebateDetailModel({
    this.currency,
    this.orderNum,
    this.amount,
    this.createdTime,
    this.cardStatus,
  });

  String? currency; //
  String? orderNum; // 订单号
  num? amount; // 领取金额
  DateTime? createdTime; // 领取时间
  String? cardStatus;

  factory GamingCoupoRebateDetailModel.fromJson(Map<String, Object?> json) {
    return GamingCoupoRebateDetailModel(
      currency: json['currency']?.toString(),
      orderNum: json['orderNum']?.toString(),
      cardStatus: json['cardStatus']?.toString(),
      amount: json['amount'] as num?,
      createdTime: DateTime.fromMillisecondsSinceEpoch(
          (json['createdTime'] as int?) ?? 0),
    );
  }
}

GamingCouponStatus gamingCouponStatusFromCardStatus(String cardStatus) {
  // Unclaimed, Received, InUse, Used, Invalid, Review, Rejected
  // 无人认领、已接收、使用中、已使用、无效 审核中 审核被拒
  GamingCouponStatus status = GamingCouponStatus.pending; // 卡券状态
  if (cardStatus == "Unclaimed") {
    status = GamingCouponStatus.pending;
  } else if (cardStatus == "Received") {
    status = GamingCouponStatus.received;
  } else if (cardStatus == "InUse") {
    status = GamingCouponStatus.using;
  } else if (cardStatus == "Used") {
    status = GamingCouponStatus.used;
  } else if (cardStatus == "Invalid") {
    status = GamingCouponStatus.expired;
  } else if (cardStatus == "Review") {
    status = GamingCouponStatus.review;
  } else if (cardStatus == "Rejected") {
    status = GamingCouponStatus.reject;
  }
  return status;
}

/// 卡券状态
enum GamingCouponButtonLayoutType {
  general, // 常规灰色
  action, // 待领取(可点击)
  border, // 有边框
}

class GamingCouponLayoutValue {
  final GamingCouponButtonLayoutType buttonType;
  final String buttonText;
  final String currencyName; // 币种
  final String currencyAmount; // 币的数量
  final String title; //
  final List<String> tags; // 标签列表
  final String introduce; // 介绍
  final String currencyExplainText; // 币种解释(可以为null，null则不显示感叹号)
  final GamingCouponModel metadata;
  final bool showDetail;

  GamingCouponLayoutValue({
    required this.showDetail,
    required this.buttonType,
    required this.buttonText,
    required this.currencyName,
    required this.currencyAmount,
    required this.title,
    required this.tags,
    required this.introduce,
    required this.currencyExplainText,
    required this.metadata,
  });
}

extension Layout on GamingCouponModel {
  String get currencyExplainText =>
      (multiCurrency != null && (multiCurrency ?? {}).isNotEmpty)
          ? (multiCurrency ?? {})
              .keys
              .map((e) => "$e ${(multiCurrency ?? {})[e].toString()}")
              .toList()
              .join("\n")
          : "";

  GamingCouponLayoutValue mapToLayoutValue(
      List<GamingCouponStatusModel>? couponStatusList) {
    GamingCouponModel metadata = this;
    GamingCouponStatus status =
        gamingCouponStatusFromCardStatus(cardStatus ?? ''); // 卡券状态
    String currencyAmount = status == GamingCouponStatus.using
        ? NumberPrecision(metadata.balance)
            .balanceText(metadata.isDigital)
            .stripTrailingZeros()
        : NumberPrecision(metadata.amount)
            .balanceText(metadata.isDigital)
            .stripTrailingZeros();
    GamingCouponButtonLayoutType buttonType =
        GamingCouponButtonLayoutType.general;
    String statusText = "";
    if (status == GamingCouponStatus.pending) {
      buttonType = GamingCouponButtonLayoutType.action;
    } else if (status == GamingCouponStatus.using) {
      buttonType = GamingCouponButtonLayoutType.border;
    }
    GamingCouponStatusModel? statusModel =
        couponStatusList?.firstWhereOrNull((element) {
      return element.statusCode == cardStatus;
    });
    statusText = statusModel?.categoryDescription ?? (cardStatus ?? '');

    bool showDetail = false;
    if (isCash && isAccumulate == true) {
      showDetail = true;
    }

    if (isCoupon && status == GamingCouponStatus.using) {
      showDetail = true;
    }

    List<String> tags = [];
    if (activityTypeText != null) {
      tags.add(localized("vip_bene00"));
    }
    String introduce = '';
    final maxBetRate = this.maxBetRate?.toInt();
    if (grantTypeText != null) {
      tags.add(grantTypeText!);
    }
    if (labels is List<String>) {
      tags.addAll(labels ?? []);
    }
    if (isCash) {
      introduce =
          '${FeeService().wdLimit}: $withdrawFlowMultiple ${localized('times')}';
    } else if (isCoupon) {
      if (GGUtil.parseDouble(minBetLimit) > 0) {
        // 这里产品要求最大和最小投注的币种都不使用接口返回的数据。全部写死为USDT
        introduce =
            '${localized("single_credit")}$maxBetRate%，${localized("max_de")}$maxBetAmount'
            "USDT，"
            '${localized("min_de")}$minBetLimit'
            'USDT';
      } else {
        introduce =
            '${localized("single_credit")}$maxBetRate%，${localized("max_de")}$maxBetAmount$currency';
      }
    }

    return GamingCouponLayoutValue(
      buttonType: buttonType,
      buttonText: statusText,
      currencyName: metadata.currency ?? "",
      currencyAmount: currencyAmount,
      title: metadata.title ?? '',
      tags: tags,
      introduce: introduce,
      currencyExplainText: currencyExplainText,
      metadata: metadata,
      showDetail: showDetail,
    );
  }
}
