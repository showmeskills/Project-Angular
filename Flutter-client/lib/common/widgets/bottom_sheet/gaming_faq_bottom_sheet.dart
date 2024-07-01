import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/api/faq/models/gaming_faq_model.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../service/web_url_service/web_url_model.dart';
import '../../service/web_url_service/web_url_service.dart';

class GamingFAQBottomSheetData extends RestartServiceInterface {
  factory GamingFAQBottomSheetData() => _getInstance();

  static GamingFAQBottomSheetData get sharedInstance => _getInstance();

  static GamingFAQBottomSheetData? _instance;

  static GamingFAQBottomSheetData _getInstance() {
    if (_instance == null) {
      _instance = GamingFAQBottomSheetData._internal();
      RestartService.put(_instance!);
    }
    return _instance!;
  }

  GamingFAQBottomSheetData._internal();

  Map<FaqTag, List<GamingFaqModel>?> data = const {};

  @override
  void onClose() {
    _instance = null;
  }
}

class GamingFAQBottomSheet {
  static GamingFAQBottomSheetData get data =>
      GamingFAQBottomSheetData.sharedInstance;

  static Future<void> show({
    FaqTag tag = FaqTag.legalCurrencyRecharge,
  }) {
    return GamingBottomSheet.show<void>(
      title: localized('faq'),
      titleExpandBuilder: (context, title, center) {
        return _GamingFAQBottomSheetTitle(title: title);
      },
      builder: (context) {
        final List<GamingFaqModel>? list = data.data[tag];
        return GamingSelectorView<GamingFaqModel>(
          itemBuilder: (context, e, index) {
            return _GamingFAQBottomSheetItem(data: e);
          },
          controller: GamingSelectorController(
            original: list ?? [],
            onLoadDataStream: list != null
                ? null
                : () {
                    return loadDataStream(tag: tag);
                  },
          ),
        );
      },
    );
  }

  static Stream<List<GamingFaqModel>> loadDataStream({
    FaqTag tag = FaqTag.legalCurrencyRecharge,
  }) {
    return PGSpi(Faq.getArticleByTag.toTarget(
      input: {
        'ClientType': 'App',
        'Tag': tag.value,
      },
    )).rxRequest<List<GamingFaqModel>>((value) {
      return (value['data'] as List<dynamic>?)
              ?.map((e) => GamingFaqModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      data.data = Map.from(data.data)..addAll({tag: event});
    });
  }
}

class _GamingFAQBottomSheetTitle extends StatelessWidget {
  const _GamingFAQBottomSheetTitle({
    required this.title,
  });

  final Widget title;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // title,
        Container(
          constraints: BoxConstraints(
              maxWidth: (MediaQuery.of(context).size.width - 100.dp) / 2),
          child: Text(
            localized('faq'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              color: GGColors.textMain.color,
              fontWeight: GGFontWeigh.regular,
            ),
            maxLines: 2,
          ),
        ),
        Gaps.hGap10,
        Expanded(
          child: ScaleTap(
            opacityMinValue: 0.8,
            scaleMinValue: 0.98,
            onPressed: () {
              H5WebViewManager.sharedInstance.openWebView(
                url: WebUrlService.url(WebUrl.helpCenter.toTarget()),
                title: localized('faq'),
              );
            },
            child: Row(
              children: [
                Container(
                  constraints: BoxConstraints(
                      maxWidth:
                          (MediaQuery.of(context).size.width - 70.dp) / 2),
                  child: Text(
                    localized('faqs00'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.smallTitle,
                      color: GGColors.highlightButton.color,
                      fontWeight: GGFontWeigh.regular,
                    ),
                  ),
                ),
                SvgPicture.asset(
                  R.iconArrowRightAlt,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.highlightButton.color,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _GamingFAQBottomSheetItem extends StatelessWidget {
  const _GamingFAQBottomSheetItem({
    required this.data,
  });

  final GamingFaqModel data;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: () {
        H5WebViewManager.sharedInstance.openWebView(
          url: data.webUrl,
          title: localized('faq'),
        );
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 8.dp),
        child: Text(
          data.title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ),
    );
  }
}
