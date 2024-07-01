import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_account_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_transfer_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/game_config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/pages/Transfer/transfer_result.dart';
import 'package:flutter/material.dart';

import '../../common/api/wallet/models/gg_user_balance.dart';
part 'transfer_state.dart';

class TransferLogic extends BaseController {
  TransferLogic({this.category = ''});

  final state = TransferState();
  late final String? category;
  GamingCurrencyModel? currencyModel;
  RxBool success = true.obs;
  RxBool enableNext = false.obs;
  RxBool isTransfer = false.obs;
  RxBool isToBig = false.obs;
  RxBool showTip = false.obs;
  RxBool isLoadWallets = false.obs;

  /// 没有主账户
  RxBool isNoMainWallet = false.obs;
  @override
  void onInit() {
    super.onInit();
    _initData();

    state.numTextFieldController = GamingTextFieldController(
      onChanged: _onChanged,
    );
  }

  void _onChanged(String v) {
    String res =
        amountValueFormat(state.numTextFieldController.textController.text);

    // 如果 res有多个小数点，去除多余的小数点
    if (res.contains('.')) {
      final list = res.split('.');
      if (list.length > 2) {
        res = '${list[0]}.${list[1]}';
      }
    }

    state.numTextFieldController.textController.text = res;

    // 光标移动到最后
    state.numTextFieldController.textController.selection =
        TextSelection.fromPosition(TextPosition(
            offset: state.numTextFieldController.textController.text.length));
    checkEnableNext();
  }

  String amountValueFormat(String v) {
    // 格式化输入金额，最多接受两位小数
    if (!v.contains('.')) {
      return v;
    }
    final float = v.split(".")[1];
    if (float.length > 2) {
      // 去除多余的0，保留2位小数，统一成字符串
      return double.parse(v.substring(0, v.indexOf('.') + 3)).toString();
    } else {
      if (v.startsWith('0') && double.parse(v) >= 1) {
        // 去除e开头，统一成字符串
        return '${GGUtil.parseInt(GGUtil.parseDouble(v))}.';
      } else {
        if (v.endsWith('.')) {
          return '${v.substring(0, v.length - 1)}.';
        }
        return v;
      }
    }
  }

  /// 能否点击下一步
  void checkEnableNext() {
    // ag的 VND 只能输入10的倍数 ag
    const agProvider = GameConfig.agProvider;
    if ((agProvider.contains(state.fromWallet.value.providerId) ||
            agProvider.contains(state.toWallet.value.providerId)) &&
        state.curBalance.value.currency == 'VND') {
      final numText = state.numTextFieldController.textController.text;
      state.errorAmountTip.value =
          numText.isEmpty || GGUtil.parseDouble(numText) % 10 == 0
              ? ''
              : localized('hind_vdn');
    } else {
      state.errorAmountTip.value = '';
    }

    final curNum =
        GGUtil.parseDouble(state.numTextFieldController.textController.text);
    final amountEnable =
        state.errorAmountTip.value.isEmpty || (curNum % 10 == 0);

    enableNext.value = state.fromWallet.value.category != '' &&
        state.toWallet.value.category != '' &&
        curNum >= state.min.value &&
        curNum <= state.max.value &&
        amountEnable;

    isToBig.value = curNum > state.max.value;
  }

