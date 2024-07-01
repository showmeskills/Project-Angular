import 'package:flutter/services.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/biometric/biometric_api.dart';
import 'package:gogaming_app/common/api/biometric/models/biometric_model.dart';
import 'package:gogaming_app/common/service/biometric_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:local_auth/error_codes.dart';

part 'biometric_management_state.dart';

class BiometricManagementLogic extends BaseController
    with RefreshControllerMixin {
  final state = BiometricManagementState();

  @override
  void onInit() {
    super.onInit();
    BiometricService.sharedInstance.getAvailableBiometrics().then((value) {
      if (!BiometricService.sharedInstance.hardwareSupport) {
        BiometricService.sharedInstance.showNotSupport();
        return;
      }
      // if (!BiometricService.sharedInstance.enrolled) {
      //   BiometricService.sharedInstance.showNotEnrolledDialog();
      //   return;
      // }
    });
  }

  @override
  LoadCallback? get onRefresh => (p) {
        refreshCompleted(state: LoadState.loading);
        _loadData(p).doOnData((event) {
          refreshCompleted(
            state: LoadState.successful,
            count: state.data.length,
            total: state.data.length,
          );
        }).doOnError((err, p1) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<List<dynamic>> _loadData(int page) {
    return PGSpi(Biometric.list.toTarget(input: {
      'pageIndex': page,
      'pageSize': 10,
    })).rxRequest<List<BiometricModel>>((value) {
      return (value['data'] as List<dynamic>?)?.map((e) {
            return BiometricModel.fromJson(e as Map<String, dynamic>);
          }).toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      state._data.value = event;
    });
  }

  void delete({
    required int id,
    required String input,
    bool isCurrent = false,
  }) {
    SmartDialog.showLoading<void>();
    PGSpi(Biometric.delete.toTarget(inputData: {
      'id': id,
      "password": Encrypt.encodeString(input),
    })).rxRequest<bool>((value) {
      return value['data'] as bool? ?? false;
    }).doOnData((event) {
      if (event.data) {
        final index = state.data.indexWhere((element) => element.id == id);
        if (index != -1) {
          state._data.value = List.from(state.data)..removeAt(index);
          refreshCompleted(
            state: LoadState.successful,
            count: state.data.length,
            total: state.data.length,
          );
        }
        if (isCurrent) {
          BiometricService.sharedInstance.removeKey();
        }
        Toast.showSuccessful(localized('device_delete_successful'));
        Get.back<void>();
      } else {
        Toast.showFailed(localized('device_delete_failed'));
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  void rename(int id, String name) {
    SmartDialog.showLoading<void>();
    PGSpi(Biometric.rename.toTarget(inputData: {
      'id': id,
      'deviceName': name,
    })).rxRequest<bool>((value) {
      return value['data'] as bool? ?? false;
    }).doOnData((event) {
      if (event.data) {
        final index = state.data.indexWhere((element) => element.id == id);
        if (index != -1) {
          state._data.value = List.from(state.data)
            ..replaceRange(index, index + 1,
                [state.data[index].copyWith(deviceName: name)]);
          refreshCompleted(
            state: LoadState.successful,
            count: state.data.length,
            total: state.data.length,
          );
        }
        Get.back<void>();
        Toast.showSuccessful(localized('rename_label_successful'));
      } else {
        Toast.showFailed(localized('rename_label_failed'));
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  void add() {
    BiometricService.sharedInstance.getAvailableBiometrics().then((value) {
      if (!BiometricService.sharedInstance.hardwareSupport) {
        BiometricService.sharedInstance.showNotSupport();
        return;
      }
      // if (!BiometricService.sharedInstance.enrolled) {
      //   BiometricService.sharedInstance.showNotEnrolledDialog();
      //   return;
      // }
      BiometricService.sharedInstance
          .authenticate(
        reason: localized('biometric_add_reason'),
      )
          .then((value) {
        if (value) {
          _add();
        }
      }).onError<PlatformException>((err, s) {
        if (err.message == 'Authentication canceled.') {
          Toast.showFailed(localized('biometric_canceled'));
          return;
        }
        if (err.code == notAvailable) {
          // 未注册生物识别
          BiometricService.sharedInstance.showNotSupport();
        } else if (err.code == notEnrolled) {
          // 未注册生物识别
          BiometricService.sharedInstance.showNotEnrolledDialog();
        } else if (err.code == permanentlyLockedOut) {
          //其他错误
          Toast.showFailed(localized('try_later'));
        }
      });
    });
  }

  void _add() {
    SmartDialog.showLoading<void>();
    DeviceUtil.getDeviceModelName().asStream().flatMap((value) {
      return PGSpi(Biometric.add.toTarget(inputData: {
        'clientName': value,
      })).rxRequest<String?>((value) {
        return value['data'] as String?;
      });
    }).doOnData((event) {
      if (event.data != null) {
        BiometricService.sharedInstance.storeKey(event.data!);
        Toast.showSuccessful(localized('biometric_on_successful'));
      }
      reInitial(refresh: true, reset: false);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }
}
