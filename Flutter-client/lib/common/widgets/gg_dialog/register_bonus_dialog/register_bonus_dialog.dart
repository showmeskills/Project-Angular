import 'dart:async';

import 'package:gogaming_app/common/api/activity/activity_api.dart';
import 'package:gogaming_app/common/api/activity/models/register_bonus_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import 'views/register_bonus_dialog_view.dart';

class RegisterBonusDialog {
  static Stream<List<RegisterBonusModel>> _getNewUserApply() {
    return PGSpi(Activity.getNewUserApply.toTarget())
        .rxRequest<List<RegisterBonusModel>>((value) {
      return (value['data'] as List<dynamic>?)
              ?.map(
                  (e) => RegisterBonusModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  static Future<void> show() {
    final Completer<void> completer = Completer();
    _getNewUserApply().doOnData((event) {
      if (event.length > 1) {
        DialogUtil.showCustomGeneralDialog<void>(
          backDismissible: false,
          builder: (p0) {
            return RegisterBonusDialogView(
              data: event,
            );
          },
        ).then((value) {
          if (!completer.isCompleted) {
            completer.complete();
          }
        });
      } else if (event.length == 1) {
        submit(event.first).doOnDone(() {
          if (!completer.isCompleted) {
            completer.complete();
          }
        }).listen(null, onError: (e) {});
      } else {
        if (!completer.isCompleted) {
          completer.complete();
        }
      }
    }).doOnError((p0, p1) {
      Toast.showFailed(localized('register_bonus_select_failed'));
      if (!completer.isCompleted) {
        completer.complete();
      }
    }).listen(null, onError: (e) {});

    return completer.future;
  }

  static Stream<bool> submit(RegisterBonusModel model) {
    return PGSpi(Activity.submitNewUserApply.toTarget(inputData: {
      'prizeCode': model.prizeCode,
      'tmpCode': model.tmpCode,
      'tmpType': model.tmpType,
    })).rxRequest<bool>((value) {
      return value['data'] as bool;
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnError((p0, p1) {
      Toast.showFailed(localized('register_bonus_select_failed'));
    });
  }
}
