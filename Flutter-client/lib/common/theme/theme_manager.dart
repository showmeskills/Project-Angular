import 'package:base_framework/base_controller.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
// import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import 'package:gogaming_app/common/tracker/gaming_data_collection.dart';

class ThemeManager {
  static ThemeManager shareInstacne = ThemeManager();
  // 工厂方法构造函数
  factory ThemeManager() => _getInstance();

  // instance的getter方法，通过AccountService.instance获取对象
  static ThemeManager get sharedInstance => _getInstance();

  // 静态变量_instance，存储唯一对象
  static ThemeManager? _instance;
  // 获取对象
  static ThemeManager _getInstance() {
    _instance ??= ThemeManager._internal();
    return _instance!;
  }

  ThemeManager._internal();

  /// ThemeMode 0:system 1:light 2:dark
  final _themMap = {0: ThemeMode.system, 1: ThemeMode.light, 2: ThemeMode.dark};
  final _cacheTheme = ReadWriteValue<int?>(
    'ThemeManager.currentTheme',
    null,
    () => GetStorage(),
  );
  late ThemeMode currentTheme = () {
    final themeMode = _themMap[_cacheTheme.val] ?? defaultTheme;
    return themeMode;
  }();

  ThemeMode defaultTheme = ThemeMode.dark;

  final lightStyle = const SystemUiOverlayStyle(
    //状态栏亮度，只在IOS生效，只有light和dart模式
    statusBarBrightness: Brightness.light,
    //设置状态栏颜色，只在Android的M版本以上生效
    statusBarColor: Colors.transparent,
    // 状态栏Icon亮度，只在Android的M版本以上生效，只有light和dart模式，和AppBar的brightness相反
    statusBarIconBrightness: Brightness.dark,
  );
  final darkStyle = const SystemUiOverlayStyle(
    //状态栏亮度，只在IOS生效，只有light和dart模式
    statusBarBrightness: Brightness.dark,
    //设置状态栏颜色，只在Android的M版本以上生效
    statusBarColor: Colors.transparent,
    // 状态栏Icon亮度，只在Android的M版本以上生效，只有light和dart模式，和AppBar的brightness相反
    statusBarIconBrightness: Brightness.light,
  );

  void initThemeSetting() {
    Get.changeThemeMode(currentTheme);
    // if (Platform.isAndroid) {
    SystemChrome.setSystemUIOverlayStyle(isDarkMode ? darkStyle : lightStyle);
    // }
    try {
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
        Get.forceAppUpdate();
      });
    } catch (e) {
      // 可能存在初始化时同时进行update，导致报错
    }
  }

  /// 改变日间/夜间模式
  void changeTheme(bool? isDay) {
    Map<String, dynamic> dataMap = {
      "actionvalue1": isDay == true ? 1 : 2,
    };
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.changeType, dataMap: dataMap);

    currentTheme = isDay == true ? ThemeMode.light : ThemeMode.dark;
    _cacheTheme.val = isDay == true ? 1 : 2;
    Get.changeThemeMode(currentTheme);
    // if (Platform.isAndroid) {
    SystemChrome.setSystemUIOverlayStyle(isDarkMode ? darkStyle : lightStyle);
    // }
    Get.forceAppUpdate();
  }

  bool get isDarkMode {
    return currentTheme == ThemeMode.dark;
  }

  String imagePath(String nightPath) {
    return isDarkMode ? nightPath : nightPath.replaceFirst('.', '_day.');
  }

  /// sdk升级后修改了默认颜色 还原旧版的选中颜色
  final textSelectionTheme = const TextSelectionThemeData(
    cursorColor: Color.fromRGBO(66, 133, 244, 1.0),
    selectionColor: Color(0xff90caf9),
    selectionHandleColor: Color(0xff64b5f6),
  );

  final darkTextSelectionTheme = const TextSelectionThemeData(
    cursorColor: Color.fromRGBO(66, 133, 244, 1.0),
    selectionColor: Color(0xff64ffda),
    selectionHandleColor: Color(0xff1de9b6),
  );

  /// 还原旧版的选中颜色
  late final cupertinoOverrideTheme = CupertinoThemeData(
    primaryColor: textSelectionTheme.selectionHandleColor,
  );

  /// 还原旧版的选中颜色
  late final darkCupertinoOverrideTheme = CupertinoThemeData(
    primaryColor: darkTextSelectionTheme.selectionHandleColor,
  );
}
