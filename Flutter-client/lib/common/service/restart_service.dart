import 'dart:developer' as developer;

import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';

class RestartService {
  static final Map<String, RestartServiceInterface> _singl = {};

  static String _getKey(Type type, String? name) {
    return name == null ? type.toString() : type.toString() + name;
  }

  /// default logger from GetX
  static void _log(String value) {
    developer.log(value, name: 'RestartService');
  }

  static S put<S extends RestartServiceInterface>(
    S dependency, {
    String? tag,
  }) {
    final key = _getKey(S, tag);
    if (!_singl.containsKey(key)) {
      _singl[key] = dependency;
    }
    final dep = _singl[key];
    if (dep == null) _singl[key] = dependency;
    _log('Instance "$S" has been created with tag "$tag"');
    return dep as S;
  }

  static bool delete<S extends RestartServiceInterface>(
      {String? tag, String? key}) {
    final newKey = key ?? _getKey(S, tag);
    if (!_singl.containsKey(newKey)) {
      _log('Instance "$newKey" already removed.');
      return false;
    }
    final dep = _singl[newKey];

    if (dep == null) return false;

    _log('"$newKey" onDelete() called');
    dep.onDelete();
    _singl.remove(newKey);
    _log('"$newKey" deleted from memory');
    return true;
  }

  static void clear() {
    final keys = _singl.keys.toList();
    for (final key in keys) {
      delete(key: key);
    }
  }

  static void restart() {
    clear();
    GetInstance().resetInstance();
    Get.clearTranslations();
    Get.resetRootNavigator();
    Get.forceAppUpdate();
    _log('restart');
  }
}

abstract class RestartServiceInterface {
  void onClose();

  @protected
  void onDelete() {
    onClose();
  }
}
