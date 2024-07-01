import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_config_model.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/update/update_app_progress_dialog.dart';
import 'package:gogaming_app/common/widgets/update/update_minimal_widget.dart';
import 'package:gogaming_app/common/widgets/update/update_widget.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:r_upgrade/r_upgrade.dart';
import 'package:url_launcher/url_launcher.dart';
import '../utils/util.dart';

enum UpdateType { updateTypeForced, updateTypeOptional, updateTypeNotRequired }

class UpgradeAppService {
  factory UpgradeAppService() => _getInstance();

  static UpgradeAppService get sharedInstance => _getInstance();

  static UpgradeAppService? _instance;

  static UpgradeAppService _getInstance() {
    _instance ??= UpgradeAppService._internal();
    return _instance!;
  }

  UpgradeAppService._internal();

  String downloadURLAndroid = '';
  String downloadURLIOS = '';
  String updateInfoAndroid = '';
  String updateInfoIOS = '';
  String serverMinBuildNO = '';
  String serverBuildNO = '';

  bool isUpgradeOptional = false;

  int? _downloadId;
  final _progress = 0.0.obs;
  double get progress => _progress.value;
  OverlayEntry? _entry;

  final String _progressDialogTag = 'progressDialogTag';
  final String _upgradeDialogTag = 'upgradeDialogTag';

  Stream<bool> configParameter() {
    return MerchantService.sharedInstance.getMerchantConfig().flatMap((event) {
      if (event is MerchantConfigModel) {
        serverBuildNO = event.config?.buildNO ?? '';
        serverMinBuildNO = event.config?.minBuildNO ?? '';
        updateInfoIOS = event.config?.updateInfoIOS ?? '';
        updateInfoAndroid = event.config?.updateInfoAndroid ?? '';
        downloadURLIOS = event.config?.downloadURLIOS ?? '';
        downloadURLAndroid = event.config?.downloadURLAndroid ?? '';
        return Stream.value(true);
      } else {
        return Stream.value(false);
      }
    });
  }

  bool _checkIfForcedUpgradeRequired() {
    if (Config.versionName == "" ||
        Config.versionName.contains('BuildNumber')) {
      return false;
    }

    if (_oldLessThanNew(Config.versionName, serverMinBuildNO)) {
      return true;
    } else {
      return false;
    }
  }

  bool _oldLessThanNew(String oldVersion, String newVersion) {
    List<String> oldVersionList = oldVersion.split('.');
    List<String> newVersionList = newVersion.split('.');
    if (oldVersionList.length < 2 || newVersionList.length < 2) {
      return GGUtil.parseDouble(oldVersion) < GGUtil.parseDouble(newVersion);
    }

    int oldVersionPart1 = GGUtil.parseInt(oldVersionList[0]);
    int oldVersionPart2 = GGUtil.parseInt(oldVersionList[1]);

    int newVersionPart1 = GGUtil.parseInt(newVersionList[0]);
    int newVersionPart2 = GGUtil.parseInt(newVersionList[1]);
    return (oldVersionPart1 < newVersionPart1) ||
        (oldVersionPart1 == newVersionPart1 &&
            oldVersionPart2 < newVersionPart2);
  }

  UpdateType checkIfNeedUpdate() {
    if (fetchAppDownloadURL() == '' ||
        Config.versionName == "" ||
        Config.versionName.contains('BuildNumber')) {
      return UpdateType.updateTypeNotRequired;
    }
    if (_checkIfForcedUpgradeRequired()) {
      return UpdateType.updateTypeForced;
    } else if (_oldLessThanNew(Config.versionName, serverBuildNO)) {
      return UpdateType.updateTypeOptional;
    } else {
      return UpdateType.updateTypeNotRequired;
    }
  }

  String fetchUpdateInfo() {
    // 用翻译固定翻译来展示
    return '${localized('app_update_info_01')}\n${localized('app_update_info_02')}';
    // 下面根据后台返回的更新内容来显示的，先暂存。后面如果运营来管理的话。还用这个逻辑
    // String result = '';
    // if (Platform.isIOS) {
    //   result = updateInfoIOS;
    // } else {
    //   result = updateInfoAndroid;
    // }
    // // 处理接口返回数据中换行符号 \n 问题
    // result = result.replaceAll('\\n', '\n');
    // return result;
  }

  String fetchAppDownloadURL() {
    if (Platform.isIOS) {
      return downloadURLIOS;
    } else {
      return downloadURLAndroid;
    }
  }

