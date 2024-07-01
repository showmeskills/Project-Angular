import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/api/currency/models/ewallet_payment_list_model.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';

class CryptoAddressListState {
  CryptoAddressListState() {
    ///Initialize variables
  }

  late final search = GamingTextFieldController(
    onChanged: (text) => keyword.value = text,
  );
  final keyword = ''.obs;

  /// 电子钱包支付方式
  List<EWalletPaymentListModel> ewalletPaymentList = [];

  List<CryptoAddressModel> addressList = [];
  final displayList = <CryptoAddressModel>[].obs;

  final openWhiteList = false.obs;

  /// 用于筛选的参数
  String? currency;
  bool? isWhiteList;
  bool? isUniversalAddress;
  int? walletAddressType;
  String? paymentMethod;
}
