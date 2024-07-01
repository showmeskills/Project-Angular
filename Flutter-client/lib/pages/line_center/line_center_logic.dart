import 'dart:async';
import 'dart:convert';
import 'package:gogaming_app/widget_header.dart';

import 'package:gogaming_app/common/service/merchant_service/config_service.dart';
import 'package:gogaming_app/controller_header.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';
import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/service/restart_service.dart';
import '../../common/utils/util.dart';
import 'line_center_state.dart';

class LineCenterLogic extends BaseController {
  final LineCenterState state = LineCenterState();

  @override
  void onInit() {
    super.onInit();

    MerchantService.sharedInstance.getMerchantConfig().listen((event) {
      if (event != null) {
        state.appLogo.value = event.appLogo;
        final domainArrayStr = GGUtil.parseStr(event.config?.domainArray);
        final domainArray = jsonDecode(domainArrayStr);
        if (domainArray is List && domainArray.isNotEmpty) {
          for (dynamic domain in domainArray) {
            if (domain is String) {
              final model = LineCenterDomainModel();
              model.domain = domain;
              state.domainList.add(model);
            }
          }
        }
        _loadDomainDelay();
      }
    });
  }

  Future<void> _loadDomainDelay() async {
    for (LineCenterDomainModel model in state.domainList) {
      final start = DateTime.now();
      final completer = Completer<String?>();
      const timeoutDuration = Duration(seconds: 2);
      ConfigService.sharedInstance.checkDomainAvailability(
        GGUtil.parseStr(model.domain),
        completer,
        duration: timeoutDuration,
      );
      final result =
          await completer.future.timeout(timeoutDuration, onTimeout: () {
        return null;
      });
      if (result != null) {
        final end = DateTime.now();
        model.delay = "${end.difference(start).inMilliseconds.toString()}ms";
      } else {
        model.delay = localized('time_expired');
      }
      state.domainList.refresh();
    }
  }

  void changeDomain(String domain) {
    ConfigService.sharedInstance.updateDomain(domain);
    GamingTagService.sharedInstance.restore();
    RestartService.restart();
  }
}
