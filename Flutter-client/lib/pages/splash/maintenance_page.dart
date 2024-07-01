import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:url_launcher/url_launcher.dart';

class MaintenancePage extends StatelessWidget {
  const MaintenancePage({
    super.key,
    required this.endDateTime,
    required this.email,
  });

  final DateTime endDateTime;
  final String email;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => MaintenancePage.argument(
          Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  factory MaintenancePage.argument(Map<String, dynamic> arguments) {
    final time = arguments['maintainTimeEnd'] as int? ?? 0;
    final email = arguments['email'] as String? ?? '';
    return MaintenancePage(
      endDateTime: DateTime.fromMillisecondsSinceEpoch(time),
      email: email,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: GGColors.background.color,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 20.dp, vertical: 25.dp),
          child: Column(
            children: [
              const Locale('en', 'US'),
              const Locale('zh', 'CN'),
              const Locale('th', 'TH'),
              const Locale('vi', 'VN')
            ].map((e) {
              return _buildTips(e);
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildTips(Locale locale) {
    return Container(
      margin: EdgeInsets.only(top: 30.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _title(locale),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          _buildDateTime(locale),
          Gaps.vGap10,
          _buildContent(_content(locale)),
        ],
      ),
    );
  }

  Widget _buildDateTime(Locale locale) {
    if (locale.languageCode == 'en') {
      return Gaps.empty;
    }
    int timeZone = 7;
    if (locale.languageCode == 'zh') {
      timeZone = 8;
    }
    return Container(
      margin: EdgeInsets.only(top: 10.dp),
      child: Text(
        '${DateFormat('MM/dd HH:mm').format(endDateTime.add(Duration(hours: timeZone)))} (GMT+$timeZone)',
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.brand.color,
        ),
      ),
    );
  }

  String _title(Locale locale) {
    switch (locale.languageCode) {
      case 'en':
        return 'System Maintenance In Progress';
      case 'zh':
        return '系统升级中，预计开放时间：';
      case 'th':
        return 'Thời gian bảo trì: ';
      case 'vi':
        return 'ระบบ ปิดปรับปรุง: ';
    }
    return '';
  }

  String _content(Locale locale) {
    switch (locale.languageCode) {
      case 'en':
        return 'We are currently updating the system. If you have any queries,please contact our Customer Service Representatives: ';
      case 'zh':
        return '我们一直在努力，每一次更新都为让您获得更好的游戏体验。如有疑问，欢迎您与我们客服联系：';
      case 'th':
        return 'Nhằm nâng cao chất lượng ổn định của hệ thống trên Website và điện thoại, xin thông báo toàn bộ hệthống website, dịch vụ sẽ tạm dừng hoạt động trong khoảng thời gian bảo trì này. Nếu quý khách có yêucầu hỗ trợ, vui lòng liên hệ với nhân viên chăm sóc khách hàng theo thông tin dưới đây: ';
      case 'vi':
        return 'ขออภัยในความไม่สะดวก ระบบทำการปิดปรับปรุง และพัฒนาระบบของเราให้มีประสิทธิภาพ มากยิ่งขึ้น โปรดติดตอฝ่ายบริการลูกค้าออนไลน์ของเราสำหรับความช่วยเหลือ ขอบคุณค่ะ: ';
    }
    return '';
  }

  Widget _buildContent(String text, [String endText = '']) {
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(text: text),
          TextSpan(
              text: email,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                decoration: TextDecoration.underline,
              ),
              recognizer: TapGestureRecognizer()
                ..onTap = () {
                  launchUrl(Uri.parse('mailto:$email'));
                }),
          TextSpan(text: endText),
        ],
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }
}
