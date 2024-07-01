import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/banner/models/gaming_banner_model.dart';
import 'package:gogaming_app/common/widgets/gaming_image/fuzzy_url_parser.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingSportBanner extends StatefulWidget {
  const GamingSportBanner({
    super.key,
    required this.banner,
  });
  final List<GamingBannerModel> banner;

  @override
  State<GamingSportBanner> createState() => _GamingSportBannerState();
}

class _GamingSportBannerState extends State<GamingSportBanner> {
  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 3.75,
      child: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 6.dp),
        scrollDirection: Axis.horizontal,
        child: Row(
          children: widget.banner.map((e) {
            return ScaleTap(
              onPressed: () {
                GamingDataCollection.sharedInstance.submitDataPoint(
                    TrackEvent.clickMainPageBanner,
                    dataMap: {"actionvalue1": e.id});
                UrlSchemeUtil.navigateTo(e.imageUrl);
              },
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: 6.dp),
                child: GamingImage.fuzzyNetwork(
                  url: FuzzyUrlParser(url: e.bannerUrl).toString(),
                  progressUrl: FuzzyUrlParser.blur(url: e.bannerUrl, width: 500)
                      .toString(),
                  fit: BoxFit.cover,
                  height: double.infinity,
                  radius: 8.dp,
                  colorBlendMode: BlendMode.multiply,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
