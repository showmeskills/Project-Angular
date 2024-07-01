import 'package:base_framework/base_framework.dart';

import '../../../common/service/web_url_service/web_url_model.dart';
import '../../../common/service/web_url_service/web_url_service.dart';

class ActivityDetailState {
  final String activitiesNo;

  String? labelCode;
  bool? intoGuessingHome;

  ActivityDetailState(this.activitiesNo);

  String get webUrl {
    if (labelCode == "guessing" && intoGuessingHome == true) {
      String link = WebUrlService.url(WebUrl.guessingActivityNow.toTarget());
      return link;
    } else {
      String link =
          WebUrlService.url(WebUrl.activity.toTarget(input: [activitiesNo]));
      return link;
    }
  }

  final windowId = RxnInt();
}
