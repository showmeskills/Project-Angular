import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';

class FiatToEBState {
  RxDouble amountValue = 0.0.obs;

  RxBool submitEnable = false.obs;

  ///地址错误提示语
  RxString addressError = ''.obs;

  /// 0新地址 1地址簿地址
  final addressType = 0.obs;

  /// 地址簿选择的地址
  late final selectAddress = () {
    CryptoAddressModel? selectAddressModel;
    return selectAddressModel.obs;
  }();
}
