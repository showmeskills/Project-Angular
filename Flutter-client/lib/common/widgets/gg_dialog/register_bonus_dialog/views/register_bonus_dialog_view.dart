import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/activity/models/register_bonus_model.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/register_bonus_dialog/register_bonus_dialog.dart';
import 'package:gogaming_app/widget_header.dart';

import 'register_bonus_item_view.dart';

class RegisterBonusDialogView extends StatelessWidget {
  RegisterBonusDialogView({
    super.key,
    this.data = const [],
  }) {
    _selected.value = data.firstWhereOrNull((element) => element.isDefault);
  }

  final List<RegisterBonusModel> data;

  final _selected = () {
    RegisterBonusModel? model;
    return model.obs;
  }();

  RegisterBonusModel? get selected => _selected.value;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 8.dp).copyWith(top: 23.dp),
        child: Material(
          color: GGColors.transparent.color,
          elevation: 0,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: ThemeManager.shareInstacne.isDarkMode
                      ? const Color(0xFF172B3C)
                      : const Color(0xFFD9D9D9),
                  borderRadius: BorderRadius.circular(4.dp),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Gaps.vGap56,
                    _buildContent(),
                  ],
                ),
              ),
              Positioned(
                top: -46.dp,
                left: 20.dp,
                right: 20.dp,
                child: _buildHeader(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 103.dp,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.vertical(top: Radius.circular(4.dp)),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF16A77C),
            Color(0xFF39BC9B),
          ],
        ),
      ),
      child: Stack(
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 20.dp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  localized('select_bonus'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle20,
                    fontWeight: GGFontWeigh.bold,
                    color: GGColors.buttonTextWhite.color,
                  ),
                ),
                Gaps.vGap8,
                Text(
                  localized('select_bonus_you_need'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontWeight: GGFontWeigh.bold,
                    color: GGColors.buttonTextWhite.color.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            right: 15.dp,
            child: Image.asset(
              R.registerBonusHeader,
              height: 98.dp,
              fit: BoxFit.contain,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: 20.dp,
        horizontal: 14.dp,
      ),
      decoration: BoxDecoration(
        color: GGColors.alertBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('select_special_bonus'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap10,
          Container(
            constraints: BoxConstraints(
              maxHeight: 83.dp * 3 + 10.dp * 2,
              minHeight: 83.dp * 2 + 10.dp,
            ),
            child: SingleChildScrollView(
              child: Column(
                children: data.map((e) => _buildItem(e)).toList(),
              ),
            ),
          ),
          Gaps.vGap10,
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: 8.dp,
            ),
            child: Obx(() {
              return GGButton.main(
                enable: selected != null,
                onPressed: () {
                  submit(selected!);
                },
                text: localized('confirm_button'),
                textStyle: GGTextStyle(
                  fontSize: GGFontSize.content,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildItem(RegisterBonusModel model) {
    return ScaleTap(
      onPressed: () {
        _selected.value = model;
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 10.dp),
        child: Obx(() {
          return RegisterBonusItemView(
            data: model,
            selected: selected?.prizeCode == model.prizeCode,
          );
        }),
      ),
    );
  }

  void submit(RegisterBonusModel model) {
    SmartDialog.showLoading<void>();
    RegisterBonusDialog.submit(model).doOnData((event) {
      if (event) {
        Get.back<void>();
        Toast.showSuccessful(localized('register_bonus_select_successful'));
      } else {
        Toast.showFailed(localized('register_bonus_select_failed'));
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>();
    }).listen(null, onError: (e) {});
  }
}
