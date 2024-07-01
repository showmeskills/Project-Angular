import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/controller_header.dart';

class KycLevelMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    if (KycService().primaryPassed == false &&
        Routes.kycMiddle.route == route) {
      return RouteSettings(name: Routes.kycPrimary.route);
    } else if (Routes.kycAdvance.route == route &&
        KycService().intermediatePassed == false) {
      /// 中级 id 认证已经通过则直接进入 poa 认证页面
      if (KycService().userVerificationForEu?.idFileStatus == 2) {
        return RouteSettings(name: Routes.kycPOA.route);
      }
      return RouteSettings(name: Routes.kycMiddle.route);
    }

    if (Routes.kycMiddle.route == route) {
      if (KycService().userVerificationForEu?.idFileStatus == 2) {
        return RouteSettings(name: Routes.kycPOA.route);
      }
    }

    return super.redirect(route);
  }
}

class KycAdvanceMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    if (Routes.kycAdvance.route == route && !KycService.sharedInstance.isAsia) {
      return RouteSettings(name: Routes.wealthSourceCertificate.route);
    }

    return super.redirect(route);
  }
}
