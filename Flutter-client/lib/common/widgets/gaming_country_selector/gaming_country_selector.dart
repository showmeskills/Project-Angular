library gaming_country_selector;

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/country/country_api.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/country_service.dart';

// import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';

// import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

part 'src/logic.dart';

part 'src/view.dart';

part 'src/state.dart';

class GamingCountrySelector extends StatefulWidget {
  const GamingCountrySelector({
    super.key,
    this.initialValue,
    this.textStyle,
    this.onChanged,
    this.background,
    this.height,
  });

  final GamingCountryModel? initialValue;
  final GGTextStyle? textStyle;
  final void Function(GamingCountryModel? value)? onChanged;
  final Color? background;
  final double? height;

  @override
  State<GamingCountrySelector> createState() => GamingCountrySelectorState();
}

class GamingCountrySelectorState extends State<GamingCountrySelector> {
  GamingCountryModel? country;

  @override
  void initState() {
    super.initState();
    country =
        widget.initialValue ?? CountryService.sharedInstance.currentCountry;
  }

  // 中国
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        showCountrySelector().then((value) {
          widget.onChanged?.call(value);
          if (value != null) {
            CountryService.sharedInstance.changeCurrentCountry(value);
            setState(() {
              country = value;
            });
          }
        });
      },
      child: Container(
        height: widget.height ?? (14.dp * 1.44 + 16.dp * 2),
        decoration: BoxDecoration(
          color: widget.background ?? GGColors.transparent.color,
          borderRadius: BorderRadius.circular(4.dp),
          border: Border.all(
            color: GGColors.border.color,
            width: 1.dp,
          ),
        ),
        constraints: BoxConstraints(
          maxWidth: 124.dp,
          // minHeight: 14.dp * 1.4 + 16.dp * 2,
        ),
        // Container的边框是1dp，所以vertical要减去1dp
        padding: EdgeInsets.symmetric(
          horizontal: 14.dp,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              country!.icon,
              width: 24.dp,
              height: 24.dp,
              fit: BoxFit.contain,
            ),
            Gaps.hGap8,
            Text(
              country?.areaCode ?? '+86',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                // fontWeight: GGFontWeigh.bold,
                color: GGColors.textMain.color,
                // fontFamily: GGFontFamily.dingPro,
              ).merge(widget.textStyle),
              maxLines: 1,
              overflow: TextOverflow.clip,
            ),
            Gaps.hGap4,
            SvgPicture.asset(
              R.iconDown,
              width: 8.dp,
              height: 5.dp,
              color: GGColors.textHint.color,
            ),
          ],
        ),
      ),
    );
  }

  Future<GamingCountryModel?> showCountrySelector({
    bool showAreaCode = true,
  }) async {
    return GamingBottomSheet.show<GamingCountryModel?>(
      title: localized('sea_area_code00'),
      builder: (context) {
        return CountrySelectorListView(showAreaCode: showAreaCode);
      },
    );
  }
}
