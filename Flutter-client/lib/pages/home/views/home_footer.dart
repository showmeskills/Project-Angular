import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/footer/models/footer_license_model.dart';
import 'package:gogaming_app/common/api/footer/models/footer_menu_model.dart';
import 'package:gogaming_app/common/api/language/models/gaming_language.dart';
import 'package:gogaming_app/common/service/gaming_tag_service/gaming_tag_service.dart';
import 'package:gogaming_app/common/service/language_service.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/user_setting.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/pages/home/home_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/service/account_service.dart';
import '../../../common/widgets/gaming_selector/gaming_selector.dart';

class HomeFooter extends StatefulWidget {
  const HomeFooter({super.key});

  @override
  State<HomeFooter> createState() => _HomeFooterState();
}

class _HomeFooterState extends State<HomeFooter> {
  HomeLogic get controller => Get.find<HomeLogic>();

  RxString currentLanguage = "".obs;
  RxString currentLanguageIcon = "".obs;
  RxList<String> optionalLanguages = <String>[].obs;
  final Map<String, String> _optionalLanguagesConfig = <String, String>{};

  @override
  void initState() {
    super.initState();
    _loadDefaultLanguage();
    _loadLanguagesConfig();
  }

  void pressSetLanguage({VoidCallback? onSucessCallBack}) {
    if (optionalLanguages.isNotEmpty) {
      onSucessCallBack?.call();
    } else {
      SmartDialog.showLoading<void>();
      _getLanguagesConfig().doOnError((err, p1) {
        SmartDialog.dismiss<void>();
        if (err is GoGamingResponse) {
          Toast.showFailed(err.message);
        } else {
          Toast.showTryLater();
        }
      }).doOnData((event) {
        SmartDialog.dismiss<void>();
        onSucessCallBack?.call();
      }).listen((event) {}, onError: (p0, p1) {});
    }
  }

  Stream<List<GamingLanguage>> _getLanguagesConfig() {
    return LanguageService.sharedInstance.getLanguage().doOnData((event) {
      final list = GamingLanguage.localeConfig
          .map((e) => localized(e["code"] as String))
          .toList();
      List<String> tempOptionalLanguages = <String>[];
      for (String code in list) {
        GamingLanguage? language = event.firstWhereOrNull((element) {
          return element.code?.split("-").first.toLowerCase() ==
              code.toLowerCase();
        });
        if (language != null &&
            language.name != null &&
            language.code != null) {
          _optionalLanguagesConfig[language.name!] = language.code!;
          tempOptionalLanguages.add(language.name!);
        }
      }
      optionalLanguages.value = tempOptionalLanguages;
      _loadDefaultLanguage();
    });
  }

  void _loadLanguagesConfig() {
    _getLanguagesConfig().listen((event) {});
  }

  void _loadDefaultLanguage() {
    final locale = AppLocalizations.of(Get.context!).locale;
    for (var element in GamingLanguage.localeConfig) {
      if (locale.languageCode.contains(element["code"] ?? "")) {
        currentLanguage.value = element["name"]?.toLowerCase() ?? "";
        currentLanguageIcon.value = element["png"] ?? "";
        String str = currentLanguage.value.split("-").first.toLowerCase();
        String langCode = _optionalLanguagesConfig[str] ?? '';
        if (UserSetting.sharedInstance.lang != langCode &&
            langCode.isNotEmpty) {
          UserSetting.sharedInstance.lang = langCode;
          UserSetting.sharedInstance.async();
        }
        break;
      }
    }
  }

  void _setLanguage(String langCode) async {
    Map<String, String>? result =
        GamingLanguage.localeConfig.firstWhereOrNull((element) {
      return langCode.split("-").first.toLowerCase() ==
          element['code']!.toLowerCase();
    });
    AccountService.sharedInstance.updateDefaultLanguage(langCode).listen(null);
    if (result != null) {
      // 防止重建APP 打断了bottomSheet的pop动画,添加延迟
      Future.delayed(const Duration(milliseconds: 500), () {
        UserSetting.sharedInstance.lang = langCode;
        UserSetting.sharedInstance.async();
        Locale newLocale = Locale(result["code"]!, result['countryCode']);
        AppLocalizations.of(Get.context!).locale = newLocale;
        GamingTagService.sharedInstance.restore();
        RestartService.restart();
      });
    }
  }