  void _cancel() {
    if (_downloadId != null) {
      RUpgrade.cancel(_downloadId!);
    }
  }

  void showProgressDialog() {
    _entry?.remove();
    _entry = null;
    SmartDialog.show<dynamic>(
      clickMaskDismiss: false,
      backDismiss: false,
      tag: _progressDialogTag,
      builder: (context) {
        return const UpdateAppProgressDialog();
      },
    );
  }

  void dismissProgressDialog() {
    SmartDialog.dismiss<void>(tag: _progressDialogTag);
  }

  void minimize() {
    dismissProgressDialog();
    _entry = OverlayEntry(builder: (context) {
      return const UpdateMinimalWidget();
    });
    Overlay.of(Get.overlayContext!).insert(_entry!);
  }

  void close() {
    _cancel();
    _entry?.remove();
    _entry = null;
    dismissProgressDialog();
    dismissUpgradeDialog();
  }

  Future<void> showUpgradeDialog({
    required bool isUpgradeOptional,
  }) {
    this.isUpgradeOptional = isUpgradeOptional;
    return SmartDialog.show<dynamic>(
      clickMaskDismiss: isUpgradeOptional,
      backDismiss: false,
      tag: _upgradeDialogTag,
      builder: (context) {
        return PopScope(
          canPop: isUpgradeOptional,
          child: UpdateWidget(isUpgradeOptional: isUpgradeOptional),
        );
      },
    );
  }

  void dismissUpgradeDialog() {
    SmartDialog.dismiss<void>(tag: _upgradeDialogTag);
  }

  void install() {
    if (Platform.isAndroid) {
      if (_downloadId != null) {
        RUpgrade.install(_downloadId!);
      } else {
        Toast.showFailed(localized('up_fail'));
      }
    } else {
      // 手动升级
      manualUpgrade();
    }
  }

  void upgrade() {
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickDownloadApp);
    if (Platform.isAndroid) {
      _downloadId = null;

      _progress.value = 0;
      // 显示进度弹窗
      showProgressDialog();
      // 关闭升级弹窗
      dismissUpgradeDialog();
      RUpgrade.stream.listen((DownloadInfo info) {
        if (info.status == DownloadStatus.STATUS_SUCCESSFUL) {
          _progress.value = 100;
          if (!isUpgradeOptional) {
            dismissProgressDialog();
            _entry?.remove();
            _entry = null;
          }
        } else if (info.status == DownloadStatus.STATUS_FAILED) {
          _cancel();
          Toast.showFailed(localized('up_fail'));
        } else {
          _downloadId = info.id ?? 0;
          _progress.value = info.percent ?? 0.0;
        }
      }).onError((Object e) {
        Toast.showFailed(e.toString());
      });
      RUpgrade.upgrade(
        UpgradeAppService.sharedInstance.fetchAppDownloadURL(),
        notificationVisibility: NotificationVisibility.VISIBILITY_HIDDEN,
        installType: RUpgradeInstallType.normal,
      ).then((id) async {
        if (id != null) {
          debugPrint('下载成功');
        }
      }).catchError((e) async {
        Toast.showFailed(localized('Download_failed'));
      });
    } else {
      manualUpgrade();
    }
  }

  /// 手动升级
  void manualUpgrade() {
    MerchantService().getMerchantConfig().listen((event) async {
      if (event != null) {
        MerchantCustomConfig? model = event.config;
        Environment environment = Config.sharedInstance.environment;
        Uri uri =
            Uri.parse(UpgradeAppService.sharedInstance.fetchAppDownloadURL());
        if (environment == Environment.product) {
          uri = Uri.parse(model?.downloadPageUrl ?? '');
        }

        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          // throw "Could not launch $downloadUrl";
        }
      }
    });
  }
}

// typedef DownloadFinish = void Function(int code);
// typedef DownloadFinish = void Function(int code);
// typedef DownloadProgress = void Function(int progress);

// class AppUpgradeListener {
//   AppUpgradeListener({
//     required this.onDownloadFinish,
//     required this.onDownloadProgress,
//     required this.onDownloadFailed,
//   });

//   ///下载完成监听
//   DownloadFinish onDownloadFinish;

//   ///下载进度监听
//   DownloadProgress onDownloadProgress;
//   ///下载进度监听
//   DownloadProgress onDownloadFailed;
// }