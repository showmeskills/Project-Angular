import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/invite/invite_api.dart';
import 'package:gogaming_app/common/api/invite/models/gaming_invite_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:share_plus/share_plus.dart';

import '../../../common/api/base/go_gaming_response.dart';

class GameOrderShareLogic extends BaseController
    with SingleRenderControllerMixin, GamingOverlayMixin {
  final _invite = () {
    GamingInviteModel? model;
    return model.obs;
  }();
  GamingInviteModel? get invite => _invite.value;

  final GlobalKey globalKey = GlobalKey();

  String? filePath;
  Uint8List? bytes;

  final RxnString _appLogo = RxnString();
  String? get appLogo => _appLogo.value;

  @override
  void onInit() {
    super.onInit();
    MerchantService.sharedInstance.getMerchantConfig().listen((event) {
      if (event != null) {
        _appLogo.value = event.appLogo;
      }
    });
  }

  @override
  void Function()? get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        Rx.combineLatestList([
          _loadInviteData(),
          CurrencyService.sharedInstance.updateRate(),
        ]).doOnData((event) {
          loadCompleted(state: LoadState.successful);
        }).doOnError((err, p1) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          loadCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<void> _loadInviteData() {
    return PGSpi(Invite.getDefault.toTarget())
        .rxRequest<GamingInviteModel>((value) {
      return GamingInviteModel.fromJson(value['data'] as Map<String, dynamic>);
    }).doOnData((event) {
      _invite.value = event.data;
    });
  }

  void share() async {
    try {
      await _generateImage();
    } catch (e) {
      bytes = null;
    }
    ShareResult? result;
    if (bytes != null) {
      result = await Share.shareXFiles(
        [
          XFile.fromData(
            bytes!,
            mimeType: 'image/png',
          )
        ],
        subject: localized('join_g_m'),
      );
    } else {
      result = await Share.shareWithResult(
          localized('join_g_m') + invite!.inviteUrl!);
    }
    if (result.status == ShareResultStatus.success) {
      Toast.showSuccessful(localized('share_successful'));
    } else if (result.status == ShareResultStatus.dismissed) {
      // 分享取消
    } else {
      Toast.showFailed(localized('share_failed'));
    }
  }

  void copy() {
    Clipboard.setData(ClipboardData(
      text: localized('join_g_m') + invite!.inviteUrl!,
    ));
    overlay.show(builder: (context) {
      return GamingPopupView(
        link: overlay.layerLink,
        contentPadding: EdgeInsets.zero,
        targetAnchor: Alignment.topCenter,
        followerAnchor: Alignment.bottomCenter,
        triangleSize: const Size(10, 6),
        triangleInset: EdgeInsets.zero,
        offset: Offset(0, -12.dp),
        onDismiss: () => overlay.hide(),
        usePenetrate: true,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: 16.dp,
            vertical: 10.dp,
          ),
          child: Text(
            localized('copy_succe'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textBlackOpposite.color,
            ),
          ),
        ),
      );
    });
    Toast.showSuccessful(
      localized('copy_succe'),
    ).then((value) {
      overlay.hide();
    });
  }

  void save() {
    PermissionUtil.request(Permission.photos).then((value) async {
      if (value) {
        SmartDialog.showLoading<void>();
        try {
          await _saveImage();
        } catch (e) {
          filePath = null;
        }
        if (filePath != null) {
          Toast.showSuccessful(localized('img_succ'));
        } else {
          Toast.showFailed(localized('img_fail'));
        }
        SmartDialog.dismiss<void>(status: SmartStatus.loading);
      }
    });
  }

  Future<Uint8List?> _generateImage() async {
    if (bytes != null) {
      return bytes;
    }
    final RenderRepaintBoundary? boundary =
        globalKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    final ui.Image? image = await boundary?.toImage(pixelRatio: 3.0);
    final ByteData? byteData =
        await image?.toByteData(format: ui.ImageByteFormat.png);
    bytes = byteData?.buffer.asUint8List();
    return bytes;
  }

  Future<String?> _saveImage() async {
    if (filePath != null) {
      return filePath;
    }
    await _generateImage();

    if (bytes != null) {
      try {
        final result = await ImageGallerySaver.saveImage(
          bytes!,
          quality: 100,
          isReturnImagePathOfIOS: true,
        );
        filePath = result['filePath'] as String?;
        return filePath;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
