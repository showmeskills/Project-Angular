// ignore_for_file: sized_box_for_whitespace

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'dart:io';
import 'gaming_modify_avatar_logic.dart';

class GamingModifyAvatarPage extends BaseView<GamingModifyAvatarLogic> {
  const GamingModifyAvatarPage({
    super.key,
  });

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const GamingModifyAvatarPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('avatar'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingModifyAvatarLogic());
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height - 100.dp,
      child: Obx(() {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Gaps.vGap20,
            _buildTitle(),
            Gaps.vGap20,
            _buildTabBar(),
            Gaps.vGap20,
            _buildAvatars(),
            const Spacer(),
            _buildBottom(context),
            SizedBox(
              height: Util.iphoneXBottom + 20.dp,
            )
          ],
        );
      }),
    );
  }

  Widget _buildTitle() {
    return Container(
      width: double.infinity,
      alignment: Alignment.centerLeft,
      child: Text(
          controller.imageType.value == 1
              ? localized('sel_avatar')
              : localized('custom_ava'),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
            fontWeight: GGFontWeigh.regular,
          )),
    );
  }

  Widget _buildTabBar() {
    return Container(
      height: 36.dp,
      width: 168.dp,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: GGColors.border.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [_buildTabBarItem(1), _buildTabBarItem(2)],
      ),
    );
  }

  Widget _buildTabBarItem(int type) {
    return InkWell(
      onTap: () {
        controller.changeImageType();
      },
      child: Container(
        width: 84.dp,
        height: 36.dp,
        decoration: BoxDecoration(
          color: controller.imageType.value == type
              ? GGColors.highlightButton.color
              : Colors.transparent,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        alignment: Alignment.center,
        child: Text(
          type == 1 ? localized('default_text') : localized('upload'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.medium,
            color: controller.imageType.value == type
                ? GGColors.buttonTextWhite.color
                : GGColors.textMain.color,
          ),
        ),
      ),
    );
  }

  Widget _buildAvatars() {
    if (controller.imageType.value == 1) {
      return Wrap(
        spacing: 20.dp,
        runSpacing: 20.dp,
        children: controller.avatarIcons.map((e) => _buildAvatar(e)).toList(),
      );
    } else {
      return Obx(() {
        return Column(
          children: [
            Gaps.vGap10,
            controller.imageFilePath.value.isNotEmpty
                ? Image.file(
                    File(controller.imageFilePath.value),
                    width: 90.dp,
                    height: 90.dp,
                    fit: BoxFit.fitHeight,
                  )
                : InkWell(
                    onTap: _pressSelectUpload,
                    child: Image.asset(
                      R.iconAvatarUpload,
                      width: 90.dp,
                      height: 90.dp,
                    ),
                  ),
            Gaps.vGap20,
            Text(
              localized('click_up'),
              style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.hint,
                  fontWeight: GGFontWeigh.regular),
            ),
            Gaps.vGap24,
            Text(
              localized('upload_info_tip00'),
              style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                  fontWeight: GGFontWeigh.regular),
            ),
          ],
        );
      });
    }
  }

  Widget _buildAvatar(String str) {
    final width = 68.dp;
    String assetPath = GamingUserModel.defaultAvatar(str);
    return GestureDetector(
      onTap: () {
        controller.curIcon.value = str;
      },
      child: SizedBox(
        width: width,
        height: width,
        child: Stack(children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(width),
            child: assetPath.contains('http')
                ? GamingImage.network(
                    url: assetPath, width: width, height: width)
                : Image.asset(assetPath, width: width, height: width),
          ),
          Obx(() {
            return Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: controller.curIcon.value == str
                      ? GGColors.brand.color
                      : Colors.transparent,
                  width: 2.dp,
                ),
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(65.dp),
              ),
            );
          })
        ]),
      ),
    );
  }

  Widget _buildBottom(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 48.dp,
      child: Row(
        children: [
          Expanded(
            child: GGButton.minor(
              onPressed: () {
                Navigator.pop(context);
              },
              text: localized('cancels'),
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: GGButton.main(
              enable: controller.enableSure(),
              isLoading: controller.isLoading.value,
              onPressed: () {
                controller.setAvatar();
                // Navigator.of(context).pop();
              },
              text: localized('sure'),
            ),
          ),
        ],
      ),
    );
  }

  void _pressSelectUpload() {
    _showSheet([
      localized("kyc.take_photos"),
      localized("kyc.upload"),
    ], (content) async {
      String str = '';
      if (content == localized("kyc.take_photos")) {
        str = await controller.selectImage(openGallery: false);
      } else {
        str = await controller.selectImage();
      }

      if (str.isNotEmpty) {
        controller.setAvatar();
      }
    });
  }

  void _showSheet(
      List<String> contentList, void Function(String content) selectContent) {
    GamingSelector.simple<String>(
      title: localized("sen_de"),
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: contentList,
      itemBuilder: (context, e, index) {
        return GestureDetector(
          onTap: () {
            selectContent.call(e);
            Get.back<dynamic>();
          },
          child: Container(
            height: 50.dp,
            width: double.infinity,
            color: Colors.transparent,
            child: Center(
              child: Text(
                e,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
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
