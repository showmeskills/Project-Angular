import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_config_model.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';

import 'package:zendesk_messaging/zendesk_messaging.dart';

class ZendeskService {
  factory ZendeskService() => _getInstance();

  static ZendeskService get sharedInstance => _getInstance();

  static ZendeskService? _instance;

  ZendeskService._internal() {
    // 初始化
    MerchantService().getMerchantConfig().listen((event) {
      if (event != null) {
        model = event.config;
      }
      ZendeskMessaging.initialize(
        androidChannelKey: androidChannelKey,
        iosChannelKey: iosChannelKey,
      );
    });
  }

  // 获取对象
  static ZendeskService _getInstance() {
    _instance ??= ZendeskService._internal();
    return _instance!;
  }

  MerchantCustomConfig? model;

  String get androidChannelKey =>
      model?.androidChannelKey ??
      'eyJzZXR0aW5nc191cmwiOiJodHRwczovL3FiZXRzdXBwb3J0MTY5NjQ5MTk3OC56ZW5kZXNrLmNvbS9tb2JpbGVfc2RrX2FwaS9zZXR0aW5ncy8wMUhEWlBKNzBDQkIyWFEwM1FHOTdCS01NMy5qc29uIn0=';

  String get iosChannelKey =>
      model?.iosChannelKey ??
      'eyJzZXR0aW5nc191cmwiOiJodHRwczovL3FiZXRzdXBwb3J0MTY5NjQ5MTk3OC56ZW5kZXNrLmNvbS9tb2JpbGVfc2RrX2FwaS9zZXR0aW5ncy8wMUhEWlBRWldaNTFISEZCM0ZTWVpEMjRGUS5qc29uIn0=';

  // @override
  // void onClose() {
  //   super.onClose();
  //   ZendeskMessaging.invalidate();
  // }

  Future<void> show() async {
    final isInitialized = await ZendeskMessaging.isInitialized();
    if (!isInitialized) {
      SmartDialog.showLoading<void>();
    }
    
    ZendeskMessaging.show().then((value) {
      SmartDialog.dismiss<void>();
    }, onError: (_) {
      SmartDialog.dismiss<void>();
      Toast.showFailed();
    });
  }
}
