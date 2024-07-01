import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';

class BonusService {
  /// [filter] removeWhere过滤
  static Stream<List<GamingBonusActivityModel>> loadBonus({
    required String currency,
    double? amount,
    String? payment,
    bool Function(GamingBonusActivityModel)? filter,
  }) {
    return PGSpi(Bonus.getActivity.toTarget(
      input: {
        'Currency': currency,
        'PaymentMethod': payment,
        'Amount': amount ?? 100000.0,
      },
    )).rxRequest<List<GamingBonusActivityModel>>((value) {
      return (value['data'] as List<dynamic>?)
              ?.map((e) =>
                  GamingBonusActivityModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      List<GamingBonusActivityModel> list = value.data;
      if (filter != null) {
        list = list..removeWhere(filter);
      }
      return Stream.value(list);
    });
  }

  static GamingBonusActivityModel? setDefaultBonus({
    required List<GamingBonusActivityModel> list,
    required GamingBonusActivityModel? bonus,
    String? bonusActivitiesNo,
    bool unknowtmpcode = false,
  }) {
    if (list.isEmpty || unknowtmpcode) {
      return null;
    } else {
      // 未选择红利或者当前选择的红利不在列表内
      if (bonusActivitiesNo?.isEmpty ?? true) {
        // bonus未赋值或者list里没有这个bonus则尝试使用第一个红利
        if (bonus == null ||
            !list.any((element) =>
                element.bonusActivitiesNo == bonus!.bonusActivitiesNo)) {
          bonus = list.firstWhereOrNull((e) =>
              e.bonusActivitiesNo != 'couponcodedeposit' &&
              e.bonusActivityName.isNotEmpty);
        }
      } else {
        final result = list.firstWhereOrNull((element) {
          return element.bonusActivitiesNo == bonusActivitiesNo;
        });
        if (result != null) {
          bonus = result;
        } else {
          bonus = list.firstWhereOrNull((e) =>
              e.bonusActivitiesNo != 'couponcodedeposit' &&
              e.bonusActivityName.isNotEmpty);
        }
      }
      return bonus;
    }
  }

  static Stream<GoGamingResponse<bool>> submitPIQBonus({
    String? bonusActivitiesNo,
  }) {
    return PGSpi(Bonus.piqDepositBonus.toTarget(
      inputData: {
        'activityNo': bonusActivitiesNo ?? 'unknowtmpcode',
      },
    )).rxRequest<bool>((value) {
      return value['data'] as bool? ?? false;
    });
  }

  static Stream<GoGamingResponse<bool>> submitCryptoBonus({
    String? bonusActivitiesNo,
  }) {
    return PGSpi(Bonus.cryptoDepositBonus.toTarget(
      inputData: {
        'activityNo': bonusActivitiesNo ?? 'unknowtmpcode',
      },
    )).rxRequest<bool>((value) {
      return value['data'] as bool? ?? false;
    });
  }
}
