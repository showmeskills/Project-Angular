import 'package:gogaming_app/pages/wallets/gaming_wallet_preview/models/gaming_wallet_bonus_detail.dart';

import 'gaming_overview_main_wallet.dart';
import 'gaming_overview_transfer_wallet.dart';

class GamingWalletOverviewModel {
  String uid;
  double totalAsset;
  double totalBonus;

  /// 非粘性奖金
  num totalNonStickyBonus;
  List<GamingWalletBonusDetail> bonusDetail;
  GamingOverviewMainWalletModel overviewWallet;
  List<GamingOverviewTransferWalletModel> transferWallet;
  List<GamingOverviewNonStickyBonusWallet> nonStickyBonusWallet;

  GamingWalletOverviewModel({
    required this.uid,
    this.totalAsset = 0,
    this.totalBonus = 0,
    this.totalNonStickyBonus = 0,
    required this.bonusDetail,
    required this.overviewWallet,
    this.transferWallet = const [],
    this.nonStickyBonusWallet = const [],
  });

  @override
  String toString() {
    return 'GamingWalletOverviewModel(uid: $uid, totalAsset: $totalAsset, totalBonus: $totalBonus, bonusDetail: $bonusDetail, overviewWallet: $overviewWallet, transferWallet: $transferWallet, totalNonStickyBonus: $totalNonStickyBonus)';
  }

  factory GamingWalletOverviewModel.fromJson(Map<String, Object?> json) {
    return GamingWalletOverviewModel(
      uid: json['uid'] as String,
      totalAsset: (json['totalAsset'] as num?)?.toDouble() ?? 0,
      totalBonus: (json['totalBonus'] as num?)?.toDouble() ?? 0,
      totalNonStickyBonus: (json['totalNonStickyBonus'] as num?) ?? 0,
      bonusDetail: (json['bonusDetail'] as List<dynamic>?)
              ?.map((e) =>
                  GamingWalletBonusDetail.fromJson(e as Map<String, Object?>))
              .toList() ??
          [],
      overviewWallet: GamingOverviewMainWalletModel.fromJson(
          json['overviewWallet']! as Map<String, Object?>),
      transferWallet: (json['transferWallet'] as List<dynamic>?)
              ?.map((e) => GamingOverviewTransferWalletModel.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
      nonStickyBonusWallet: (json['nonStickyBonusWallet'] as List<dynamic>?)
              ?.map((e) => GamingOverviewNonStickyBonusWallet.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'uid': uid,
        'totalAsset': totalAsset,
        'totalBonus': totalBonus,
        'bonusDetail': bonusDetail,
        'totalNonStickyBonus': totalNonStickyBonus,
        'overviewWallet': overviewWallet.toJson(),
        'transferWallet': transferWallet.map((e) => e.toJson()).toList(),
        'nonStickyBonusWallet':
            nonStickyBonusWallet.map((e) => e.toJson()).toList(),
      };

  GamingWalletOverviewModel copyWith({
    String? uid,
    double? totalAsset,
    double? totalBonus,
    num? totalNonStickyBonus,
    List<GamingWalletBonusDetail>? bonusDetail,
    GamingOverviewMainWalletModel? overviewWallet,
    List<GamingOverviewTransferWalletModel>? transferWallet,
  }) {
    return GamingWalletOverviewModel(
      uid: uid ?? this.uid,
      totalAsset: totalAsset ?? this.totalAsset,
      totalBonus: totalBonus ?? this.totalBonus,
      totalNonStickyBonus: totalNonStickyBonus ?? this.totalNonStickyBonus,
      bonusDetail: bonusDetail ?? this.bonusDetail,
      overviewWallet: overviewWallet ?? this.overviewWallet,
      transferWallet: transferWallet ?? this.transferWallet,
    );
  }
}
