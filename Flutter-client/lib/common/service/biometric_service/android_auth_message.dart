// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// ignore_for_file: depend_on_referenced_packages

import 'package:gogaming_app/widget_header.dart';

import 'package:local_auth_android/types/auth_messages_android.dart';

/// Android side authentication messages.
///
/// Provides default values for all messages.

class AndroidCustomAuthMessages extends AndroidAuthMessages {
  /// Constructs a new instance.
  const AndroidCustomAuthMessages({
    super.biometricHint,
    super.biometricNotRecognized,
    super.biometricRequiredTitle,
    super.biometricSuccess,
    super.cancelButton,
    super.deviceCredentialsRequiredTitle,
    super.deviceCredentialsSetupDescription,
    super.goToSettingsButton,
    super.goToSettingsDescription,
    super.signInTitle,
  });

  @override
  Map<String, String> get args {
    return <String, String>{
      'biometricHint': biometricHint ?? androidBiometricHint,
      'biometricNotRecognized':
          biometricNotRecognized ?? androidBiometricNotRecognized,
      'biometricSuccess': biometricSuccess ?? androidBiometricSuccess,
      'biometricRequired':
          biometricRequiredTitle ?? androidBiometricRequiredTitle,
      'cancelButton': cancelButton ?? androidCancelButton,
      'deviceCredentialsRequired': deviceCredentialsRequiredTitle ??
          androidDeviceCredentialsRequiredTitle,
      'deviceCredentialsSetupDescription': deviceCredentialsSetupDescription ??
          androidDeviceCredentialsSetupDescription,
      'goToSetting': goToSettingsButton ?? goToSettings,
      'goToSettingDescription':
          goToSettingsDescription ?? androidGoToSettingsDescription,
      'signInTitle': signInTitle ?? androidSignInTitle,
    };
  }
}

// Default strings for AndroidAuthMessages. Currently supports English.
// Intl.message must be string literals.

/// Message shown on a button that the user can click to go to settings pages
/// from the current dialog.
String get goToSettings => localized('go_to_settings');

/// Hint message advising the user how to authenticate with biometrics.
String get androidBiometricHint => localized('verify_identity');

/// Message to let the user know that authentication was failed.
String get androidBiometricNotRecognized => localized('not_recognized');

/// Message to let the user know that authentication was successful. It
String get androidBiometricSuccess => localized('successful');

/// Message shown on a button that the user can click to leave the
/// current dialog.
String get androidCancelButton => localized('cancels');

/// Message shown as a title in a dialog which indicates the user
/// that they need to scan biometric to continue.
String get androidSignInTitle => localized('authentication_required');

/// Message shown as a title in a dialog which indicates the user
/// has not set up biometric authentication on their device.
String get androidBiometricRequiredTitle => localized('biometric_required');

/// Message shown as a title in a dialog which indicates the user
/// has not set up credentials authentication on their device.
String get androidDeviceCredentialsRequiredTitle =>
    localized('device_credentials_required');

/// Message advising the user to go to the settings and configure
/// device credentials on their device.
String get androidDeviceCredentialsSetupDescription =>
    localized('device_credentials_required');

/// Message advising the user to go to the settings and configure
/// biometric on their device.
String get androidGoToSettingsDescription =>
    localized('go_to_settings_description');
