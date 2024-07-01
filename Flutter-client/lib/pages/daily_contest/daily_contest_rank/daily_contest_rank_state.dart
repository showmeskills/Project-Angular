import 'package:base_framework/base_controller.dart';
import '../../../common/api/bonus/models/gaming_daily_contest_model/gaming_contest_rank_model.dart';

class DailyContestRankState {
  final rankModel = GamingContestRankModel().obs;

  RxString day = '0'.obs;
  RxString hours = '0'.obs;
  RxString minutes = '0'.obs;
  RxString second = '0'.obs;
}
