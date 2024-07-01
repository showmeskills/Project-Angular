import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/betinfo/real_time_bet_info_model.dart';
import 'package:gogaming_app/controller_header.dart';

class RealTimeService {
  factory RealTimeService() => _getInstance();

  // instance的getter方法，通过CurrencyService.instance获取对象
  static RealTimeService get sharedInstance => _getInstance();

  // 静态变量_instance，存储唯一对象
  static RealTimeService? _instance;

  // 私有的命名式构造方法，通过它可以实现一个类可以有多个构造函数，
  // 子类不能继承internal不是关键字，可定义其他名字
  RealTimeService._internal() {
    // 初始化
  }

  // 获取对象
  static RealTimeService _getInstance() {
    _instance ??= RealTimeService._internal();
    return _instance!;
  }

  /// 我的投注初始化
  Stream<List<RealTimeBetInfoModel>> getSelfRealTimeBetInfo() {
    return PGSpi(
            GameOrder.getSelfRealTimeBetInfo.toTarget(input: {'pageSize': 10}))
        .rxRequest<List<RealTimeBetInfoModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => RealTimeBetInfoModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).flatMap((response) {
      return Stream.value(response.data);
    });
  }

  /// 所有投注初始化
  Stream<List<RealTimeBetInfoModel>> getRealTimeBetInfo(
    List<String>? gameCategories,
  ) {
    return PGSpi(GameOrder.getRealTimeBetInfo.toTarget(input: {
      'pageSize': 10,
      if (gameCategories != null) 'gameCategories': gameCategories,
    })).rxRequest<List<RealTimeBetInfoModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => RealTimeBetInfoModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).flatMap((response) {
      return Stream.value(response.data);
    });
  }

  /// 风云榜
  Stream<List<RealTimeBetInfoModel>> getHeroBetInfo(
    List<String>? gameCategories,
  ) {
    return PGSpi(GameOrder.getHeroBetInfo.toTarget(input: {
      'pageSize': 10,
      if (gameCategories != null) 'gameCategories': gameCategories,
    })).rxRequest<List<RealTimeBetInfoModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => RealTimeBetInfoModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).flatMap((response) {
      return Stream.value(response.data);
    });
  }

  /// 最幸运
  Stream<List<RealTimeBetInfoModel>> getLuckiestBetInfo(
    List<String>? gameCategories,
  ) {
    return PGSpi(GameOrder.getLuckiestBetInfo.toTarget(input: {
      'pageSize': 10,
      if (gameCategories != null) 'gameCategories': gameCategories,
    })).rxRequest<List<RealTimeBetInfoModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => RealTimeBetInfoModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).flatMap((response) {
      return Stream.value(response.data);
    });
  }

  /// 大赢家
  Stream<List<RealTimeBetInfoModel>> getMostWinerBetInfo(
      String gameId, String providerCatId) {
    final splitResult = providerCatId.split('-');
    return PGSpi(GameOrder.getMostWinerBetInfo.toTarget(input: {
      'gameId': gameId,
      'provider': splitResult.first,
      'catId': splitResult.last,
    })).rxRequest<List<RealTimeBetInfoModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => RealTimeBetInfoModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).flatMap((response) {
      return Stream.value(response.data);
    });
  }

  /// 幸运赢家
  Stream<List<RealTimeBetInfoModel>> getLuckyWinerBetInfo(
      String gameId, String providerCatId) {
    final splitResult = providerCatId.split('-');

    return PGSpi(GameOrder.getLuckyWinerBetInfo.toTarget(input: {
      'gameId': gameId,
      'provider': splitResult.first,
      'catId': splitResult.last,
    })).rxRequest<List<RealTimeBetInfoModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => RealTimeBetInfoModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).flatMap((response) {
      return Stream.value(response.data);
    });
  }
}
