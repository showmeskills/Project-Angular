// ignore_for_file: unused_element

import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import '../../api/base/go_gaming_service.dart';

enum WebUrl with GoGamingWebUrl {
  referralHome(),
  helpCenterFaqArticle(),
  helpCenterArticle(),
  helpCenter(),
  activity(),
  guessingActivity(),
  guessingActivityNow(),
  freeGuessActivity(),
  announcement();

  @override
  List<String>? get pros => [];

  @override
  bool get needToken {
    switch (this) {
      case WebUrl.helpCenter:
      case WebUrl.announcement:
      case WebUrl.helpCenterArticle:
      case WebUrl.helpCenterFaqArticle:
        return false;
      case WebUrl.referralHome:
      case WebUrl.activity:
      case WebUrl.guessingActivity:
      case WebUrl.freeGuessActivity:
      case WebUrl.guessingActivityNow:
        return true;
    }
  }

  @override
  String get path {
    switch (this) {
      case WebUrl.referralHome:
        return '/${GoGamingService.sharedInstance.apiLang}/referral/home';
      case WebUrl.helpCenterFaqArticle:
        return '/${GoGamingService.sharedInstance.apiLang}/help-center/faq/{x}?articleCode={x}';
      case WebUrl.helpCenter:
        return '/${GoGamingService.sharedInstance.apiLang}/help-center/faq';
      case WebUrl.announcement:
        return '/${GoGamingService.sharedInstance.apiLang}/help-center/announcement';
      case WebUrl.activity:
        return '/${GoGamingService.sharedInstance.apiLang}/promotions/offer/{x}';
      case WebUrl.guessingActivity:
        return '/${GoGamingService.sharedInstance.apiLang}/activity/betfreejackpot/{x}/home';
      case WebUrl.helpCenterArticle:
        return '/${GoGamingService.sharedInstance.apiLang}/help-center/announcement/{x}?articleCode={x}';
      case WebUrl.freeGuessActivity:
        return '/${GoGamingService.sharedInstance.apiLang}/activity/betfreejackpot/caption';
      case WebUrl.guessingActivityNow:
        return '/${GoGamingService.sharedInstance.apiLang}/activity/betfreejackpot/now';
    }
  }
}
