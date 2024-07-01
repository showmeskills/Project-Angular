part of 'gaming_image.dart';

class GamingImageFailed extends StatelessWidget {
  const GamingImageFailed({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(
            R.iconImageError,
            width: 36.dp,
            height: 30.dp,
            color: GGColors.textHint.color,
          ),
          Gaps.vGap10,
          Text(
            localized('image_failed'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textHint.color,
            ),
          ),
        ],
      ),
    );
  }
}
