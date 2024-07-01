import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_benefits_model.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/widget_header.dart';

part '_progress_bar.dart';

class GamingVipCard extends StatelessWidget {
  const GamingVipCard({
    super.key,
    required this.bgImagePath,
    int? index,
    this.isSVip = false,
    this.vipLevel = 0,
    this.promotionProcess,
    this.keepProcess,
    this.keepInfo,
    this.promotionInfo,
    this.keepPoints,
    this.nextLevelPoints,
  }) : index = index ?? vipLevel;

  final String bgImagePath;
  final int index;
  final bool isSVip;
  final int vipLevel;

  /// 保级信息
  final GamingVipBenefitPoint? keepInfo;

  /// 晋升信息
  final GamingVipBenefitPoint? promotionInfo;

  /// 晋级进度
  final double? promotionProcess;

  /// 保级进度
  final double? keepProcess;

  /// 保级点数
  final double? keepPoints;

  /// 晋级点数
  final double? nextLevelPoints;

  /// 是否未解锁当前等级
  bool get isLocked {
    bool isLocked = true;
    if (isCurrentLevel) {
      isLocked = false;
    } else if (vipLevel > index) {
      isLocked = false;
    }
    return isLocked;
  }

  /// 是否当前等级
  bool get isCurrentLevel => isSVip ? isCurrentSVIP : (index == vipLevel);

  bool get isCurrentSVIP => isSVip && index > 9;

  LinearGradient get lockGradient => const LinearGradient(
        colors: [
          Color(0xff5d5d5d),
          Color(0xffd4d4d4),
        ],
        stops: [0, 1.03],
      );

  LinearGradient get keepGradient => const LinearGradient(
        begin: Alignment.centerRight,
        end: Alignment.centerLeft,
        colors: [
          Color(0xff5B6066),
          Color(0xff262E36),
        ],
        stops: [0, 1.03],
      );

  LinearGradient get promotionGradient {
    const colorList = [
      [Color(0xff59d9de), Color(0xff104a54)],
      [Color(0xff59d9de), Color(0xff104a54)],
      [Color(0xff2fb1c5), Color(0xff144c72)],
      [Color(0xff5cb871), Color(0xff104a54)],
      [Color(0xff7e56ff), Color(0xff053b44)],
      [Color(0xff6858fc), Color(0xff2f2c48)],
      [Color(0xffe9b170), Color(0xff974615)],
      [Color(0xffffc69b), Color(0xff462311)],
      [Color(0xffeec244), Color(0xff6c4000)],
      [Color(0xffffce85), Color(0xff442a03)],
    ];
    List<Color> colors = colorList.first;
    if (index < colorList.length) {
      colors = colorList[index];
    }
    return LinearGradient(
      begin: Alignment.centerRight,
      end: Alignment.centerLeft,
      colors: colors,
    );
  }

  LinearGradient get cornerGradient {
    const unLockedColorList = [
      [Color(0xff3ab0ff), Color(0xff3566ff)],
      [Color(0xff3ab0ff), Color(0xff3566ff)],
      [Color(0xff3ab0ff), Color(0xff35ff5e)],
      [Color(0xffacff75), Color(0xff33ffb4)],
      [Color(0xff3aecff), Color(0xff0c16a3)],
      [Color(0xff3ab0ff), Color(0xff6d00cc)],
      [Color(0xffff7903), Color(0xffffde35)],
      [Color(0xffe56c3f), Color(0xff6e1694)],
      [Color(0xffffe0b0), Color(0xff953d11)],
      [Color(0xffdd633e), Color(0xffffd495)],
    ];
    const unLockedStopList = [
      [-0.03, 0.99],
      [-0.03, 0.99],
      [-0.03, 1.03],
      [-0.06, 1.27],
      [-0.03, 1.03],
      [-0.03, 1.03],
      [-0.03, 1.03],
      [-0.03, 1.03],
      [-0.03, 1.03],
      [-0.03, 1.03],
    ];
    const currentColorList = [
      [Color(0xff7ec9d8), Color(0xff41767e)],
      [Color(0xff7ec9d8), Color(0xff41767e)],
      [Color(0xff5992c4), Color(0xff3d6884)],
      [Color(0xff26c173), Color(0xff107956)],
      [Color(0xff5fb6f0), Color(0xff2248e0)],
      [Color(0xff7a56fe), Color(0xff4325ae)],
      [Color(0xffffd5a7), Color(0xffcd6539)],
      [Color(0xfff8d8b9), Color(0xffa6724f)],
      [Color(0xfff2c54b), Color(0xffbe681c)],
      [Color(0xfff8de75), Color(0xffb0881d)],
      [Color(0xff666666), Color(0xff333333)],
    ];
    const List<List<double>> currentStopList = [
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.01, 0.99],
      [-0.04, 1],
      [-0.01, 0.99],
      [-0.01, 0.99],
    ];
    List<Color> colors = unLockedColorList.first;
    List<double> stops = unLockedStopList.first;
    if (index < currentColorList.length) {
      colors =
          isCurrentLevel ? currentColorList[index] : unLockedColorList[index];
      stops = isCurrentLevel ? currentStopList[index] : unLockedStopList[index];
    }
    return LinearGradient(
      // begin: isCurrentLevel ? Alignment.topLeft : Alignment.bottomRight,
      // end: isCurrentLevel ? Alignment.bottomRight : Alignment.topLeft,
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      stops: stops,
      colors: colors,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              fit: BoxFit.fill,
              image: AssetImage(bgImagePath),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              if (isCurrentLevel) Expanded(child: _buildCurrentLevel()),
              if (!isCurrentLevel && keepInfo != null && promotionInfo != null)
                Expanded(child: _buildNotCurrentLevel(context)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNotCurrentLevel(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Gaps.vGap18,
        _buildNotCurrentValue(
          context,
          localized('grow_v'),
          promotionInfo!.points!.toDouble(),
          promotionInfo!.period!,
        ),
        Gaps.vGap12,
        if (index > 1)
          _buildNotCurrentValue(
            context,
            localized('keep_v'),
            keepInfo!.points!.toDouble(),
            keepInfo!.period!,
          ),
      ],
    );
  }

