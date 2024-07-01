part of 'gaming_vip_card.dart';

const _keep = LinearGradient(
  begin: Alignment.centerLeft,
  end: Alignment.centerRight,
  colors: [
    Color(0xff5b6066),
    Color(0xff262e36),
  ],
);
const _promotion = LinearGradient(
  begin: Alignment.centerLeft,
  end: Alignment.centerRight,
  colors: [
    Color(0xFFFFC69B),
    Color(0xFFF04E23),
  ],
);

enum VipProgressType {
  promotion(_promotion),
  keep(_keep);

  const VipProgressType(this.gradient);
  final Gradient gradient;
}

class _VipProgressBar extends StatelessWidget {
  const _VipProgressBar({
    this.progress = 0,
    this.height,
    required this.colors,
  });

  final int progress;
  final List<Color> colors;
  final double? height;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: double.infinity,
          height: height ?? 8.dp,
          decoration: const ShapeDecoration(
            shape: StadiumBorder(),
            color: Color(0xFF243140),
          ),
          alignment: Alignment.centerLeft,
          child: FractionallySizedBox(
            widthFactor: progress / 100,
            child: Container(
              height: height ?? 8.dp,
              decoration: ShapeDecoration(
                shape: const StadiumBorder(),
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: colors,
                ),
              ),
            ),
          ),
        ),
        Positioned(
          top: height ?? 8.dp,
          left: 0,
          right: 0,
          child: Container(
            margin: EdgeInsets.only(top: 1.dp),
            child: Row(
              children: [
                Flexible(
                  flex: progress,
                  child: Container(),
                ),
                Text(
                  '$progress%',
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: Colors.white,
                  ),
                ),
                Flexible(
                  flex: 100 - progress,
                  child: Container(),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
