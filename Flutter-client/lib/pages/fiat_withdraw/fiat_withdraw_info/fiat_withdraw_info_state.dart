import '../../../common/api/bank_card/models/gaming_bank_card_model.dart';
import '../../../common/api/base/base_api.dart';
import '../../../common/widgets/gaming_overlay.dart';

class FiatWithdrawInfoState {
  final bankTipOverlay = <GamingOverlay>[].obs;
  RxDouble amountValue = 0.0.obs;

  /// 当前选中银行卡，初始为默认
  GamingBankCardModel? _selectBankCard;
  late final selectBankCard = _selectBankCard.obs;

  RxBool submitEnable = false.obs;

  final bankCardData = <GamingBankCardModel>[].obs;
}
