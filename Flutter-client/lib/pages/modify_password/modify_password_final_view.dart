import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gg_button.dart';
import '../../generated/r.dart';
import 'modify_password_final_logic.dart';

class ModifyPasswordFinalPage extends BaseView<ModifyPasswordFinalLogic> {
  const ModifyPasswordFinalPage({super.key});

  @override
  Widget body(BuildContext context) {
    Get.put(ModifyPasswordFinalLogic());
    return Stack(
      children: [
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                "${localized("chage_paswd00")}${localized("successfully")}",
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.smallTitle,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
              SizedBox(height: 24.dp),
              Image.asset(
                R.commonDialogSuccessBig,
                width: 92.dp,
                height: 92.dp,
              ),
              SizedBox(height: 24.dp),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 32.dp),
                child: Text(
                  localized("use_new_pwd_msg"),
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.content,
                    fontWeight: GGFontWeigh.regular,
                  ),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          bottom: Util.iphoneXBottom,
          right: 16.dp,
          left: 16.dp,
          child: _buildSubmitButton(),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: GGButton(
        onPressed: () => controller.sure(),
        enable: true,
        isLoading: false,
        text: getLocalString('login_button'),
      ),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) =>
      GGAppBar.normal(title: localized("change_pwd"));
}
