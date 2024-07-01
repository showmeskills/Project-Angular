// ignore_for_file: depend_on_referenced_packages

import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';

class GGUtil {
  static int parseInt(dynamic value, [int defaultValue = 0]) {
    if (value == null) return defaultValue;
    if (value is String) {
      try {
        return int.parse(value);
      } catch (e) {
        return defaultValue;
      }
    }
    if (value is int) return value;
    if (value is double) return value.toInt();
    return defaultValue;
  }

  static List<int> parseIntList(dynamic ids) {
    List<int> value = [];
    if (ids != null && ids is List) {
      for (var val in ids) {
        try {
          int id = GGUtil.parseInt(val);
          value.add(id);
        } catch (e) {
          debugPrint("------------ $val");
          debugPrint('$e');
        }
      }
    }
    return value;
  }

  static List<String> parseStringList(dynamic ids) {
    List<String> value = [];
    if (ids != null && ids is List) {
      value = [];
      for (var val in ids) {
        if (val != null) {
          try {
            if (val is String) {
              value.add(val);
            } else {
              value.add(val.toString());
            }
          } catch (e) {
            debugPrint("------------ $val");
            debugPrint('$e');
          }
        }
      }
    }
    return value;
  }

  static List<T> parseList<T>(dynamic list, T Function(dynamic e) f) {
    if (list == null) return <T>[];
    if (list is List) {
      return list.map((e) => f(e)).toList();
    } else {
      return <T>[];
    }
  }

  static double parseDouble(dynamic value, [double defaultValue = 0.0]) {
    if (value == null) return defaultValue;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      try {
        return double.parse(value);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  static String parseStr(dynamic value) {
    if (value == null) return '';
    return '$value';
  }

  static int strLen(String origin) {
    Runes runes = origin.runes;
    return runes.length;
  }

  static bool validStr(String value) {
    return (value.isNotEmpty);
  }

  static bool validList(dynamic value) {
    return (value is List && value.isNotEmpty);
  }

  static bool parseBool(dynamic value, {bool defValue = false}) {
    if (value == null) return defValue;

    if (value is bool) return value;
    if (value is int) return value > 0;
    if (value is String) {
      try {
        return value.toLowerCase() == 'true' || GGUtil.parseInt(value) > 0;
      } catch (e) {
        return defValue;
      }
    }

    return defValue;
  }

  static void removePreviouslyInstalledAPK() async {
    if (Platform.isAndroid) {
      Directory storageDir = await getExternalStorageDirectory() as Directory;
      List<FileSystemEntity> list = storageDir.listSync(recursive: true)
        ..removeWhere((element) => element.path.contains('/x5'));

      for (FileSystemEntity f in list) {
        try {
          if (f.existsSync()) {
            f.deleteSync(recursive: true);
            debugPrint("删除文件成功-f=$f");
          }
        } catch (e) {
          debugPrint("删除文件出错了：$e");
        }
      }
    }
  }
}
