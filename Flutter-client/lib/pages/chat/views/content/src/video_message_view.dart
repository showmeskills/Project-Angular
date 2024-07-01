import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/im/im_util.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_asset.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

import 'image_message_view.dart';
import 'unknown_message_view.dart';

class VideoMessageView extends StatelessWidget {
  const VideoMessageView({super.key, required this.data});
  final ChatContentModel data;

  @override
  Widget build(BuildContext context) {
    final asset = data.assets?.first;
    //h5无法拿到视频文件信息
    if (asset is IMAsset &&
        (asset.url?.isNotEmpty == true || data.localFileName.isNotEmpty)) {
      // 视频文件存在或者本地视频文件存在
      return IMVideoCover(
        heroTag: data.localId,
        asset: asset.copyWith(
          url: data.localFileName.isNotEmpty ? data.localFileName : null,
        ),
      );
    } else {
      return UnknownMessageView(
        isSelf: data.isSelf,
      );
    }
  }
}

class IMVideoCover extends StatelessWidget {
  const IMVideoCover({super.key, required this.heroTag, required this.asset});

  final IMAsset asset;

  final String heroTag;

  @override
  Widget build(BuildContext context) {
    //h5无法拿到视频文件信息
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _onPressVideo,
      child: Stack(
        children: [
          _buildImage(),
          Positioned.fill(child: _buildMask()),
        ],
      ),
    );
  }

  Widget _buildImage() {
    // 判断没有封面图 显示黑色块
    final coverUrl = asset.coverUrl;
    if (coverUrl?.isNotEmpty == false) {
      final (width, height) = IMUtil.calcThumbnailSize(
        asset.width,
        asset.height,
      );
      return Container(
        width: width,
        height: height,
        decoration: const BoxDecoration(
          color: Colors.black,
        ),
      );
    }
    // 存在封面图，使用IMImage组件加载
    return IMImage(
      heroTag: heroTag,
      asset: asset.copyWith(
        url: coverUrl,
      ),
      onTap: () {},
    );
  }

  Widget _buildMask() {
    final value = asset.duration;
    if (value is! num) return const SizedBox();
    int? hours, min, sec;
    int timestamp = value.floor();

    if (timestamp >= 3600) {
      hours = (timestamp / 3600).floor();
      timestamp -= hours * 3600;
    } else {
      hours = 0;
    }
    if (timestamp >= 60) {
      min = (timestamp / 60).floor();
      timestamp -= min * 60;
    } else {
      min = 0;
    }
    sec = timestamp.toInt();
    String time = '$sec'.padLeft(2, '0');
    if (min >= 0) {
      time = '${min.toString().padLeft(2, '0')}:$time';
    }
    if (hours > 0) {
      time = '$hours:$time';
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Colors.black45,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GamingImage.asset(
            R.iconVideoTutorial,
            width: 51.dp,
            height: 51.dp,
            color: GGColors.buttonTextWhite.color,
          ),
          Padding(
            padding: const EdgeInsets.all(5.0),
            child: Text(
              time,
              style: GGTextStyle(
                color: GGColors.buttonTextWhite.color,
                fontSize: GGFontSize.content,
                fontFamily: GGFontFamily.dingPro,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onPressVideo() {
    Get.toNamed<void>(
      Routes.videoPlayer.route,
      arguments: {
        'url': asset.url,
      },
    );
  }
}
