import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/api/faq/models/gaming_faq_model.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/api/withdraw/models/gaming_withdraw_limit_model.dart';
import 'package:gogaming_app/common/api/withdraw/models/gaming_withdraw_result_model.dart';
import 'package:gogaming_app/common/api/withdraw/withdraw_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_withdrawal_network_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_withdrawal_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_withdrawal_address_book_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/digital_currency_withdrawal/digital_currency_withdrawal_view.dart';
import 'package:gogaming_app/widget_header.dart';
import '../../common/components/number_precision/number_precision.dart';
import '../../common/service/secure_service.dart';
import '../../helper/perimission_util.dart';
import '../qr_code_scanner/qr_code_scanner_view.dart';

part 'digital_currency_withdrawal_state.dart';

class DigitalCurrencyWithdrawalLogic extends BaseController
    with SingleRenderControllerMixin {
  DigitalCurrencyWithdrawalLogic({this.inputCurrency = ''});
  late final String? inputCurrency;
  final state = DigitalCurrencyWithdrawalState();
  List<GGUserBalance> myBalanceList = [];
  RxBool isLoad = false.obs;
  List<GamingCurrencyNetworkListModel> tokenNetworks = [];
  GamingCurrencyNetworkListModel? selectedNetWorkToken;
  RxBool showNetworkMatch = false.obs;
  RxBool showNetworkWidgetTip = false.obs;
  final limitOverlay = GamingOverlay();
  RxBool enableNext = false.obs;
  RxBool isWithdraw = false.obs;

  /// 能得到的货币
  RxString getCanReceive = '0'.obs;
  RxString numTipStr = ''.obs;

  /// 是否显示最小提币数量
  RxBool showMinCoin = false.obs;
  RegExp? reg;
  RxBool isLoadAllNetWorks = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadAllNetworks();
    state.addressController = GamingTextFieldController(
      onChanged: _addressOnChanged,
    );
    state.numTextFieldController = GamingTextFieldController(
      onChanged: _numOnChanged,
    );
    _loadUserBalances();
    _loadNetWork();
    _loadFAQ();

    Map<String, dynamic> dataMap = {"actionvalue1": 0};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickTransfer, dataMap: dataMap);
  }

  void _addressOnChanged(String v) {
    if (v.isEmpty) {
      state.addressError.value = localized('enter_wd_curr_ad');
      showNetworkWidgetTip.value = false;
      showMinCoin.value = false;
    } else if (reg != null && !reg!.hasMatch(v)) {
      state.addressError.value = localized('add_format_error');
      showNetworkWidgetTip.value = false;
      showMinCoin.value = false;
    } else {
      state.addressError.value = '';
      showNetworkWidgetTip.value = true;
      showMinCoin.value = true;
      onNetWorkSelect();
    }
  }

  void _numOnChanged(String v) {
    if (v.isEmpty) {
      numTipStr.value = '';
    } else if (GGUtil.parseDouble(v) >
        GGUtil.parseDouble(state.limit?.availQuota)) {
      numTipStr.value = localized('too_big');
    } else if (GGUtil.parseDouble(v) <
        GGUtil.parseDouble(state.network?.minAmount)) {
      numTipStr.value = localized('less_than_single');
    } else {
      numTipStr.value = '';
    }
    getReceive();
    validateWithdrawNext();
  }

  void _loadAllNetworks() {
    isLoadAllNetWorks.value = true;
    CurrencyService().getNetworks(CurrencyCategory.withdraw).listen((event) {
      state._networks = event;
      isLoadAllNetWorks.value = false;
    });
  }

  void onNetWorkSelect() {
    if (state.addressController.textController.text.isEmpty ||
        state.addressError.value.isNotEmpty) {
      return;
    }

    //检查是否存在唯一匹配的网络
    List<GamingCurrencyNetworkModel>? matchWorks =
        selectedNetWorkToken?.matchNetworks(state.addressController.text.value);
    if (matchWorks != null && matchWorks.length == 1) {
      onCryptoNetworkSelected(matchWorks.first);
      showNetworkMatch.value = true;
    } else {
      showNetworkMatch.value = false;
    }
  }

  bool checkNetWorkIsMatch() {
    if (state.network == null) return false;

    List<GamingCurrencyNetworkModel>? matchWorks =
        selectedNetWorkToken?.matchNetworks(state.addressController.text.value);
    if (matchWorks == null) return false;
    for (var item in matchWorks) {
      if (item.network == state.network?.network) {
        return true;
      }
    }
    return false;
  }

  void onPressScan() {
    GamingPermissionUtil.onlyCamera().then((value) {
      Get.to<String>(const QRCodeScannerPage())?.then((value) {
        if (value is String && value.isNotEmpty) {
          state.addressController.textController.text = value;
        }
      });
    });
  }

  void onCryptoNetworkSelected(GamingCurrencyNetworkModel? network) {
    state.networkModel = network;
    state._network.value = network;
    getReceive();
    validateWithdrawNext();
  }

  void _loadNetWork() {
    PGSpi(Currency.networks.toTarget(
      input: {
        'category': 'Withdraw',
      },
    ))
        .rxRequest<List<GamingCurrencyNetworkListModel>>((value) {
          return (value['data'] as List)
              .map((e) => GamingCurrencyNetworkListModel.fromJson(
                  e as Map<String, dynamic>))
              .toList();
        })
        .doOnData((event) {
          tokenNetworks = event.data;
          updateReg(state.currency?.currency ?? '');
        })
        .doOnError((p0, p1) {})
        .listen((event) {});
  }

  void _loadFAQ() {
    PGSpi(Faq.getArticleByTag.toTarget(
      input: {
        'ClientType': 'App',
        'Tag': 'DigitalCurrencyWithdrawal',
      },
    )).rxRequest<List<GamingFaqModel>>((value) {
      return (value['data'] as List<dynamic>?)
              ?.map((e) => GamingFaqModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).doOnData((event) {
      state._faqData.value = event.data;
    }).doOnError((p0, p1) {
      loadCompleted(state: LoadState.failed);
    }).listen((event) {});
  }

  void updateSelectCoin(String currency) {
    GGUserBalance findBalance = myBalanceList.firstWhere(
        (element) => element.currency == currency,
        orElse: () => myBalanceList.first);

    if (findBalance.currency == currency) {
      setCurrency(findBalance);
    }
  }

  void updateReg(String currency) {
    if (currency.isEmpty || tokenNetworks.isEmpty) return;
    GamingCurrencyNetworkListModel selectedItem = tokenNetworks.firstWhere(
        (element) => element.currency == currency,
        orElse: () => tokenNetworks.first);
    if (selectedItem.currency == currency) {
      reg = selectedItem.addressRegExp();
      selectedNetWorkToken = selectedItem;
    }
  }

  Stream<void> onLoadStreamData() {
    loadCompleted(state: LoadState.loading);
    final now = DateTime.now();
    final end =
        DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final start = end.subtract(const Duration(days: 30));
    return PGSpi(History.crypto.toTarget(
      input: {
        'category': 'Withdraw',
        'StartTime': start.millisecondsSinceEpoch,
        'EndTime': end.millisecondsSinceEpoch,
        'PageIndex': 1,
        'PageSize': 3,
      },
    )).rxRequest<GoGamingPagination<GamingCryptoHistoryModel>>((value) {
      return GoGamingPagination<GamingCryptoHistoryModel>.fromJson(
        itemFactory: (e) => GamingCryptoHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      state._data.value = event.data;
      loadCompleted(state: LoadState.successful);
    }).doOnError((p0, p1) {
      loadCompleted(state: LoadState.failed);
    });
  }

  @override
  void Function()? get onLoadData =>
      () => onLoadStreamData().listen(null, onError: (p0, p1) {});

  void _loadUserBalances() async {
    myBalanceList = AccountService.sharedInstance.userBalances
        .toList()
        .where((element) => element.isDigital == true)
        .toList();

    if (myBalanceList.isEmpty) {
      AccountService.sharedInstance.fetchUserBalance().listen((event) {
        myBalanceList = AccountService.sharedInstance.userBalances
            .toList()
            .where((element) => element.isDigital == true)
            .toList();
      }, onError: (Object e) {
        if (e is GoGamingResponse) {
          Toast.showFailed(e.message);
        } else {
          Toast.showTryLater();
        }
      });
    }
    if (myBalanceList.isNotEmpty) {
      if (inputCurrency != '') {
        GGUserBalance balance = myBalanceList.firstWhere(
            (element) => element.currency == inputCurrency,
            orElse: () => myBalanceList.first);
        setCurrency(balance);
      } else {
        setCurrency(myBalanceList[0]);
      }
    }
  }

  void _loadData() {
    isLoad.value = true;
    CurrencyService.sharedInstance.updateRate().listen((p0) {}, onDone: () {
      isLoad.value = false;
    }, onError: (v) {
      isLoad.value = false;
    });
  }

  void selectCurrency() {
    _loadData();
    GamingCurrencyWithdrawalSelector.show(
      original: myBalanceList,
      isLoad: isLoad,
      onLoadComplate: (list) {},
    ).then((value) {
      if (value != null) {
        setCurrency(value);
      }
    });
  }

  void setCurrency(GGUserBalance value) {
    if (state.currencyBalance?.currency != null &&
        state.currencyBalance?.currency != value.currency) {
      state.networkModel = null;
      state._network.value = null;
    }
    state.currencyBalance = value;
    state._currency(value);
    updateReg(value.currency ?? '');
    numTipStr.value = '';
    state.numTextFieldController.textController.text = '';
    setAddress(null);
    _loadLimit();
    _addressOnChanged(state.addressController.textController.text);
  }

  /// 查看冻结等限制
  void _loadLimit() {
    if (state.currencyBalance?.currency == null ||
        state.currencyBalance?.currency == '') {
      return;
    }
    state.hasFreeze.value = false;

    state.limitModel = null;
    state._limitModel(null);

    PGSpi(Withdraw.getQuotaLimit.toTarget(input: {
      'currencyType': state.currencyBalance?.currency ?? '',
    })).rxRequest<GamingWithdrawLimitModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        GamingWithdrawLimitModel model =
            GamingWithdrawLimitModel.fromJson(data);
        return model;
      } else {
        return null;
      }
    }).listen((event) {
      if (event.success) {
        _updateLimit(event.data!);
      }
    }).onError((Object error) {});
  }

  void _updateLimit(GamingWithdrawLimitModel model) {
    state.limitModel = model;
    state._limitModel(model);
    if (state.limitModel?.freezeAmount != null &&
        state.limitModel!.freezeAmount > 0) {
      state.hasFreeze.value = true;
    } else {
      state.hasFreeze.value = false;
    }
  }

  void getReceive() {
    if (state.numTextFieldController.textController.text.isEmpty) {
      getCanReceive.value = '0';
    }
    double total =
        GGUtil.parseDouble(state.numTextFieldController.textController.text);
    double fee = state.network?.withdrawFee ?? 0;
    getCanReceive.value =
        NumberPrecision(total).minus(NumberPrecision(fee)).toString();
  }

  void selectNetwork() {
    Widget widget = Container(
      height: 48.dp,
      margin: EdgeInsets.only(bottom: 24.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: GGColors.success.color.withOpacity(0.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Gaps.hGap16,
          Image.asset(
            R.commonToastSuccess,
            width: 18.dp,
            height: 18.dp,
          ),
          Gaps.hGap8,
          Expanded(
            child: Text(
              localized('auto_fil'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.success.color,
              ),
            ),
          ),
        ],
      ),
    );
    GamingCurrencyWithdrawalNetworkSelector.show(
      category: CurrencyCategory.withdraw,
      currency: state.currency!.currency!,
      original: state._networks[state.currency!.currency!],
      tipWidget: showNetworkWidgetTip.value ? widget : Container(),
      address: showNetworkWidgetTip.value
          ? state.addressController.textController.text
          : '',
      onLoadComplate: (v) {},
    ).then((value) {
      if (value != null) {
        onCryptoNetworkSelected(value);
      }
    });
  }

  void addressBookSelect() {
    if (state._networks.isEmpty) {
      _loadAllNetworks();
    }

    if (state.curNetworks.isEmpty) {
      state._curNetworks.value =
          state._networks[state.currency!.currency!] ?? [];
    }

    GamingWithdrawalAddressBookSelector.show(
      category: CurrencyCategory.withdraw,
      currency: state.currency!.currency!,
      networks: state._networks[state.currency!.currency!] ?? [],
      isLoadAllNetWorks: isLoadAllNetWorks,
    ).then((value) {
      setAddress(value);
    });
  }

  void setAddress(CryptoAddressModel? address) {
    state.selectAddressModel = address;
    state._selectAddress.value = address;
    state.addressController.textController.text = address?.address ?? '';
    List<GamingCurrencyNetworkModel> list =
        state._networks[state.currency!.currency!] ?? [];
    for (int i = 0; i < list.length; i++) {
      GamingCurrencyNetworkModel model = list[i];
      if (model.network == address?.network) {
        onCryptoNetworkSelected(model);
      }
    }
  }

  /// 检查可否点击下一步
  void validateWithdrawNext() {
    enableNext.value = validateWithdrawNextEnable();
  }

  bool validateWithdrawNextEnable() {
    if (state.addressError.isNotEmpty && state.useNewAddress.value) {
      return false;
    }

    if ((state.addressController.textController.text.isEmpty ||
            !reg!.hasMatch(state.addressController.textController.text)) &&
        state.useNewAddress.value) {
      return false;
    }

    if ((state.selectAddress == null) && !state.useNewAddress.value) {
      return false;
    }

    if (numTipStr.value.isNotEmpty ||
        state.numTextFieldController.textController.text.isEmpty) {
      return false;
    }

    if (state.currency == null) {
      return false;
    }

    if (state.network == null && state.useNewAddress.value) {
      return false;
    }

    if (GGUtil.parseDouble(state.numTextFieldController.textController.text) ==
        0) {
      return false;
    }

    // 选择的地址和选择的网络不匹配，返回false
    if (checkNetWorkIsMatch() == false) {
      return false;
    }
    return true;
  }

  void reset() {
    showNetworkMatch.value = false;
    state.addressError.value = '';
    state.addressController.textController.text = '';
    state.numTextFieldController.textController.text = '';
    onCryptoNetworkSelected(null);
    setAddress(null);
  }

  void changeToNewAddress() {
    state.useNewAddress.value = true;
    reset();
  }

  void changeToAddressBook() {
    state.useNewAddress.value = false;
    if (state._networks.isEmpty) {
      _loadAllNetworks();
    }
    reset();
  }

  /// 提款
  void withdraw() {
    if (state.useNewAddress.value == false) {
      // 向已经绑定了的钱包提款
      if (SecureService.sharedInstance.checkSecureOnly()) {
        // 有绑定2fa
        _finalWithdraw('');
      } else {
        // 没有绑定 2fa
        if (SecureService.sharedInstance.checkSecure()) {
          Get.toNamed<dynamic>(Routes.secure.route, arguments: {
            'otpType': VerifyAction.withdraw.value,
            'on2FaSuccess': (String code) => _finalWithdraw(code),
          });
        }
      }
    } else {
      // 新地址需要判断2fa认证
      if (SecureService.sharedInstance.checkSecure()) {
        Get.toNamed<dynamic>(Routes.secure.route, arguments: {
          'otpType': VerifyAction.withdraw,
          'on2FaSuccess': (String code) => _finalWithdraw(code),
        });
      }
    }
  }

  void _finalWithdraw(String token) {
    isWithdraw.value = true;
    Map<String, dynamic> params = {
      "amount":
          GGUtil.parseDouble(state.numTextFieldController.textController.text),
      "currency": state.currency?.currency,
      "network": state.network?.network,
      "key": token,
    };
    if (state.useNewAddress.value) {
      // 新地址 传地址过去
      params["address"] = state.addressController.textController.text;
    } else {
      //通讯录的地址。传id过去
      params["addressId"] = GGUtil.parseStr(state.selectAddress?.id);
    }

    PGSpi(Withdraw.withdraw.toTarget(inputData: params))
        .rxRequest<GamingWithdrawResultModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        GamingWithdrawResultModel model =
            GamingWithdrawResultModel.fromJson(data);
        return model;
      } else {
        return null;
      }
    }).listen((event) {
      isWithdraw.value = false;
      if (event.success == true) {
        GamingEvent.signalrUpdateBalance.notify();

        if (event.data is GamingWithdrawResultModel) {
          GamingWithdrawResultModel model =
              event.data as GamingWithdrawResultModel;
          Get.back<dynamic>();
          Get.to<void>(() => DigitalWithdrawalResultView(
                withdrawModel: model,
              ));
        }
        GlobalSetting.sharedInstance.queryNormalRiskFormAndDialog();
      }
    }).onError((Object error) {
      isWithdraw.value = false;
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }
}
