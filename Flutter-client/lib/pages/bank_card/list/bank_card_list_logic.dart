// ignore_for_file: invalid_use_of_protected_member

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/bank_card/bank_card_api.dart';
import 'package:gogaming_app/common/api/bank_card/models/gaming_bank_card_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/secure_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

class BankCardListLogic extends GetxController with RefreshControllerMixin {
  final RxList<GamingBankCardModel> _data = <GamingBankCardModel>[].obs;
  List<GamingBankCardModel> get data => _data.value;

  final _batch = false.obs;
  bool get batch => _batch.value;

  final _selected = <int>[].obs;
  List<int> get selected => _selected.value;
  bool get selectedAll => selected.length == data.length;

  bool get canAddBankCard {
    /// 亚洲流程不需要判断 KYC 中级，允许用户添加银行卡
    if (KycService.sharedInstance.isAsia) {
      return true;
    }
    return KycService.sharedInstance.intermediatePassed;
  }

  @override
  void onInit() {
    super.onInit();
    ever<List<GamingBankCardModel>>(_data, (v) {
      refreshCompleted(
        state: LoadState.successful,
        hasMoreData: false,
        total: v.length,
      );
    });
  }

  @override
  LoadCallback get onRefresh => (p1) {
        refreshCompleted(
          state: LoadState.loading,
          hasMoreData: false,
        );
        onLoadDataStream().doOnData((event) {
          _data.assignAll(event);
        }).doOnError((err, p1) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(
            state: LoadState.failed,
            hasMoreData: false,
          );
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<List<GamingBankCardModel>> onLoadDataStream() {
    return PGSpi(BankCard.getBankCard.toTarget())
        .rxRequest<List<GamingBankCardModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingBankCardModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void setDefault(int id) {
    SmartDialog.showLoading<void>();
    PGSpi(BankCard.updateDefault.toTarget(inputData: {'id': id}))
        .rxRequest<Map<String, dynamic>>((value) {
      return value;
    }).doOnData((event) {
      _data.assignAll(data.map((element) {
        if (element.isDefault) {
          return element.copyWith(isDefault: false);
        }
        if (element.id == id) {
          return element.copyWith(isDefault: true);
        }
        return element;
      }).toList()
        ..sort((a, b) => b.isDefault ? 1 : 0));
      Toast.showSuccessful(localized('def_card_s'));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showFailed(localized('def_card_f'));
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  void delete(int id) {
    _verify2fa(action: VerifyAction.delBankCard, id: [id]);
  }

  void batchDelete() {
    _verify2fa(action: VerifyAction.batchDelBankCard, id: selected.toList());
  }

  void _verify2fa({
    required VerifyAction action,
    required List<int> id,
  }) {
    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'otpType': action,
        'on2FaSuccess': (String code) =>
            _delete(action: action, id: id, code: code),
      });
    }
  }

  void _delete({
    required VerifyAction action,
    required List<int> id,
    required String code,
  }) {
    SmartDialog.showLoading<void>();
    late PGSpi<GoGamingTarget<GoGamingApi>> api;
    if (action == VerifyAction.batchDelBankCard) {
      api = PGSpi(BankCard.batchDelete.toTarget(
        inputData: {
          'ids': id,
          'key': code,
        },
      ));
    } else {
      api = PGSpi(BankCard.delete.toTarget(
        inputData: {
          'id': id.first,
          'key': code,
        },
      ));
    }
    api.rxRequest<Object?>((value) {
      return null;
    }).doOnData((event) {
      if (action == VerifyAction.batchDelBankCard) {
        if (selectedAll) {
          toggleBatch();
        } else {
          _selected.clear();
        }
      }
      _data.assignAll(
          data.toList()..removeWhere((element) => id.contains(element.id)));
      Toast.showSuccessful(localized('dele_card_s'));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showFailed(localized('dele_card_f'));
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  void toggleBatch() {
    if (batch) {
      _selected.clear();
    }
    _batch(!batch);
  }

  void selectAll() {
    if (!selectedAll) {
      _selected.assignAll(data.map((e) => e.id));
    } else {
      _selected.clear();
    }
  }

  void select(int id, bool selected) {
    if (selected) {
      _selected.add(id);
    } else {
      _selected.remove(id);
    }
  }
}