  void _initData() {
    loadAccount().listen((v) {}, onError: (Object e) {
      if (e is GoGamingResponse) {
        Toast.showFailed(e.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  /// 加载可转账账户
  Stream<void> loadAccount() {
    isLoadWallets.value = true;
    return PGSpi(Wallet.transferWalletList.toTarget())
        .rxRequest<List<GamingOverviewTransferWalletModel>?>((value) {
      return (value['data'] as List)
          .map((e) => GamingOverviewTransferWalletModel.fromJson(
              e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data ?? []);
    }).doOnData((event) {
      isLoadWallets.value = false;
      state.walletList = event;
      getTransfer();
      _initWallets();
    }).doOnError((p0, p1) {
      isLoadWallets.value = false;
    });
  }

  void getTransfer() {
    WalletService().loadTransferWalletBalance(state.walletList).listen((event) {
      state._wallets.value = event;
      setWallet();
    });
  }

  /// 转账
  void transfer() {
    /// 数量不对不转
    double num =
        GGUtil.parseDouble(state.numTextFieldController.textController.text);
    if (num == 0 || num > state.max.value || num < state.min.value) {
      return;
    }

    /// 钱包不对不转
    if (state.fromWallet.value.category == '' ||
        state.toWallet.value.category == '' ||
        state.fromWallet.value.category == state.toWallet.value.category) {
      return;
    }

    doneTransfer().listen((event) {});
  }

  Stream<void> doneTransfer() {
    isTransfer.value = true;
    String providerId = state.toWallet.value.providerId;
    if (state.toWallet.value.isMainWallet) {
      providerId = state.fromWallet.value.providerId;
    }
    Map<String, dynamic> params = {
      "fromWalletCategory": state.fromWallet.value.category,
      "toWalletCategory": state.toWallet.value.category,
      "currency": state.curBalance.value.currency,
      "providerId": providerId,
      "amount":
          GGUtil.parseDouble(state.numTextFieldController.textController.text)
    };
    // print('doneTransfer params = $params');

    return PGSpi(Wallet.transferWallet.toTarget(inputData: params))
        .rxRequest<TransferResult?>((value) {
      return value['data'] is Map<String, dynamic>
          ? TransferResult.fromJson(value['data'] as Map<String, dynamic>)
          : null;
    }).flatMap((value) {
      isTransfer.value = false;
      return Stream.value(value);
    }).doOnData((event) {
      isTransfer.value = false;
      _handleRes(event.code, event.data, message: event.message);
    }).doOnError((error, p1) {
      isTransfer.value = false;
      if (error is GoGamingResponse) {
        Toast.showFailed(error.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  // 处理划转结果
  void _handleRes(String code, TransferResult? result, {String? message}) {
    if (GGUtil.parseStr(code) == '2096') {
      // 提示 您的账号已被禁止进行该厂商的游戏交易，可联系客服查询详细原因
      Toast.showFailed(localized('acc_prov_d_con'));
    } else if (GGUtil.parseStr(code) == '2100') {
      // 提示 资金转入失败
      Toast.showFailed(localized('transfer_close_t'));
    } else if (result != null) {
      if (GGUtil.parseStr(result.result?.resultCode) == '0000000') {
        //成功
        state.result.value = result;
        state.showResult.value = true;
        GamingEvent.signalrUpdateBalance.notify();
      } else {
        // 出错
        String message = code == '2093'
            ? GGUtil.parseStr(result.result?.message)
            : localized('no_succ_tran00');
        Toast.showFailed(message);
      }
    } else {
      // result 为空，失败
      Toast.showFailed(localized('no_succ_tran00'));
    }
  }

  void _initWallets() {
    GamingOverviewTransferWalletModel? foundOtherWallet;

    /// 根据传入的参数来查找
    if (category != '') {
      foundOtherWallet = state.walletList.firstWhere((element) {
        if (element.isMainWallet) return false;
        return element.category
            .toUpperCase()
            .startsWith(category!.toUpperCase());
      });
    }

    foundOtherWallet ??= state.walletList.first;

    /// 查找主账户
    for (GamingOverviewTransferWalletModel wallet in state.walletList) {
      if (wallet.isMainWallet) {
        state.mainWallet.value = wallet;
        break;
      }
    }

    if (state.mainWallet.value.category == '') {
      /// 数据异常 没找到主账户钱包

      GamingOverviewTransferWalletModel model =
          GamingOverviewTransferWalletModel.fromJson({
        'category': 'Main',
        'providerId': '',
        'isFirst': false,
        'currencies': [
          {
            'isDigital': false,
            'currency': 'CNY',
            'balance': 0,
            'sort': 0,
            'isActivate': true,
          }
        ],
        'outMinAmount': 0,
        'walletName': localized('main'),
      });
      isNoMainWallet.value = true;
      state.mainWallet.value = model;
      state.walletList.insert(0, model);
    }

    state.fromWallet.value = state.mainWallet.value;
    state.toWallet.value = foundOtherWallet;

    setCommonCurrency();
  }

  /// 选择转出账户
  void selectFromWallet() {
    GamingAccountSelector.show(
            original: state.walletList,
            curWalletName: state.fromWallet.value.walletName ?? '')
        .then((value) {
      if (value != null) {
        if (state.toWallet.value.isMainWallet && value.isMainWallet) {
          exchangeWallets();
        } else {
          state.fromWallet.value = value;
          if (!value.isMainWallet) {
            state.toWallet.value = state.mainWallet.value;
          }
          setCommonCurrency();
        }
      }
    });
  }

  /// 选择转入账户
  void selectToWallet() {
    GamingAccountSelector.show(
            original: state.walletList,
            curWalletName: state.toWallet.value.walletName ?? '')
        .then((value) {
      if (value != null) {
        if (state.fromWallet.value.isMainWallet && value.isMainWallet) {
          exchangeWallets();
        } else {
          state.toWallet.value = value;
          if (!value.isMainWallet) {
            state.fromWallet.value = state.mainWallet.value;
          }
          setCommonCurrency();
        }
      }
    });
  }

  void setCommonCurrency() {
    if (state.fromWallet.value.walletName == '' ||
        state.toWallet.value.walletName == '') {
      state.commonCurrency = [];
      return;
    }

    /// 产品文档是取转入转出交集
    // state.commonCurrency =
    //     state.toWallet.value.intersectionCurrencies(state.fromWallet.value);

    /// WEB端是取出不是主账户的币种
    if (state.fromWallet.value.isMainWallet) {
      state.commonCurrency = state.toWallet.value.currencies;
    }
    if (state.toWallet.value.isMainWallet) {
      state.commonCurrency = state.fromWallet.value.currencies;
    }

    bool same = state.commonCurrency
        .where((element) => element.currency == state.curBalance.value.currency)
        .isNotEmpty;

    /// 当前显示的货币
    if (state.commonCurrency.isNotEmpty &&
        (state.curBalance.value.currency == '' || !same)) {
      state.curBalance.value = state.commonCurrency[0];
    }
    setWallet();
  }

  /// 选择币种
  void selectCurrency() {
    GamingCurrencyTransferSelector.show(
            original: state.commonCurrency) //state.commonCurrency
        .then((value) {
      if (value != null) {
        state.curBalance.value = value;
        setWallet();
      }
    });
  }

  /// 最小额
  void setMin() {
    bool find = false;
    for (GGUserBalance balance in state.toWallet.value.currencies) {
      if (balance.currency == state.curBalance.value.currency) {
        state.min.value = balance.minAmount ?? 0.01;
        find = true;
        break;
      }
    }
    if (!find || state.min.value == 0.0) {
      state.min.value = 10;
    }
  }

  void setMax() {
    bool find = false;
    for (GGUserBalance balance in state.fromWallet.value.currencies) {
      if (balance.currency == state.curBalance.value.currency) {
        state.max.value = balance.balance;
        find = true;
        break;
      }
    }
    if (!find) {
      state.max.value = 0;
    }

    // 从 walletList中查找和 state.fromWallet的category相等的钱包
    for (GamingAggsWalletModel model in state.wallets) {
      if (model.category == state.fromWallet.value.category) {
        // 从该钱包中查找和 state.curBalance.value.currency相等的币种
        for (GamingAggsWalletCurrencyModel balance in model.currencies) {
          if (balance.currency == state.curBalance.value.currency) {
            // 从该币种中取出balance
            state.max.value = balance.availBalanceForWithdraw;
            break;
          }
        }
      }
    }
  }

  void setTip() {
    if (state.toWallet.value.isFirst) {
      showTip.value = true;
    } else {
      showTip.value = false;
    }
  }

  void setWallet() {
    setMin();
    setMax();
    setTip();
  }

  /// 钱包置换
  void exchangeWallets() {
    final temp = state.fromWallet.value;
    state.fromWallet.value = state.toWallet.value;
    state.toWallet.value = temp;

    setWallet();
  }
}