  void changeLanguage(String content) {
    String? langCode = _optionalLanguagesConfig[content];
    _setLanguage(langCode ?? "");
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: GGColors.homeFootBackground.color,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              HomeFooterMenuItem(type: 'AboutUs'),
              HomeFooterMenuItem(type: 'Product'),
              HomeFooterMenuItem(type: 'Help'),
              HomeFooterMenuItem(type: 'Study'),
              HomeFooterMenuItem(type: 'GamblingAddiction'),
            ],
          ),
          _buildCommunity(),
          _buildLicense(),
          _build18Logo(),
          Container(
            padding: EdgeInsets.only(top: 26.dp, bottom: 28.dp),
            child: Divider(
              indent: 12.dp,
              endIndent: 12.dp,
              height: 1.dp,
              thickness: 1.dp,
              color: GGColors.border.color,
            ),
          ),
          _buildDisclaimer(),
          Gaps.vGap16,
          _buildCopyright(),
          Gaps.vGap24,
        ],
      ),
    );
  }

  Widget _buildCopyright() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 12.dp,
      ),
      child: Text(
        '${localized('copy_right')} ${localized('brand_name')} | All Rights Reserved.',
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.textSecond.color,
        ),
        textAlign: TextAlign.left,
      ),
    );
  }

  Widget _buildDisclaimer() {
    return Obx(() {
      if (controller.state.disclaimer == null) {
        return Gaps.empty;
      }
      return Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 12.dp),
        child: Text(
          controller.state.disclaimer!,
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textSecond.color,
            height: 1.5,
          ),
          textAlign: TextAlign.start,
        ),
      );
    });
  }

  Widget _build18Logo() {
    return Padding(
      padding: EdgeInsets.only(top: 26.dp),
      child: Row(
        // crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.hGap8,
          GamingImage.asset(
            R.icon18logo,
            color: GGColors.textSecond.color,
            width: 36.dp,
            height: 36.dp,
          ),
          Gaps.hGap4,
          Expanded(
            child: Text(
              localized('g_c_b_a_p_r'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLicense() {
    return Obx(() {
      final license = controller.state.footerLicense.length < 2
          ? <FooterLicenseModel>[]
          : List<FooterLicenseModel>.from(controller.state.footerLicense)
              .skip(1);
      if (license.isEmpty) {
        return Gaps.empty;
      }
      return Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 12.dp),
        margin: EdgeInsets.only(top: 22.dp),
        child: LayoutBuilder(builder: (context, constraints) {
          final width = (constraints.maxWidth - 24.dp) ~/ 2;
          return Wrap(
            alignment: WrapAlignment.start,
            runSpacing: 22.dp,
            spacing: 24.dp,
            children: license.map((e) {
              if (!(e.image?.isImageFileName ?? false)) {
                return Gaps.empty;
              }
              return GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => e.launch(),
                child: GamingImage.network(
                  url: e.image!,
                  fit: BoxFit.contain,
                  width: width.toDouble(),
                  errorBuilder: (context, url, error) => const SizedBox(),
                ),
              );
            }).toList(),
          );
        }),
      );
    });
  }

  Widget _buildLanguage() {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: () {
        _pressChangeLanguage();
      },
      child: Container(
        height: 42.dp,
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        padding: EdgeInsets.symmetric(horizontal: 12.dp),
        child: Row(
          children: [
            Obx(() {
              return _arrowContentWidget(currentLanguage.value,
                  onClickBlock: () => _pressChangeLanguage(),
                  frontWidget: currentLanguageIcon.value.isEmpty
                      ? Container()
                      : Image.asset(
                          currentLanguageIcon.value,
                          width: 14.dp,
                          height: 14.dp,
                        ));
            }),
            const Spacer(),
            SvgPicture.asset(
              R.iconArrowDown,
              width: 18.dp,
              height: 18.dp,
              color: GGColors.textSecond.color,
            ),
          ],
        ),
      ),
    );
  }

  Widget _arrowContentWidget(String content,
      {Widget? frontWidget, required void Function() onClickBlock}) {
    return GestureDetectorHitTestWithoutSizeLimit(
      extraHitTestArea: EdgeInsets.all(15.dp),
      onTap: () {
        onClickBlock.call();
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          frontWidget ?? Container(),
          if (frontWidget != null) Gaps.hGap8,
          Text(
            content,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommunity() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 12.dp),
      child: LayoutBuilder(builder: (context, constraints) {
        final width = (constraints.maxWidth - 24.dp) ~/ 2;
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IntrinsicWidth(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Obx(() {
                    final data = controller.state.footerMenu['Community'];
                    if (data == null) {
                      return Container();
                    }
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          height: 48.dp,
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  localized(data.footerType),
                                  style: GGTextStyle(
                                    color: GGColors.textMain.color,
                                    fontSize: GGFontSize.smallTitle,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.only(
                            bottom: 10.dp,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children:
                                List.generate(data.detail.length, (index) {
                              final e = data.detail[index];
                              if (e.title == null) {
                                return const SizedBox();
                              }
                              return Container(
                                margin: EdgeInsets.only(
                                    left: index == 0 ? 0 : 12.dp),
                                child: GestureDetector(
                                  behavior: HitTestBehavior.opaque,
                                  onTap: () => e.launch(),
                                  child: GamingImage.network(
                                    url: e.title!,
                                    width: 24.dp,
                                    height: 24.dp,
                                    fit: BoxFit.contain,
                                    color: GGColors.textSecond.color,
                                  ),
                                ),
                              );
                            }),
                          ),
                        ),
                      ],
                    );
                  }),
                  _buildLanguage(),
                ],
              ),
            ),
            Obx(() {
              if (controller.state.footerLicense.isNotEmpty) {
                final e = controller.state.footerLicense.first;
                if (!(e.image?.isImageFileName ?? false)) {
                  return Gaps.empty;
                }
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => e.launch(),
                  child: GamingImage.network(
                    url: e.image!,
                    fit: BoxFit.contain,
                    width: width.toDouble(),
                    errorBuilder: (context, url, error) => const SizedBox(),
                  ),
                );
              }
              return Gaps.empty;
            }),
          ],
        );
      }),
    );
  }

  // Widget _build

  void _pressChangeLanguage() {
    pressSetLanguage(onSucessCallBack: () {
      _showSheet(
        localized("language_select"),
        optionalLanguages,
        currentLanguage.value,
        (content) {
          changeLanguage(content);
        },
      );
    });
  }

  void _showSheet(
    String title,
    List<String> contentList,
    String currentSelect,
    void Function(String content) selectContent,
  ) {
    GamingSelector.simple<String>(
      title: title,
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: contentList,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () {
            if (e == currentSelect) {
              return;
            }
            selectContent.call(e);
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                e,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: e.toLowerCase() == currentSelect.toLowerCase()
                      ? GGColors.highlightButton.color
                      : GGColors.textMain.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class HomeFooterMenuItem extends StatelessWidget {
  const HomeFooterMenuItem({
    super.key,
    required this.type,
  });
  final String type;
  HomeLogic get controller => Get.find<HomeLogic>();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final data = controller.state.footerMenu[type];
      if (data == null) {
        return Container();
      }
      return Column(
        children: [
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              controller.toggleExpand(type);
            },
            child: Container(
              height: 48.dp,
              alignment: Alignment.centerLeft,
              padding: EdgeInsets.symmetric(
                horizontal: 12.dp,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      localized(type),
                      style: GGTextStyle(
                        color: GGColors.textMain.color,
                        fontSize: GGFontSize.smallTitle,
                      ),
                    ),
                  ),
                  Obx(() {
                    return SvgPicture.asset(
                      controller.state.activeExpanded == type
                          ? R.iconReduce
                          : R.iconAdd,
                      width: 16.dp,
                      height: 16.dp,
                      color: GGColors.textMain.color,
                    );
                  }),
                ],
              ),
            ),
          ),
          Obx(() {
            return SizedBox(
              width: double.infinity,
              height: controller.state.activeExpanded == type ? null : 0,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(data.detail.length, (index) {
                  return GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      data.detail[index].launch();
                    },
                    child: Container(
                      height: 36.dp,
                      alignment: Alignment.centerLeft,
                      padding: EdgeInsets.symmetric(
                        horizontal: 12.dp,
                      ),
                      child: Text(
                        data.detail[index].title ?? '',
                        style: GGTextStyle(
                          color: GGColors.textSecond.color,
                          fontSize: GGFontSize.content,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          }),
        ],
      );
    });
  }
}

extension _Action on FooterMenuModel {
  void launch() {
    bool ignoreToken = footerType == 'AboutUs';
    final bool result = UrlSchemeUtil.navigateTo(
      url,
      title: title,
      ignoreToken: ignoreToken,
      openBrowser: isBlank ?? false,
    );
    if (!result) {
      Toast.showFunDev();
    }
  }
}

extension _Action2 on FooterLicenseModel {
  void launch() {
    final bool result = UrlSchemeUtil.navigateTo(url);
    if (!result) {
      Toast.showFunDev();
    }
  }
}
