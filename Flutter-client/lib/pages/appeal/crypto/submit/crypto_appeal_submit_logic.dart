import 'dart:async';

import 'package:gogaming_app/common/api/appeal/appeal_api.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_network_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/widget_header.dart';

part 'crypto_appeal_submit_state.dart';

class CryptoAppealSubmitLogic extends BaseController {
  final state = CryptoAppealSubmitState();

  final numberTextFieldController = GamingTextFieldController();
  final txidTextFieldController = GamingTextFieldController();

  Worker? _worker;

  Map<String, dynamic> toSubmitTarget() {
    return {
      'currency': state.currency!.currency!,
      'network': state.network!.network!,
      'amount': double.parse(numberTextFieldController.text.value),
      'txId': txidTextFieldController.text.value,
    };
  }

  @override
  void onInit() {
    super.onInit();
    _worker = everAll([
      state._currency,
      state._network,
      numberTextFieldController.text,
      txidTextFieldController.text
    ], (v) {
      state._enable.value = state.currency != null &&
          state.network != null &&
          numberTextFieldController.text.isNotEmpty &&
          txidTextFieldController.text.isNotEmpty;
    });
  }

  @override
  void onClose() {
    _worker?.dispose();
    super.onClose();
  }

  Future<void> selectCurrency() {
    return GamingCurrencySelector.show(
      title: localized('sel_coin'),
      isDigital: true,
    ).then((value) {
      if (value != null) {
        setCurrency(value);
      }
    });
  }

  void setCurrency(GamingCurrencyModel value) {
    if (state.currency?.currency != null &&
        state.currency?.currency != value.currency) {
      state._network.value = null;
    }
    state._currency(value);
  }

  void selectNetwork() {
    final Completer<String> completer = Completer();
    if (state.currency == null) {
      selectCurrency().then((value) {
        completer.complete(state.currency!.currency!);
      });
    } else {
      completer.complete(state.currency!.currency!);
    }
    completer.future.then((value) {
      GamingCurrencyNetworkSelector.show(
        category: CurrencyCategory.deposit,
        currency: value,
        original: state._networks[value],
        onLoadComplate: (v) {
          state._networks = v;
        },
      ).then((value) {
        if (value != null) {
          state._network(value);
        }
      });
    });
  }

  void checkTXIDExists() {
    state._exist.value = false;
    state._loading.value = true;
    PGSpi(Appeal.checkTXIDExists.toTarget(
      input: {
        'currency': state.currency!.currency,
        'txId': txidTextFieldController.text.value,
      },
    )).rxRequest<bool>((value) {
      return value['data'] as bool;
    }).doOnData((event) {
      state._exist.value = event.data;
      if (!event.data) {
        Get.toNamed<void>(Routes.cryptoAppealConfirm.route);
      } else {
        Toast.showFailed(localized('sys_unava'));
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state._loading.value = false;
    }).listen(null, onError: (p0, p1) {});
  }
}