  Widget _buildNotCurrentValue(
      BuildContext context, String title, double value, int day) {
    bool isVi =
        AppLocalizations.of(Get.context!).locale.languageCode.contains('vi');
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        !isVi ? Gaps.hGap16 : Gaps.hGap8,
        Container(
          constraints: BoxConstraints(
            maxWidth: (MediaQuery.of(context).size.width - 90.dp) / 3,
          ),
          child: Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: Colors.white,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        !isVi ? Gaps.hGap8 : Gaps.hGap2,
        Container(
          constraints: BoxConstraints(
            maxWidth: !isVi
                ? 200.dp
                : (MediaQuery.of(context).size.width - 140.dp) / 4,
          ),
          child: Text(
            value.stripTrailingZerosNum().getFormatPoint(),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              fontFamily: GGFontFamily.dingPro,
              color: Colors.white,
              fontWeight: GGFontWeigh.bold,
            ),
            maxLines: 2,
          ),
        ),
        !isVi ? Gaps.hGap8 : Gaps.hGap2,
        Text(
          '$day ${localized('day_in')}',
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: Colors.white,
          ),
          maxLines: 2,
        ),
      ],
    );
  }

  Widget _buildCurrentLevel() {
    if (isCurrentSVIP) {
      return Container(
        padding: EdgeInsets.symmetric(vertical: 10.dp),
        alignment: Alignment.bottomCenter,
        child: _buildSVIPCurrentValue(),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!isCurrentSVIP) ...[
          Gaps.vGap18,
          _buildProgress(
            promotionProcess ?? 0,
            localized('promo_p'),
            promotionGradient,
          ),
          Gaps.vGap24,
          if (index > 1)
            _buildProgress(
              keepProcess ?? 0,
              localized('rele_pro'),
              keepGradient,
            ),
        ],
      ],
    );
  }

  Widget _buildProgress(
    double progress,
    String title,
    LinearGradient gradient,
  ) {
    progress = min(100.0, progress);
    final process = progress.toInt();
    return FractionallySizedBox(
      widthFactor: 0.7,
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          Gaps.hGap16,
          Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: Colors.white,
            ),
          ),
          Gaps.hGap8,
          Expanded(
            child: _VipProgressBar(
              progress: process,
              colors: gradient.colors,
              height: 6.dp,
            ),
          ),
          Gaps.hGap16,
        ],
      ),
    );
  }

  Widget _buildSVIPCurrentValue() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Row(
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                localized('curr_value'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: Colors.white,
                ),
              ),
              Gaps.hGap8,
              Text(
                '${VipService.sharedInstance.vipInfo?.currentPoints ?? 0}',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const Spacer(),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                localized('expiry'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: Colors.white,
                ),
              ),
              Gaps.hGap8,
              Text(
                DateFormat('yyyy/MM/dd').formatTimestamp(
                    VipService.sharedInstance.vipInfo!.svipInvalidTime!),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    String text = localized('locked');
    LinearGradient gradient = isLocked ? lockGradient : cornerGradient;
    if (isCurrentLevel) {
      text = localized('crr_level');
    } else if (isLocked) {
      text = localized('un_lock');
    }

    String vipText = VipService().getVipName(index);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.hGap16,
        Padding(
          padding: EdgeInsets.only(top: 10.dp),
          child: Container(
            constraints: BoxConstraints(
                maxWidth: (MediaQuery.of(context).size.width - 50.dp) / 2),
            child: Text(
              vipText,
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle,
                color: Colors.white,
                fontWeight: GGFontWeigh.bold,
              ),
              maxLines: 2,
            ),
          ),
        ),
        const Spacer(),
        Gaps.hGap20,
        Container(
          padding: EdgeInsets.symmetric(
            vertical: 4.dp,
            horizontal: 16.dp,
          ),
          constraints: BoxConstraints(minWidth: 74.dp, minHeight: 22.dp),
          alignment: AlignmentDirectional.center,
          decoration: BoxDecoration(
            color: Colors.red,
            gradient: gradient,
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(10.dp),
              topRight: Radius.circular(10.dp),
            ),
          ),
          child: Text(
            text,
            style: GGTextStyle(
              fontSize: GGFontSize.smallHint,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}
