import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingDailyContestModel {
  String title;
  String activitiesNo;

  /// 竞赛活动周期 day：天， week：周， month：月， year：年， single：单次
  String period;
  int endTime;
  int nowTime;

  /// 竞赛内容 0-有效流水（总投注额） 10-大赢家(总输赢) 11-大赢家(单笔最大盈利) 2-运气最好（最高赔率）
  int executeType;
  String get executeDesc {
    const descMap = {
      0: 'race_total_bet',
      10: 'total_win00',
      11: 'maximum_profit_amount',
      2: 'good_luck',
    };
    final text = descMap[executeType];
    if (text is String) {
      return localized(text);
    } else {
      return descMap.values.first;
    }
  }

  /// 活动图
  String? bonusImgUrl;

  /// 活动介绍
  String? introduction;

  /// 具体显示的活动内容，资讯内容
  String? content;

  GamingDailyContestModel({
    this.title = '',
    this.activitiesNo = '',
    this.period = '',
    this.endTime = 0,
    this.nowTime = 0,
    this.executeType = 0,
    this.bonusImgUrl,
    this.introduction,
    this.content,
  });

  @override
  String toString() {
    return 'GamingDailyContestModel(title: $title, activitiesNo: $activitiesNo, period: $period, endTime: $endTime, nowTime: $nowTime)';
  }

  factory GamingDailyContestModel.fromJson(Map<String, Object?> json) {
    return GamingDailyContestModel(
      title: json['title'] as String? ?? '',
      activitiesNo: json['activitiesNo'] as String? ?? '',
      period: json['period'] as String? ?? '',
      endTime: json['endTime'] as int? ?? 0,
      nowTime: json['nowTime'] as int? ?? 0,
      executeType: GGUtil.parseInt(json['executeType'], 0),
      bonusImgUrl: GGUtil.parseStr(json['bonusImgUrl']),
      introduction: GGUtil.parseStr(json['introduction']),
      content: GGUtil.parseStr(json['content']),
    );
  }

  Map<String, Object?> toJson() => {
        'title': title,
        'activitiesNo': activitiesNo,
        'period': period,
        'endTime': endTime,
        'nowTime': nowTime,
      };
}
