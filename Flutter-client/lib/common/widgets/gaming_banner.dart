import 'package:card_swiper/card_swiper.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/banner/models/gaming_banner_model.dart';
import 'package:gogaming_app/common/widgets/gaming_image/fuzzy_url_parser.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingBanner extends StatefulWidget {
  const GamingBanner({
    super.key,
    required this.banner,
  });
  final List<GamingBannerModel> banner;

  @override
  State<GamingBanner> createState() => _GamingBannerState();
}

class _GamingBannerState extends State<GamingBanner> {
  final ValueNotifier<int> _notifier = ValueNotifier(0);

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.82,
      child: Swiper(
        autoplay: widget.banner.isNotEmpty,
        autoplayDelay: 5000,
        itemBuilder: (BuildContext context, int index) {
          return Container(
            margin: EdgeInsets.symmetric(horizontal: 6.dp),
            child: ValueListenableBuilder<int>(
                valueListenable: _notifier,
                builder: (context, value, child) {
                  final url = widget.banner[index].bannerUrl;
                  return GamingImage.fuzzyNetwork(
                    url: FuzzyUrlParser(url: url).toString(),
                    progressUrl:
                        FuzzyUrlParser.blur(url: url, width: 500).toString(),
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    radius: 8.dp,
                    colorBlendMode: BlendMode.multiply,
                    color:
                        index == value ? null : Colors.black.withOpacity(0.6),
                  );
                }),
          );
        },
        itemCount: widget.banner.length,
        viewportFraction: 1 - (12.dp / Get.width),
        pagination: SwiperPagination(
          margin: EdgeInsets.only(bottom: 5.dp),
          builder: DotSwiperPaginationBuilder(
            activeColor: GGColors.buttonTextWhite.color,
            color: GGColors.buttonTextWhite.color.withOpacity(0.3),
            size: 8.dp,
            activeSize: 8.dp,
            space: 5.dp,
          ),
        ),
        onIndexChanged: (v) {
          _notifier.value = v;
        },
        onTap: (index) {
          GamingDataCollection.sharedInstance.submitDataPoint(
              TrackEvent.clickMainPageBanner,
              dataMap: {"actionvalue1": widget.banner[index].id});
          UrlSchemeUtil.navigateTo(widget.banner[index].imageUrl);
        },
      ),
    );
  }
}
