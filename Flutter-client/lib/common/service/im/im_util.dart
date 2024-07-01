import 'dart:math';

import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/widget_header.dart';

import 'models/im_asset.dart';
import 'models/im_msg_type.dart';

class IMUtil {
  static (double, double) calcThumbnailSize([
    num? originalWidth,
    num? originalHeight,
  ]) {
    // 屏幕2/3宽度 和 当前消息最大宽度 取最小值
    final screenWidth = min(Get.width / 3 * 2,
        Get.width - 16.dp * 2 - 10.dp * 2 - 50.dp - 6.dp - 34.dp);
    if ((originalWidth ?? 0) == 0 || (originalHeight ?? 0) == 0) {
      originalWidth = 90.dp;
      originalHeight = 160.dp;
    }
    final maxWidth = min(originalWidth!, screenWidth).toDouble();
    double? width;
    double? height;
    final ratio = originalWidth / originalHeight!;
    if (ratio < 0.33) {
      width = maxWidth * 0.33;
      height = maxWidth;
    } else if (ratio >= 0.33 && ratio <= 1) {
      width = maxWidth * ratio;
      height = width / ratio;
    } else if (ratio >= 1 && ratio < 3) {
      width = maxWidth;
      height = width / ratio;
    } else if (ratio >= 3) {
      width = maxWidth;
      height = width / 3;
    }
    return (width!, height!);
  }

  // content padding + item padding
  static double nonContentPadding() {
    return 10.dp * 2 + 5.dp * 2;
  }

  // 图片消息高度
  static double calcDateTimeHeight(String text) {
    TextPainter textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
        ),
      ),
      maxLines: 1,
      textDirection: TextDirection.ltr,
    );
    // 单行文本，无需考虑布局宽度
    textPainter.layout();
    return textPainter.height + 10.dp * 2;
  }

  // 图片消息高度
  static double calcImageMessageHeight(IMAsset asset) {
    final (_, height) = calcThumbnailSize(asset.width, asset.height);

    return height + nonContentPadding();
  }

  // 视频消息高度
  static double calcVideoMessageHeight(IMAsset asset) {
    final hasCoverUrl = asset.coverUrl?.isNotEmpty == true;
    final (_, height) = hasCoverUrl
        ? calcThumbnailSize(asset.width, asset.height)
        : calcThumbnailSize();

    return height + nonContentPadding();
  }

  // 文件消息高度
  static double calcFileMessageHeight(String? text) {
    double height = 0;
    if (text is String) {
      TextPainter textPainter = TextPainter(
        text: TextSpan(
          text: text,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
          ),
        ),
        maxLines: 1,
        textDirection: TextDirection.ltr,
      );
      // 单行文本，无需考虑布局宽度
      textPainter.layout();
      height = textPainter.height;
    }

    return max(height, 20.dp) + nonContentPadding();
  }

  // 文字消息高度
  static double calcTextMessageHeight(String text, {bool isSelf = false}) {
    TextPainter textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    // maxWidth = 屏幕宽度 - item padding - content padding - status widget - gaps - avatar
    textPainter.layout(
        maxWidth: Get.width -
            16.dp * 2 -
            10.dp * 2 -
            14.dp -
            6.dp -
            (isSelf ? 0 : 24.dp + 10.dp));

    return textPainter.height + nonContentPadding();
  }

  // 图文混排消息高度
  static double calcRichTextMessageHeight(ChatContentModel model) {
    final text = model.contentText;
    final reg = RegExp(
      r'#{\d+}#',
      caseSensitive: false,
      dotAll: true,
    );
    // 使用 RegExp 对象的 allMatches 方法来找到所有的匹配项
    final matches = reg.allMatches(text).toList();

    // 创建一个空的 TextSpan 列表
    List<InlineSpan> spans = [];

    int start = 0;

    double mediaHeight = 0;

    List<PlaceholderDimensions> placeholderDimensions = [];

    // 遍历所有的匹配项
    for (var match in matches) {
      // 添加匹配项之前的文本
      if (start != match.start) {
        spans.add(TextSpan(text: text.substring(start, match.start)));
      }

      // 添加匹配项，并将其高亮显示
      final fId = text.substring(match.start + 2, match.end - 2);
      final asset =
          model.assets?.firstWhereOrNull((element) => element.fId == fId);
      double height = 0;
      if (asset?.url?.isNotEmpty == true) {
        if (asset?.isImage ?? false) {
          height += calcImageMessageHeight(asset!);
        } else if (asset?.isVideo ?? false) {
          height += calcVideoMessageHeight(asset!);
        } else {
          height += calcFileMessageHeight(asset!.fileName);
        }
        if (match.end != text.length) {
          height += 6.dp;
        }
        if (spans.isNotEmpty) {
          if (spans.last is TextSpan && (spans.last as TextSpan).text != '\n') {
            spans.add(const TextSpan(text: '\n'));
            height += 6.dp;
          }
        }
        spans.add(WidgetSpan(child: Container()));
        placeholderDimensions.add(const PlaceholderDimensions(
          size: Size.zero,
          alignment: PlaceholderAlignment.bottom,
        ));
        if (match.end != text.length) {
          spans.add(const TextSpan(text: '\n'));
        }
        mediaHeight += height;
      }
      start = match.end;
    }

    // 添加最后一个匹配项之后的文本
    spans.add(TextSpan(text: text.substring(start)));

    TextPainter textPainter = TextPainter(
      text: TextSpan(
        children: spans,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..setPlaceholderDimensions(placeholderDimensions);
    // maxWidth = 屏幕宽度 - item padding - content padding - status widget - gaps - avatar
    textPainter.layout(
        maxWidth: Get.width -
            16.dp * 2 -
            10.dp * 2 -
            14.dp -
            6.dp -
            (model.isSelf ? 0 : 24.dp + 10.dp));

    return textPainter.height + nonContentPadding() + mediaHeight;
  }

  static double? calcMessageHeight(ChatContentModel model) {
    double? contentHeight;

    switch (model.contentType) {
      case IMMsgType.text:
        contentHeight = calcTextMessageHeight(
          model.contentText,
          isSelf: model.isSelf,
        );
      case IMMsgType.image:
        final asset = model.assets?.first;
        contentHeight = calcImageMessageHeight(asset!);
      case IMMsgType.file:
        final asset = model.assets?.first;
        contentHeight = calcFileMessageHeight(
          asset?.fileName ?? '',
        );
      case IMMsgType.video:
        final asset = model.assets?.first;
        if (asset is IMAsset &&
            (asset.url?.isNotEmpty == true || model.localFileName.isNotEmpty)) {
          contentHeight = calcVideoMessageHeight(asset);
        } else {
          contentHeight = calcTextMessageHeight(
            localized('unknown_message_type'),
            isSelf: model.isSelf,
          );
        }
      case IMMsgType.textAndImage:
        contentHeight = calcRichTextMessageHeight(model);
      default:
        contentHeight = null;
    }
    // 计算出消息内容高度后，再加上时间高度
    if (contentHeight != null && !model.isHiddenTime) {
      return contentHeight + calcDateTimeHeight(model.formatDateTime!);
    }
    return contentHeight;
  }
}
