import 'package:base_framework/src.widget/render_view/render_view.dart';

// import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/api/crypto_address/crypto_address_api.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/ewallet_payment_list_model.dart';

// import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/crypto_address/crypto_address_filter/crypto_address_filter_logic.dart';

import '../../../common/service/event_service.dart';
import 'crypto_address_list_state.dart';

class CryptoAddressListLogic extends BaseController
    with RefreshControllerMixin {
  late final CryptoAddressListState state = Get.put(CryptoAddressListState());

  Worker? _searchWorker;
  final isEditing = false.obs;
  final isSelectAll = false.obs;
  final _selected = <int>[].obs;

  List<int> get selected => _selected;

  bool get selectedAll => selected.length == state.displayList.length;

  @override
  void onInit() {
    super.onInit();
    _updateWhiteListSwitch();
    _searchWorker = debounce<String>(
      state.keyword,
      time: 1.seconds,
      _searchWithWord,
    );

    GamingEvent.updateWhiteListSwitch.subscribe(_updateWhiteListSwitch);

    Get.put(CryptoAddressFilterLogic());
  }

  void _updateWhiteListSwitch() {
    state.openWhiteList.value =
        AccountService.sharedInstance.gamingUser?.hasWhiteList ?? false;
  }

  void reloadData() {
    reInitial();
  }

  void setSelectAll(bool selected) {
    isSelectAll.value = selected;
    if (selected) {
      _selected.assignAll(state.displayList.map((e) => e.id ?? 0));
    } else {
      _selected.clear();
    }
    update();
  }

  void select(int id, bool selected) {
    if (selected) {
      _selected.add(id);
    } else {
      _selected.remove(id);
    }
    update([id]);
  }

  void changeIsEditing() {
    isEditing.value = !isEditing.value;
    setSelectAll(false);
    // walletFilterList.forEach((element) {
    //   element.selected = false;
    // });
    update();
  }

  void updateWhiteList(List<int> ids, String secureToken, bool isJoin) {
    PGSpi(CryptoAddress.batchUpdateWhiteList.toTarget(inputData: {
      "ids": ids,
      "isJoin": isJoin,
      "key": secureToken,
    })).rxRequest<bool>((value) {
      final data = value['data'];
      return data == true;
    }).listen((event) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.success,
        title: localized('hint'),
        message: isJoin ? localized("addwhite_s") : localized('rewhite_s'),
      );
      onRefresh?.call(1);
    }, onError: (Object error) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: isJoin ? localized('addwhite_f') : localized("rewhite_f"),
        message: error.toString(),
      );
    });
  }

  void deleteAddress(List<int> ids, String secureToken) {
    PGSpi(CryptoAddress.batchDelete.toTarget(inputData: {
      "ids": ids,
      "key": secureToken,
    })).rxRequest<bool>((value) {
      final data = value['data'];
      return data == true;
    }).listen((event) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.success,
        title: localized('hint'),
        message: localized('dele_add_s'),
      );
      onRefresh?.call(1);
    }, onError: (Object error) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('dele_add_f'),
        message: error.toString(),
      );
    });
  }

  void _searchWithWord(String v) {
    updateDisplayList();
  }

  void updateDisplayList() {
    final keyWord = state.keyword.value;
    final searchResult = state.addressList.where((element) {
      bool match = true;
      if (keyWord.isNotEmpty) {
        match = element.address!.toLowerCase().contains(keyWord.toLowerCase());
      }
      return match;
    }).toList();
    state.displayList.assignAll(searchResult);
    refreshCompleted(
      state: LoadState.successful,
      total: state.displayList.length,
      hasMoreData: false,
    );
  }

  Stream<GoGamingResponse<List<EWalletPaymentListModel>>>
      getEWalletPaymentList() {
    if (state.ewalletPaymentList.isNotEmpty) {
      return Stream.value(GoGamingResponse(
        success: true,
        code: '200',
        data: state.ewalletPaymentList,
      ));
    }
    return PGSpi(Currency.geteWalletPaymentList.toTarget())
        .rxRequest<List<EWalletPaymentListModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => EWalletPaymentListModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    });
  }

  Stream<GoGamingResponse<List<CryptoAddressModel>>> getAddressList() {
    return PGSpi(CryptoAddress.getTokenAddress.toTarget(
            input: {
      'currency': state.currency,
      'isWhiteList': state.isWhiteList,
      'isUniversalAddress': state.isUniversalAddress,
      'walletAddressType': state.walletAddressType,
      'paymentMethod': state.paymentMethod,
    }..removeWhere((key, value) => value == null)))
        .rxRequest<List<CryptoAddressModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => CryptoAddressModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    });
  }

  /// * 钱包类型[walletAddressType]为1即数字货币时，支付方式[paymentMethod]为null
  /// * 钱包类型[walletAddressType]为2即电子钱包时，通用地址[isUniversalAddress]为null
  /// * 不限制时，通用地址和支付方式都为null
  void setFilter({
    String? currency,
    bool? isWhiteList,
    bool? isUniversalAddress,
    int? walletAddressType,
    String? paymentMethod,
  }) {
    state.currency = currency;
    state.isWhiteList = isWhiteList;
    state.walletAddressType = walletAddressType;
    if (state.walletAddressType == 1) {
      state.isUniversalAddress = isUniversalAddress;
      state.paymentMethod = null;
    } else if (state.walletAddressType == 2) {
      state.paymentMethod = paymentMethod;
      state.isUniversalAddress = null;
    } else {
      state.isUniversalAddress = null;
      state.paymentMethod = null;
    }
  }

  @override
  LoadCallback? get onRefresh => (p1) {
        refreshCompleted(state: LoadState.loading);
        getEWalletPaymentList()
            .doOnData((event) {
              if (event.success) {
                state.ewalletPaymentList = event.data;
                Get.findOrNull<CryptoAddressFilterLogic>()
                    ?.setEWalletPaymentList(event.data);
              }
            })
            .flatMap((value) => getAddressList().doOnData((event) {
                  if (event.success) {
                    state.addressList = event.data;
                    updateDisplayList();
                  }
                }))
            .listen((event) {
              refreshCompleted(
                state: LoadState.successful,
                total: state.displayList.length,
                hasMoreData: false,
              );
            }, onError: (error) {
              refreshCompleted(state: LoadState.failed);
            });
      };

  @override
  void onClose() {
    super.onClose();
    _searchWorker?.dispose();
  }
}
