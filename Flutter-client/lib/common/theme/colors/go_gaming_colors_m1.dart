import 'package:flutter/material.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';

enum GGColorsM1 {
  /// app/边框&按钮背景色
  bonusUnselected(
    key: 'Colors.bonusUnselected',
    day: Color(0xffEAECEF),
    night: Color(0xff091620),
  ),

  transparent(
    key: 'Colors.transparent',
    day: Colors.transparent,
    night: Colors.transparent,
  ),

  ///模块&悬停背景色
  popBackground(
    key: 'popBackground',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF1A2C38),
  ),

  ///禁用色
  disabled(
    key: 'disabled',
    day: Color(0xCCF5F5F5),
    night: Color(0xCC223847),
  ),

  /// 页脚背景色/日间
  homeFootBackground(
    key: 'homeFootBackground',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF071D2A),
  ),

  /// kyc、钱包历史记录等类似样式突出模块背景色
  moduleBackground(
    key: 'moduleBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF071D2A),
  ),

  /// 公用用户header背景色
  userBarBackground(
    key: 'userBarbackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF1A2C38),
  ),

  /// 深色的背景色
  darkBackground(
    key: 'darkbackground',
    day: Color(0xFFF2F2F2),
    night: Color(0xFF0F212E),
  ),

  /// game tab bar 背景色
  gameTabBarBackgroundColor(
    key: 'gameTabBarBackgroundColor',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF071D2A),
  ),

  /// game tab bar active背景色
  gameTabBarActiveColor(
    key: 'gameTabBarActiveColor',
    day: Color(0xFFEAECEF),
    night: Color(0xFF1a2c38),
  ),

  /// game list header 背景色
  gameListHeaderBackground(
    key: 'gameListHeaderBackground',
    day: Color(0xFFfcfcfc),
    night: Color(0xFF2f4553),
  ),

  darkPopBackground(
    key: 'darkPopBackground',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF0F212E),
  ),

  /// 左侧菜单背景色/日间
  menuBackground(
    key: 'menuBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF0F212E),
  ),

  /// 左侧菜单appbar icon
  menuAppBarIconColor(
    key: 'menuAppBarIconColor',
    day: Color(0xFF707A8A),
    night: Color(0xFFFFFFFF),
  ),

  /// 风控提示关闭按钮
  riskIconColor(
    key: 'menuAppBarIconColor',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF707A8A),
  ),

  /// 阴影颜色
  shadow(
    key: 'shadow',
    day: Color.fromRGBO(0, 0, 0, 0.2),
    night: Color.fromRGBO(0, 0, 0, 0.16),
  ),

  /// 背景色
  background(
    key: 'background',
    day: Color(0xFFFCFCFC),
    night: Color(0xFF1A2C38),
  ),

  /// 登录背景色
  loginBackground(
    key: 'loginBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF1A2C38),
  ),

  /// 边框&按钮背景色
  border(
    key: 'border',
    day: Color(0xFFEAECEF),
    night: Color(0xFF2F4553),
  ),

  /// 边框色，深色
  darkBorder(
    key: 'border',
    day: Color(0xFFD5D8DC),
    night: Color(0xFF2F4553),
  ),

  /// 供应商背景色
  providerBackground(
    key: 'providerBackground',
    day: Color(0xFFB7BDC6),
    night: Color(0xFF2F4553),
  ),

  /// 边框&按钮背景色-相反
  borderOpposite(
    key: 'borderOpposite',
    day: Color(0xFFF5F5F5),
    night: Color(0xFFFFFFFF),
  ),

  /// 成功 边框&按钮背景色
  successBackground(
    key: 'successBackground',
    day: Color(0xFFFCFCFC),
    night: Color(0xFFE2F9EF),
  ),

  /// 说明文字
  textHint(
    key: 'textHint',
    day: Color(0xFFB7BDC6),
    night: Color(0xFF557086),
  ),

  /// 说明图标
  iconHint(
    key: 'textHint',
    day: Color(0xFFB7BDC6),
    night: Color(0xFFB7BDC6),
  ),

  /// 次要文字
  textSecondDay(
    key: 'textSecondDay',
    day: Color(0xFFB7BDC6),
    night: Color(0xFFB1BAD3),
  ),

  /// 次要文字
  textSecond(
    key: 'textSecond',
    day: Color(0xFF707A8A),
    night: Color(0xFFB1BAD3),
  ),

  /// 主要文字
  textMain(
    key: 'textMain',
    day: Color(0xFF1E2329),
    night: Color(0xFFFFFFFF),
  ),

  /// 通用/弹窗透明背景色
  alertMask(
    key: 'alertMask',
    day: Color.fromRGBO(0, 0, 0, 0.7),
    night: Color.fromRGBO(0, 0, 0, 0.7),
  ),

  /// 弹窗背景色
  alertBackground(
    key: 'alertBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF0F212E),
  ),

  popupBackground(
    key: 'popupBackground',
    day: Color(0xFF737A89),
    night: Color(0xFFFFFFFF),
  ),

  /// 通用/按钮上黑色字色
  buttonTextBlack(
    key: 'buttonTextBlack',
    day: Color(0xFF1E2329),
    night: Color(0xFF1E2329),
  ),

  /// 通用/按钮上黑色字色-反
  textBlackOpposite(
    key: 'textBlackOpposite',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF1E2329),
  ),

  /// 通用/按钮上白文字色
  buttonTextWhite(
    key: 'buttonTextWhite',
    day: Color(0xFFFFFFFF),
    night: Color(0xFFFFFFFF),
  ),

  /// 通用/链接色
  link(
    key: 'link',
    day: Color(0xFF1CB7EA),
    night: Color(0xFF1CB7EA),
  ),

  /// 通用/成功提示色
  success(
    key: 'success',
    day: Color(0xFF26A17B),
    night: Color(0xFF26A17B),
  ),

  /// 通用/错误提示色
  error(
    key: 'error',
    day: Color(0xFFCF304A),
    night: Color(0xFFCF304A),
  ),

  /// 消息提示背景色
  tipsBg(
    key: 'error',
    day: Color(0xFFF6465D),
    night: Color(0xFFF6465D),
  ),

  /// 通用/高亮按钮色&链接文字
  highlightButton(
    key: 'highlightButton',
    day: Color(0xFFF26944),
    night: Color(0xFFF26944),
  ),

  /// 登录、注册 tabbar 高亮颜色
  tabBarHighlightButton(
    key: 'tabBarHighlightButton',
    day: Color(0xFFEAECEF),
    night: Color(0xFFF04E23),
  ),

  /// 成功文字颜色
  successText(
    key: 'successText',
    day: Color(0xFF02C076),
    night: Color(0xFF02C076),
  ),

  /// 一些箭头的类似次要文字
  similarSecond(
    key: 'textSecond',
    day: Color(0xFFAFB6BB),
    night: Color(0xFFAFB6BB),
  ),

  /// 一些箭头的类似次要文字
  appealCryptoTipsBackground(
    key: 'appealCryptoTipsBackground',
    day: Color(0x0FFB6943),
    night: Color(0xFF2F4553),
  ),

  /// 一些粉红色按钮背景色
  pinkBtnBg(
    key: 'pinkBtnBg',
    day: Color(0xFFFB6943),
    night: Color(0xFFFB6943),
  ),

  /// 流程中的颜色
  process(
    key: 'process',
    day: Color(0xFFFF9300),
    night: Color(0xFFFF9300),
  ),

  /// 新版卡券中心黄色
  couponYellow(
    key: 'couponYellow',
    day: Color(0xFFFFD600),
    night: Color(0xFFFFD600),
  ),

  /// 通用/品牌颜色
  brand(
    key: 'brand',
    day: Color(0xFFF04E23),
    night: Color(0xFFF04E23),
  ),

  /// im消息背景色
  imBackground(
    key: 'imBackground',
    day: Color(0xFF0070f3),
    night: Color(0xFF0070f3),
  );

  /// 可能需要从后台获取颜色用到的key
  final String key;
  final Color day;
  final Color night;

  const GGColorsM1({
    required this.key,
    required this.day,
    required this.night,
  });

  Color get color {
    // 可能需要从后台获取颜色
    // final Map<String, String> colorsMap = {};
    // Color stringColor = hexToColor(colorsMap[key]) ?? Colors.white;
    // return stringColor;

    return ThemeManager.shareInstacne.isDarkMode ? night : day;
  }

  Color? hexToColor(String? code) {
    if (code is String && code.length == 7) {
      return Color(int.parse(code.substring(1, 7), radix: 16) + 0xFF000000);
    }
    return null;
  }

  String get toHexString {
    return '#${color.value.toRadixString(16).substring(2)}';
  }
}
