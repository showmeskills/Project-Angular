// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// ignore_for_file: depend_on_referenced_packages

import 'package:flutter/foundation.dart';
import 'package:gogaming_app/widget_header.dart';

import 'package:local_auth_ios/types/auth_messages_ios.dart';

/// Class wrapping all authentication messages needed on iOS.
/// Provides default values for all messages.
@immutable
class IOSCustomAuthMessages extends IOSAuthMessages {
  /// Constructs a new instance.
  const IOSCustomAuthMessages({
    super.lockOut,
    super.goToSettingsButton,
    super.goToSettingsDescription,
    super.cancelButton,
    super.localizedFallbackTitle,
  });

  @override
  Map<String, String> get args {
    return <String, String>{
      'lockOut': lockOut ?? iOSLockOut,
      'goToSetting': goToSettingsButton ?? goToSettings,
      'goToSettingDescriptionIOS':
          goToSettingsDescription ?? iOSGoToSettingsDescription,
      'okButton': cancelButton ?? iOSOkButton,
      if (localizedFallbackTitle != null)
        'localizedFallbackTitle': localizedFallbackTitle!,
    };
  }
}

// Default Strings for IOSAuthMessages plugin. Currently supports English.
// Intl.message must be string literals.

/// Message shown on a button that the user can click to go to settings pages
/// from the current dialog.
String get iOSGoToSettings => localized('go_to_settings');

/// Message advising the user to re-enable biometrics on their device.
/// It shows in a dialog on iOS.
String get iOSLockOut => localized('ios_lock_out');

/// Message advising the user to go to the settings and configure Biometrics
/// for their device.
String get iOSGoToSettingsDescription =>
    localized('go_to_settings_ios_description');

/// Message shown on a button that the user can click to leave the current
/// dialog.
String get iOSOkButton => localized('sure');
