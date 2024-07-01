import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/biometric/models/biometric_model.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'biometric_management_logic.dart';
part 'views/_biometric_management_item.dart';
part 'views/_biometric_rename_textfield_view.dart';
part 'views/_biometric_delete_textfield_view.dart';

class BiometricManagementPage extends BaseView<BiometricManagementLogic>
    with BaseRefreshViewDelegate {
  const BiometricManagementPage({super.key});

  BiometricManagementState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const BiometricManagementPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('biometric'),
    );
  }

  @override
  String? get emptyText => localized('no_add');

  @override
  bool resizeToAvoidBottomInset() {
    return false;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(BiometricManagementLogic());
    return Obx(() => Column(
          children: [
            Expanded(
              child: RefreshView(
                delegate: this,
                controller: controller,
                child: ListView.builder(
                  padding: EdgeInsets.symmetric(horizontal: 16.dp)
                      .copyWith(top: 12.dp),
                  itemBuilder: (context, index) {
                    return _BiometricManagementItem(data: state.data[index]);
                  },
                  itemCount: state.data.length,
                ),
              ),
            ),
            SafeArea(
              bottom: true,
              maintainBottomViewPadding: true,
              minimum: EdgeInsets.only(bottom: 24.dp),
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: 24.dp),
                child: Obx(() {
                  String text = localized('biometric_add');

                  /// 当前设备已录入
                  if (state.activated) {
                    text = localized('biometric_on');
                  }

                  return GGButton.main(
                    onPressed: add,
                    enable: !state.activated,
                    text: text,
                  );
                }),
              ),
            ),
          ],
        ));
  }

  @override
  RefreshViewController get renderController => controller.controller;
}

extension _Action on BiometricManagementPage {
  void add() {
    controller.add();
  }
}
