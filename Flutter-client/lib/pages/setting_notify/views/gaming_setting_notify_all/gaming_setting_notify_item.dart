// ignore_for_file: sized_box_for_whitespace, avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/user_notice/models/gaming_notification_list.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/pages/setting_notify/gaming_setting_notify_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../gaming_setting_notify_detail/gaming_setting_notify_detail_view.dart';

class GamingSettingNotifyItem extends StatelessWidget {
  const GamingSettingNotifyItem({Key? key, required this.data})
      : super(key: key);
  final GamingNotificationItem data;

  GamingSettingNotifyLogic get baseController =>
      Get.find<GamingSettingNotifyLogic>();

  @override
  Widget build(BuildContext context) {
    return _buildContent(context);
  }

  Widget _buildContent(BuildContext context) {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: _onClickDetail,
      child: Container(
        constraints: BoxConstraints(
          maxHeight: 111.dp,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 22.dp,
              alignment: Alignment.center,
              child: Stack(
                children: [
                  Image.asset(
                    R.iconNotifyIcon,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                  Positioned(
                    right: 0.dp,
                    child: Visibility(
                      visible: !GGUtil.parseBool(data.isReaded),
                      child: Container(
                        width: 4.dp,
                        height: 4.dp,
                        decoration: BoxDecoration(
                            color: GGColors.success.color,
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(4.dp),
                            )),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Gaps.hGap8,
            Container(
              width: 313.dp,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildTitle(),
                  Gaps.vGap8,
                  _buildContentItem(),
                  Gaps.vGap8,
                  _buildTime()
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return Container(
      height: 22.dp,
      alignment: Alignment.topLeft,
      child: Text(GGUtil.parseStr(data.title),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textMain.color,
          )),
    );
  }

  Widget _buildContentItem() {
    return Container(
      child: Text(
        GGUtil.parseStr(data.defaultContent), //data.title ?? '',
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _buildTime() {
    return Text(
      data.getTime,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }
}

extension _Action on GamingSettingNotifyItem {
  void _onClickDetail() {
    baseController.readNotice([GGUtil.parseInt(data.id)]);

    Get.to<dynamic>(() => GamingSettingNotifyDetail(data));
  }
}
