import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';

import '../../../common/api/game/models/gaming_game_provider_model.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../config/gaps.dart';
import '../../../generated/r.dart';
import 'gaming_provider_selector_logic.dart';

class GamingSelectProviderSelector extends StatelessWidget {
  const GamingSelectProviderSelector({
    super.key,
    required this.providers,
    required this.selectProviderIds,
    required this.complete,
  });

  final List<GamingGameProviderModel> providers;
  final List<String> selectProviderIds;
  final void Function(List<String> selectProviderIds) complete;

  @override
  Widget build(BuildContext context) {
    final logic = Get.put(GamingSelectProviderLogic());
    logic.providers.value = providers;
    logic.selectProviderIds.value = selectProviderIds;
    logic.complete = complete;
    return MediaQuery.removePadding(
      context: context,
      removeTop: true,
      child: Column(
        children: [
          Expanded(child: Obx(() {
            return ListView.builder(
                itemCount: logic.providers.length,
                itemBuilder: (context, index) {
                  bool isSelect = logic.selectProviderIds
                      .contains(logic.providers[index].providerCatId);
                  return InkWell(
                    onTap: () {
                      logic.selectProvider(
                          logic.providers[index].providerCatId.toString());
                    },
                    child: SizedBox(
                      height: 50.dp,
                      child: Row(
                        children: [
                          Gaps.hGap16,
                          Image.asset(
                            isSelect
                                ? R.loginRegisterCheckBoxBlue
                                : R.loginRegisterUncheckBox,
                            width: 18.dp,
                            height: 18.dp,
                          ),
                          Gaps.hGap6,
                          Text(
                            logic.providers[index].providerName ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: isSelect
                                  ? GGColors.link.color
                                  : GGColors.textMain.color,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            height: 20.dp,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14.dp),
                              color: isSelect
                                  ? GGColors.highlightButton.color
                                  : GGColors.border.color,
                            ),
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.symmetric(horizontal: 8.dp),
                                child: Text(
                                  logic.providers[index].gameCount.toString(),
                                  style: GGTextStyle(
                                    fontSize: GGFontSize.content,
                                    color: isSelect
                                        ? GGColors.buttonTextWhite.color
                                        : GGColors.textMain.color,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Gaps.hGap16,
                        ],
                      ),
                    ),
                  );
                });
          })),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 5.dp),
            child: GestureDetector(
              onTap: () => logic.clearAll(),
              child: Container(
                height: 48.dp,
                decoration: BoxDecoration(
                  color: GGColors.highlightButton.color,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Center(
                  child: Text(
                    localized("all_clear"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.smallTitle,
                      color: GGColors.buttonTextWhite.color,
                    ),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(
            height: Util.iphoneXBottom == 0 ? 20.dp : Util.iphoneXBottom,
          ),
        ],
      ),
    );
  }
}
