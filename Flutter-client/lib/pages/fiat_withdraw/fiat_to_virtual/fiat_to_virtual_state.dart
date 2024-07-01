import '../../../common/api/crypto_address/models/crypto_address_model.dart';
import '../../../common/api/currency/models/gaming_currency_model.dart';
import '../../../common/api/currency/models/gaming_currency_network_model.dart';
import '../../../common/api/currency/models/gaming_currency_virtual_rate_model.dart';
import '../../../common/api/base/base_api.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

class FiatToVirtualState {
  GamingCurrencyVirtualRateModel? _currentRate;
  late final currentRate = _currentRate.obs;

  Map<String, List<GamingCurrencyNetworkModel>> networks = {};

  GamingCurrencyNetworkModel? _networkModel;
  late final network = _networkModel.obs;

  /// 当前可选货币
  RxList<GamingCurrencyModel> currencyList = <GamingCurrencyModel>[].obs;

  /// 当前选中的货币的所有网络
  final curNetworks = <GamingCurrencyNetworkModel>[].obs;

  /// 当前选中虚拟货币
  RxString currency = ''.obs;

  RxDouble amountValue = 0.0.obs;

  RxBool submitEnable = false.obs;

  /// 是否是使用新地址
  RxBool useNewAddress = true.obs;

  /// 地址簿选择的地址
  CryptoAddressModel? _selectAddressModel;
  late final selectAddress = _selectAddressModel.obs;

  ///地址错误提示语
  RxString addressError = ''.obs;

  /// 是否可以输入地址
  /// 只有在选择网络后允许输入
  RxBool editAddress = false.obs;

  /// 提币地址输入框
  late GamingTextFieldController addressController;
}
