import 'package:flutter/material.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';

enum GGColorsM2 {
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

  ///模块&悬坜背景色
  popBackground(
    key: 'popBackground',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF21232C),
  ),

  ///禝用色
  disabled(
    key: 'disabled',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF383B47),
  ),

  /// 页脚背景色/日间
  homeFootBackground(
    key: 'homeFootBackground',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF1D1F27),
  ),

  /// kyc〝钱包历坲记录等类似样弝窝出模块背景色
  moduleBackground(
    key: 'moduleBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF1D1F27),
  ),

  /// 公用用户header背景色
  userBarBackground(
    key: 'userBarbackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF21232C),
  ),

  /// 深色的背景色
  darkBackground(
    key: 'darkbackground',
    day: Color(0xFFF2F2F2),
    night: Color(0xFF262833),
  ),

  /// game tab bar 背景色
  gameTabBarBackgroundColor(
    key: 'gameTabBarBackgroundColor',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF262833),
  ),

  /// game tab bar active背景色
  gameTabBarActiveColor(
    key: 'gameTabBarActiveColor',
    day: Color(0xFFEAECEF),
    night: Color(0xFF383B47),
  ),

  /// game list header 背景色
  gameListHeaderBackground(
    key: 'gameListHeaderBackground',
    day: Color(0xFFFCFCFC),
    night: Color(0xFF383B47),
  ),

  darkPopBackground(
    key: 'darkPopBackground',
    day: Color(0xFFF5F5F5),
    night: Color(0xFF262833),
  ),

  /// 左侧蝜坕背景色/日间
  menuBackground(
    key: 'menuBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF262833),
  ),

  /// 左侧蝜坕appbar icon
  menuAppBarIconColor(
    key: 'menuAppBarIconColor',
    day: Color(0xFFB2B2B2),
    night: Color(0xFFB2B2B2),
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
    night: Color(0xFF21232C),
  ),

  /// 登录背景色
  loginBackground(
    key: 'loginBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF21232C),
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
    day: Color(0xFF909090),
    night: Color(0xFF383B47),
  ),

  /// 边框&按钮背景色-相坝
  borderOpposite(
    key: 'borderOpposite',
    day: Color(0xFFF5F5F5),
    night: Color(0xFFEBEBEB),
  ),

  /// 戝功 边框&按钮背景色
  successBackground(
    key: 'successBackground',
    day: Color(0xFFFCFCFC),
    night: Color(0xFFE2F9EF),
  ),

  /// 说明文字
  textHint(
    key: 'textHint',
    day: Color(0xFFB7BDC6),
    night: Color(0xFF909090),
  ),

  /// 说明图标
  iconHint(
    key: 'textHint',
    day: Color(0xFFB7BDC6),
    night: Color(0xFF909090),
  ),

  /// 次覝文字
  textSecondDay(
    key: 'textSecondDay',
    day: Color(0xFFB2B2B2),
    night: Color(0xFFB2B2B2),
  ),

  /// 次覝文字
  textSecond(
    key: 'textSecond',
    day: Color(0xFF707A8A),
    night: Color(0xFFB2B2B2),
  ),

  /// 主覝文字
  textMain(
    key: 'textMain',
    day: Color(0xFF1E2329),
    night: Color(0xFFEBEBEB),
  ),

  /// 通用/弹窗逝明背景色
  alertMask(
    key: 'alertMask',
    day: Color.fromRGBO(0, 0, 0, 0.7),
    night: Color.fromRGBO(0, 0, 0, 0.7),
  ),

  /// 弹窗背景色
  alertBackground(
    key: 'alertBackground',
    day: Color(0xFFFFFFFF),
    night: Color(0xFF262833),
  ),

  popupBackground(
    key: 'popupBackground',
    day: Color(0xFF737A89),
    night: Color(0xFFEBEBEB),
  ),

  /// 通用/按钮上黑色字色
  buttonTextBlack(
    key: 'buttonTextBlack',
    day: Color(0xFF1E2329),
    night: Color(0xFF1E2329),
  ),

  /// 通用/按钮上黑色字色-坝
  textBlackOpposite(
    key: 'textBlackOpposite',
    day: Color(0xFFEBEBEB),
    night: Color(0xFF1E2329),
  ),

  /// 通用/按钮上白文字色
  buttonTextWhite(
    key: 'buttonTextWhite',
    day: Color(0xFFFFFFFF),
    night: Color(0xFFEBEBEB),
  ),

  /// 通用/链接色
  link(
    key: 'link',
    day: Color(0xFFE9C260),
    night: Color(0xFFE9C260),
  ),

  /// 通用/戝功杝示色
  success(
    key: 'success',
    day: Color(0xFF26A17B),
    night: Color(0xFF26A17B),
  ),

  /// 通用/错误杝示色
  error(
    key: 'error',
    day: Color(0xFFCF304A),
    night: Color(0xFFCF304A),
  ),

  /// 消杯杝示背景色
  tipsBg(
    key: 'tipsBg',
    day: Color(0xFFF6465D),
    night: Color(0xFFF6465D),
  ),

  /// 通用/高亮按钮色&链接文字
  highlightButton(
    key: 'highlightButton',
    day: Color(0xFFC70700),
    night: Color(0xFFC70700),
  ),

  /// 登录〝注册 tabbar 高亮颜色
  tabBarHighlightButton(
    key: 'tabBarHighlightButton',
    day: Color(0xFFEAECEF),
    night: Color(0xFFC70700),
  ),

  /// 戝功文字颜色
  successText(
    key: 'successText',
    day: Color(0xFF02C076),
    night: Color(0xFF02C076),
  ),

  /// 一些箭头的类似次覝文字
  similarSecond(
    key: 'similarSecond',
    day: Color(0xFFAFB6BB),
    night: Color(0xFFAFB6BB),
  ),

  /// 一些箭头的类似次覝文字
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
    day: Color(0xFFC70700),
    night: Color(0xFFC70700),
  ),

  /// 新版卡券中心黄色
  couponYellow(
    key: 'textSecond',
    day: Color(0xFFFFD600),
    night: Color(0xFFFFD600),
  ),

  /// 通用/品牌颜色
  brand(
    key: 'brand',
    day: Color(0xFFC70700),
    night: Color(0xFFC70700),
  ),

  /// im消息背景色
  imBackground(
    key: 'imBackground',
    day: Color(0xFF0070f3),
    night: Color(0xFF0070f3),
  );

  /// 坯能需覝从坎坰获坖颜色用到的key
  final String key;
  final Color day;
  final Color night;

  const GGColorsM2({
    required this.key,
    required this.day,
    required this.night,
  });

  Color get color {
    // 坯能需覝从坎坰获坖颜色
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
