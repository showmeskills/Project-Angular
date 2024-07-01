import 'package:base_framework/src.get/get.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/user_setting.dart';
import 'package:gogaming_app/pages/customer_service/zendesk_service.dart';

import 'app_pages.dart';

class CustomerServiceRouter {
  // @override
  // RouteSettings? redirect(String? route) {
  //   if (UserSetting.sharedInstance.lang != 'zh-cn') {
  //     Get.findOrNull<MainLogic>()?.zendeskService.show();
  //   }
  //   return null;
  // }

  bool get isZendeskLang {
    final lang = UserSetting.sharedInstance.lang;
    return Config.isM1 && lang != 'zh-cn' && lang != 'th' && lang != 'vi';
  }

  void toNamed() {
    if (isZendeskLang) {
      ZendeskService.sharedInstance.show();
    } else {
      Get.toNamed<void>(Routes.customerService.route);
    }
  }

  void offNamed() {
    if (isZendeskLang) {
      Get.back<void>();
      ZendeskService.sharedInstance.show();
    } else {
      Get.offNamed<void>(Routes.customerService.route);
    }
  }

  void offAndToNamed() {
    if (isZendeskLang) {
      Get.back<void>();
      ZendeskService.sharedInstance.show();
    } else {
      Get.offAndToNamed<void>(Routes.customerService.route);
    }
  }
}
