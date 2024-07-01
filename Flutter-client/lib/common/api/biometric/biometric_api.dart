// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Biometric with GoGamingApi {
  list(),
  add(data: {
    'clientName': 'x',
  }),
  delete(data: {
    'id': 0,
    'password': 'x',
  }),
  rename(data: {
    'id': 0,
    'deviceName': 'x',
  });

  const Biometric({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Biometric.list:
        return "/member/account/getmemberbiometriclist";
      case Biometric.add:
        return "/member/account/addbiometricdevice";
      case Biometric.delete:
        return "/member/account/delbiometricdevice";
      case Biometric.rename:
        return "/member/account/modifybiometricdevicename";
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Biometric.list:
        return HTTPMethod.get;
      case Biometric.delete:
      case Biometric.add:
      case Biometric.rename:
        return HTTPMethod.post;
    }
  }
}
