import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class VipRightRuleView extends StatelessWidget {
  VipRightRuleView({Key? key}) : super(key: key);

  Color get background => const Color(0xff191E46);

  Color get textRule => const Color(0xffB1BAD3);
  final rules = [
    'vip_rul_a',
    'vip_rul_b',
    'vip_rul_c',
    'vip_rul_d',
    'vip_rul_e',
    'vip_rul_f',
    'vip_rul_g',
    'vip_rul_h'
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Gaps.vGap24,
        Text(
          localized('rules'),
          style: GGTextStyle(
            color: Colors.white,
            fontSize: GGFontSize.bigTitle,
          ),
        ),
        Gaps.vGap16,
        Container(
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(8),
          ),
          padding: EdgeInsetsDirectional.all(16.dp),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: rules.map((e) => _buildRuleRow(e)).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildRuleRow(String text) {
    final index = rules.indexOf(text);
    return Row(
      children: [
        Expanded(
          child: Padding(
            padding: EdgeInsetsDirectional.only(top: 4.dp, bottom: 4.dp),
            child: Text(
              '${index + 1}.${localized(text)}',
              style: GGTextStyle(
                color: textRule,
                fontSize: GGFontSize.content,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
