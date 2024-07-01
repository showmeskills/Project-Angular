import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/pdf_viewer/pdf_viewer_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';

class PdfViewerPage extends BaseView<PdfViewerLogic> {
  const PdfViewerPage({
    super.key,
    this.fileName,
    required this.pdfUrl,
  });

  final String pdfUrl;
  final String? fileName;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          PdfViewerPage.argument(Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  factory PdfViewerPage.argument(Map<String, dynamic> arguments) {
    final url = arguments['pdfUrl'] as String;
    final fileName = arguments['fileName'] as String?;
    return PdfViewerPage(
      pdfUrl: url,
      fileName: fileName,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: fileName ?? 'pdf',
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  bool get _isURL {
    final uri = Uri.parse(pdfUrl);
    return uri.isScheme('http') || uri.isScheme('https');
  }

  @override
  Widget body(BuildContext context) {
    Get.put(PdfViewerLogic());
    final pdfWidget = PDF(
      nightMode: ThemeManager().isDarkMode,
      pageFling: false,
      // pageSnap: false,
    );
    return Column(
      children: [
        Container(
          width: double.infinity,
          height: 1.5,
          color: GGColors.border.color,
        ),
        Expanded(
          child: _isURL
              ? pdfWidget.cachedFromUrl(pdfUrl)
              : pdfWidget.fromPath(pdfUrl),
        ),
      ],
    );
  }
}
