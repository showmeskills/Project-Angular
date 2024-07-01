// ignore_for_file: avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/widgets/gaming_country_selector/gaming_country_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingSelectedCountryView extends StatelessWidget {
  const GamingSelectedCountryView({
    Key? key,
    required this.mobile,
    required this.onCountryChanged,
  }) : super(key: key);

  final GamingTextFieldController mobile;
  final void Function(GamingCountryModel value) onCountryChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 20.dp),
          _buildTitle(localized('phone')),
          SizedBox(height: 4.dp),
          _buildMobileTF(),
        ],
      ),
    );
  }

  Widget _buildMobileTF() {
    return Row(
      children: [
        GamingCountrySelector(
          onChanged: (country) {
            if (country != null) onCountryChanged(country);
          },
        ),
        Gaps.hGap8,
        Expanded(
          child: GamingTextField(
            controller: mobile,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTitle(String text) {
    return Text(
      text,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }
}
