// ignore_for_file: constant_identifier_names, no_leading_underscores_for_local_identifiers

import 'dart:io';
import 'dart:math';
import 'package:gogaming_app/widget_header.dart';

///此类为一些无关业务的通用函数
class Util {
  static bool get isIphoneX {
    const X_WIDTH = 1125; //iPhone X跟iphone 12 mini的渲染分辨率一致
    const X_HEIGHT = 2436;

    const XSMax_WIDTH = 1242;
    const XSMax_HEIGHT = 2688;

    const XR_WIDTH = 828;
    const XR_HEIGHT = 1792;

    const _12_WIDTH = 1170; //iPhone 12跟iPhone 12 Pro的渲染分辨率一致
    const _12_HEIGHT = 2532;

    const _12_MAX_WIDTH = 1284;
    const _12_MAX_HEIGHT = 2778;

    const _14_WIDTH = 1179;
    const _14_Height = 2556;

    const _14_PRO_WIDTH = 1290;
    const _14_PRO_Height = 2796;

    if (!Platform.isIOS) return false;
    if ((physicalWidth == X_WIDTH && physicalHeight == X_HEIGHT) ||
        (physicalWidth == X_HEIGHT && physicalHeight == X_WIDTH)) {
      return true;
    }
    if ((physicalWidth == XR_WIDTH && physicalHeight == XR_HEIGHT) ||
        (physicalWidth == XR_HEIGHT && physicalHeight == XR_WIDTH)) {
      return true;
    }

    if ((physicalWidth == XSMax_WIDTH && physicalHeight == XSMax_HEIGHT) ||
        (physicalWidth == XSMax_HEIGHT && physicalHeight == XSMax_WIDTH)) {
      return true;
    }
    if ((physicalWidth == _12_WIDTH && physicalHeight == _12_HEIGHT) ||
        (physicalWidth == _12_HEIGHT && physicalHeight == _12_WIDTH)) {
      return true;
    }
    if ((physicalWidth == _12_MAX_WIDTH && physicalHeight == _12_MAX_HEIGHT) ||
        (physicalWidth == _12_MAX_HEIGHT && physicalHeight == _12_MAX_WIDTH)) {
      return true;
    }

    if ((physicalWidth == _14_WIDTH && physicalHeight == _14_Height) ||
        (physicalWidth == _14_Height && physicalHeight == _14_WIDTH)) {
      return true;
    }
    if ((physicalWidth == _14_PRO_WIDTH && physicalHeight == _14_PRO_Height) ||
        (physicalWidth == _14_PRO_Height && physicalHeight == _14_PRO_WIDTH)) {
      return true;
    }
    return false;
  }

  static double get statusHeight {
    return ScreenUtil().statusBarHeight;
  }

  static double get iphoneXBottom {
    return isIphoneX ? 34.0 : 0.0;
  }

  static double get bottomMargin {
    return isIphoneX ? 34.0 : 20.0;
  }

  static double get physicalWidth {
    return ScreenUtil().screenWidth * devicePixelRatio;
  }

  static double get physicalHeight {
    return ScreenUtil().screenHeight * devicePixelRatio;
  }

  static double get width {
    double ratio = physicalWidth / physicalHeight;
    if (ratio >= 0.8 && ratio < 1.2) {
      ///适配宽屏手机上的问题
      return height * 9 / 16;
    }
    return physicalWidth / devicePixelRatio;
  }

  static double get height {
    return physicalHeight / devicePixelRatio;
  }

  static double get devicePixelRatio {
    return ScreenUtil().pixelRatio ?? 1;
  }

  ///设计以iPhone 11 Pro (375*812) 为标准设计基准，宽度的虚拟像素为375，ratio为换算比例
  static double get ratio {
    if (width > height) {
      return height / 375;
    } else {
      return width / 375;
    }
  }

  /// 以高度812为标准设计换算
  static double get hRatio {
    if (width > height) {
      return width / 812;
    } else {
      return height / 812;
    }
  }

  static double? _diagonalRatio;

  /// 以 375*812 设计图标准对角线比例计算的dp
  static double get diagonalRatio {
    if (_diagonalRatio == null) {
      double logicDiagonalLen = sqrt(375 * 375 + 812 * 812);
      double sysDiagonalLen = sqrt(width * width + height * height);
      _diagonalRatio = sysDiagonalLen / logicDiagonalLen;
    }
    return _diagonalRatio!;
  }

  ///高度小于等于iPhone6
  static bool get smallHeightScreen {
    return height <= 667;
  }
}
