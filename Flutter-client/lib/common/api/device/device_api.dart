// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Device with GoGamingApi {
  history(params: {
    'pageIndex': 1,
    'pageSize': 10,
  }),
  getDeviceLog(params: {
    'deviceId': 0,
    'pageIndex': 1,
    'pageSize': 10,
  }),
  delete(data: {
    'deviceId': 0,
  });

  const Device({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Device.history:
        return '/member/history/devices';
      case Device.getDeviceLog:
        return '/member/history/getdevicelog';
      case Device.delete:
        return '/member/history/deletedevice';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Device.history:
      case Device.getDeviceLog:
        return HTTPMethod.get;
      case Device.delete:
        return HTTPMethod.post;
    }
  }
}
