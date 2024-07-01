import 'dart:async';

import 'package:gogaming_app/common/api/kyc/models/gg_kyc_user_verification_foreu.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';

part 'user_info_state.dart';

class DashboardUserInfoLogic extends GetxController {
  final state = DashboardUserInfoState();

  late Function updateListen;

  @override
  void onInit() {
    super.onInit();
    updateListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      _userDidUpdate();
    });
    if (!KycService.sharedInstance.isAsia) {
      KycService.sharedInstance
          .queryUserVerificationForEU()
          .doOnError((err, p1) {
        if (err is GoGamingResponse) {
          Toast.showFailed(err.message);
        } else {
          Toast.showTryLater();
        }
      }).listen(null, onError: (err) {});
    }
  }

  // Stream<void> Function() get onLoadData => () {
  //       return onLoadDataStream()..listen(null, onError: (p0, p1) {});
  //     };

  // Stream<void> onLoadDataStream() {
  //   return KycService.sharedInstance.updateKycData().doOnError((p0, p1) {
  //     Toast.showTryLater();
  //   });
  // }

  @override
  void onClose() {
    super.onClose();
    updateListen.call();
  }

  void _userDidUpdate() {
    state._isLogin.value = AccountService.sharedInstance.isLogin;
    final gamingUser = AccountService.sharedInstance.gamingUser;
    state._uid.value = gamingUser?.uid;
    state._userName.value = gamingUser?.userName;
    state._lastLoginTime.value = gamingUser?.lastLoginTime;
    state._lastLoginIp.value = gamingUser?.lastLoginIp;
    state._isBindGoogleValid.value = gamingUser?.isBindGoogleValid ?? false;
    state._isBindMobile.value = gamingUser?.isBindMobile ?? false;
    state._hasWhiteList.value = gamingUser?.hasWhiteList ?? false;
  }

  void navigateToKycMiddleForEu() {
    final Completer<void> completer = Completer();
    if (state.kycVerificationForEu != null) {
      completer.complete();
    } else {
      KycService.sharedInstance.queryUserVerificationForEU().doOnData((event) {
        completer.complete();
      }).doOnError((p0, p1) {
        if (p0 is GoGamingResponse) {
          Toast.showFailed(p0.message);
        } else {
          Toast.showTryLater();
        }
        completer.completeError(p0);
      }).listen(null, onError: (err) {});
    }

    completer.future.then((value) {
      if (state.kycVerificationForEu?.intermediateVerificationStatus == 'P') {
        KycService.sharedInstance.showKycReviewEuDialog();
      } else {
        /// id 认证已经通过，直接进入 poa 流程
        if (state.kycVerificationForEu?.idFileStatus == 2) {
          KycService.sharedInstance.showKycEuDialog(
            Routes.kycPOA.route,
          );
          return;
        }
        KycService.sharedInstance.showKycEuDialog(
          Routes.kycMiddle.route,
        );
      }
    });
  }
}
