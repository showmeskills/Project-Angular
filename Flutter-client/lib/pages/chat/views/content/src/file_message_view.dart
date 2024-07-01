import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_asset.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:path/path.dart' as p;

class FileMessageView extends StatelessWidget {
  const FileMessageView({
    super.key,
    required this.data,
  });

  final ChatContentModel data;

  @override
  Widget build(BuildContext context) {
    final isSelf = data.isSelf;
    return IMFileView(
      asset: data.assets!.first.copyWith(
        url: data.localFileName.isNotEmpty ? data.localFileName : null,
      ),
      isSelf: isSelf,
    );
  }
}

class IMFileView extends StatelessWidget {
  const IMFileView({
    super.key,
    required this.asset,
    this.isSelf = false,
  });

  final IMAsset asset;
  final bool isSelf;
  String? get fileName => asset.fileName;

  @override
  Widget build(BuildContext context) {
    final gap = Gaps.hGap6;
    return InkWell(
      onTap: _onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildIcon(),
          gap,
          Flexible(child: _buildText()),
        ],
      ),
    );
  }

  Widget _buildIcon() {
    return GamingImage.asset(
      asset.isPDF ? R.iconIconPdf : R.iconIconZip,
      width: 20.dp,
      height: 20.dp,
    );
  }

  Widget _buildText() {
    final style = GGTextStyle(
      fontSize: GGFontSize.content,
      color: isSelf ? GGColors.textMain.color : GGColors.buttonTextWhite.color,
    );
    if (fileName is String) {
      final basename = p.basenameWithoutExtension(fileName!);
      final ext = p.extension(fileName!);
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Text(
              basename,
              style: style,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            ext,
            style: style,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    } else {
      return Container();
    }
  }

  void _onPressed() {
    if (asset.isPDF) {
      final url = asset.url ?? '';
      Get.toNamed<void>(Routes.pdfViewer.route, arguments: {
        'pdfUrl': url,
        'fileName': fileName,
      });
    }
  }
}
