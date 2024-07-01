import 'package:gogaming_app/common/api/crypto_address/crypto_address_api.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/ewallet_payment_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../../helper/perimission_util.dart';
import '../../qr_code_scanner/qr_code_scanner_view.dart';

class CryptoAddressAddLogic extends BaseController {
  CryptoAddressAddLogic(this.ewalletPaymentList);

  final saveEnable = false.obs;
  final remarkController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(
        min: 4,
        max: 20,
        errorHint: localized('enter_tip01'),
      ),
    ],
  );
  late final addressController = GamingTextFieldController(
    validator: _cryptoValidator,
  );

  List<IGamingTextFieldValidator> get _ewalletValidator {
    return [
      GamingTextFieldValidator(
        reg: RegExp(paymentModel.value.walletAddressValid ?? ''),
        errorHint: localized('add_format_error'),
      ),
    ];
  }

  List<IGamingTextFieldValidator> get _cryptoValidator {
    return [
      GamingTextFieldValidator.length(
        min: 1,
        errorHint: localized('enter_addr00'),
      ),
      GamingTextFieldValidator.length(
        min: 34,
        errorHint: localized('add_format_error'),
      ),
    ];
  }

  /// 地址是否合法
  final addressPass = false.obs;

  /// 选中的币种
  final currency = () {
    const GamingCurrencyModel? value = null;
    return value.obs;
  }();

  /// 是否通用地址
  final isUniversalAddress = false.obs;

  /// 当前选中网络
  final networkModel = GamingCurrencyNetworkModel(name: '').obs;

  /// code=0数字货币/其他对应
  final paymentModel = EWalletPaymentListModel().obs;

  /// 电子钱包支付方式
  final List<EWalletPaymentListModel> ewalletPaymentList;
  List<EWalletPaymentListModel> get paymentList {
    final list = [
      EWalletPaymentListModel(name: localized('crypto'), code: '0')
    ];
    list.addAll(ewalletPaymentList);
    return list;
  }

  String get paymentName => paymentModel.value.name ?? '';

  /// 是否已经选中网络
  bool get isSelectNetwork =>
      networkModel.value.desc != null &&
      networkModel.value.network?.isNotEmpty == true;

  /// 是否已经选择支付方式
  bool get isSelectPayment => paymentModel.value.name?.isNotEmpty == true;

  List<GamingCurrencyNetworkListModel> get tokenNetworks =>
      CurrencyService().withdrawNetworks;

  List<GamingCurrencyModel> get currencyList {
    if (paymentModel.value.code == '0') {
      return CurrencyService().cryptoList;
    } else {
      return paymentModel.value.supportCurrency
              ?.map((e) =>
                  CurrencyService()[e] ??
                  GamingCurrencyModel(
                    currency: e,
                    isDigital: false,
                    isVisible: true,
                    sort: 0,
                  ))
              .toList() ??
          [];
    }
  }

  final addLoading = false.obs;

  final _showAutoMatchHint = false.obs;

  bool get showAutoMatchHint => _showAutoMatchHint.value;

  @override
  void onInit() {
    super.onInit();
    CurrencyService().getNetworks(CurrencyCategory.withdraw).listen((event) {
      updateReg();
    }, onError: (e) {});

    everAll([currency, isUniversalAddress], (callback) => _currencyChange());
    everAll(
        [addressPass, isUniversalAddress], (callback) => _autoMatchNetwork());

    /// 网络和币种的变化 计算合法地址规则
    everAll([currency, isUniversalAddress, networkModel],
        (callback) => updateReg());

    addressController.text.listen((p) {
      addressPass.value = addressController.isPass;
    });

    everAll([
      currency,
      isUniversalAddress,
      remarkController.text,
      addressPass,
      networkModel
    ], (callback) => checkParams());
  }

  /// 通用地址自动根据地址匹配网络
  void _autoMatchNetwork() {
    final matchNetwork = selectedNetworkList()
        ?.networks
        .where((e) => e.isPassAddress(addressController.text.value));
    if (isUniversalAddress.value && matchNetwork?.length == 1) {
      setNetWork(matchNetwork!.first);
      _showAutoMatchHint.value = true;
    } else {
      _showAutoMatchHint.value = false;
    }
  }

  void checkParams() {
    final coinPass =
        currency.value?.currency != null || isUniversalAddress.value;
    final remarkPass = remarkController.isPass;
    final addressPass = this.addressPass.value;
    final networkPass = isSelectNetwork;
    if (paymentModel.value.code != '0') {
      saveEnable.value = coinPass && remarkPass && addressPass;
    } else {
      saveEnable.value = coinPass && remarkPass && addressPass && networkPass;
    }
  }

  /// 币种变化 重置网络
  void _currencyChange() {
    networkModel(GamingCurrencyNetworkModel(name: ''));
  }

  GamingCurrencyNetworkListModel? selectedNetworkList() {
    final currency = this.currency.value?.currency;
    if (isUniversalAddress.value) {
      final list = CurrencyService().withdrawAllNetwork;
      return list.isNotEmpty
          ? GamingCurrencyNetworkListModel(currency: '', networks: list)
          : null;
    } else {
      final selectedItem = tokenNetworks
          .firstWhereOrNull((element) => element.currency == currency);
      return selectedItem;
    }
  }

  /// 更新地址规则
  void updateReg() {
    final value = selectedNetworkList();
    if (value == null || value.networks.isEmpty) return;

    // 不是通用地址&&已经选择网络,地址要符合选中网络的规则
    /// 其他情况要匹配币种对应网络的币种规则
    final reg = !isUniversalAddress.value && isSelectNetwork
        ? RegExp(networkModel.value.addressRegex!)
        : value.addressRegExp();
    addressController.validator = [
      GamingTextFieldValidator.length(
        min: 1,
        errorHint: localized('enter_addr00'),
      ),
      GamingTextFieldValidator(
          reg: reg, errorHint: localized('add_format_error')),
    ];
    if (addressController.isNotEmpty) {
      addressController.checkTextValid();
    }
    addressPass.value = addressController.isPass;
  }

  void setNetWork(GamingCurrencyNetworkModel model) {
    networkModel(model);
    // state._network(value);
    // _loadAddress();
  }

  void onPressScan() {
    GamingPermissionUtil.onlyCamera().then((value) {
      Get.to<String>(const QRCodeScannerPage())?.then((value) {
        if (value is String && value.isNotEmpty) {
          addressController.textController.text = value;
        }
      });
    });
  }

  void setCoins(GamingCurrencyModel model) {
    currency(model);
  }

  void setPayment(EWalletPaymentListModel payment) {
    paymentModel(payment);
    if (payment.code == '0') {
      addressController.validator = _cryptoValidator;
    } else {
      addressController.validator = _ewalletValidator;
    }
    addressController.textController.clear();
    currency.value = null;
    networkModel(GamingCurrencyNetworkModel(name: ''));
  }

  /// 添加电子钱包地址
  void addEWalletAddress(String key) {
    addLoading.value = true;
    PGSpi(CryptoAddress.addEWalletAddress.toTarget(inputData: {
      "remark": remarkController.text.value,
      "address": addressController.text.value,
      "isWhiteList": false, // 暂未实现白名单逻辑
      "currency": currency.value?.currency,
      "paymentMethod": paymentModel.value.code,
      "key": key
    })).rxRequest<bool>((value) {
      final data = value['data'];
      return data == true;
    }).listen((event) {
      addLoading.value = false;
      Toast.showSuccessful(localized('add_addr_s'));
      Get.back<dynamic>();
    }, onError: (Object error) {
      addLoading.value = false;
      if (error is GoGamingResponse) {
        Toast.showFailed(error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  /// 添加加密货币地址
  void addAddress(String key) {
    addLoading.value = true;
    PGSpi(CryptoAddress.addAddress.toTarget(inputData: {
      "remark": remarkController.text.value,
      if (!isUniversalAddress.value) "token": currency.value?.currency,
      "network": networkModel.value.network,
      "address": addressController.text.value,
      "isWhiteList": false, // 暂未实现白名单逻辑
      "key": key
    })).rxRequest<bool>((value) {
      final data = value['data'];
      return data == true;
    }).listen((event) {
      addLoading.value = false;
      Toast.showSuccessful(localized('add_addr_s'));
      Get.back<dynamic>();
    }, onError: (Object error) {
      addLoading.value = false;
      if (error is GoGamingResponse) {
        Toast.showFailed(error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

// @override
// void onClose() {
//   // TODO: implement onClose
//   super.onClose();
// }
}
