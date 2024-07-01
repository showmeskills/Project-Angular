import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/bank_card/list/bank_card_list_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import 'views/bank_card_list_item.dart';

part 'views/_bank_card_list_bottom_bar.dart';

class BankCardListPage extends StatelessWidget with BaseRefreshViewDelegate {
  const BankCardListPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const BankCardListPage(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.put(BankCardListLogic());
    return Scaffold(
      backgroundColor: GGColors.background.color,
      appBar: GGAppBar.userBottomAppbar(
        title: localized('bc_manage'),
        trailingWidgets: [
          Obx(() {
            if (c.data.isEmpty) {
              return Gaps.empty;
            }
            return _buildBatchButton();
          })
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              child: Obx(
                () => RefreshView(
                    controller: logic,
                    delegate: this,
                    child: ListView.builder(
                      itemBuilder: (context, index) {
                        return BankCardListItem(data: c.data[index]);
                      },
                      itemCount: c.data.length,
                    )),
              ),
            ),
          ),
          const _BankCardListBottomBar(),
        ],
      ),
    );
  }

  BankCardListLogic get logic => Get.find<BankCardListLogic>();

  @override
  RefreshViewController get renderController => logic.controller;

  Widget _buildBatchButton() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: logic.toggleBatch,
      child: Container(
        height: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        alignment: Alignment.center,
        child: Obx(
          () => logic.batch
              ? Text(
                  localized('finish'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.brand.color,
                  ),
                )
              : SvgPicture.asset(
                  R.iconEdit,
                  width: 17.dp,
                  height: 14.dp,
                  color: GGColors.textSecond.color,
                ),
        ),
      ),
    );
  }
}
