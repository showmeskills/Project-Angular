import 'dart:convert';
import 'package:base_framework/base_controller.dart';
import '../../common/service/merchant_service/merchant_service.dart';

class EuroThemeState {
  final isChinese = false.obs;

  final selectScheduleGroup = ''.obs;

  final euro2024TreeDark1 = MerchantService
          .sharedInstance.merchantConfigModel?.config?.euro2024TreeDark1 ??
      '';
  final euro2024TreeDark2 = MerchantService
          .sharedInstance.merchantConfigModel?.config?.euro2024TreeDark2 ??
      '';
  final euro2024Tree1 = MerchantService
          .sharedInstance.merchantConfigModel?.config?.euro2024Tree1 ??
      '';
  final euro2024Tree2 = MerchantService
          .sharedInstance.merchantConfigModel?.config?.euro2024Tree2 ??
      '';

  final Map<String, dynamic>? euro2024MatchSchedule = jsonDecode(
      MerchantService.sharedInstance.merchantConfigModel?.config
              ?.euro2024MatchSchedule ??
          '') as Map<String, dynamic>?;

  final List<Map<String, dynamic>> groups = [
    {
      "idx": 'a',
      "tt": '小组 A',
      "entt": 'Group A',
      "list": [
        {"name": '德国', "enName": 'Germany'},
        {"name": '苏格兰', "enName": 'Scotland'},
        {"name": '匈牙利', "enName": 'Hungary'},
        {"name": '瑞士', "enName": 'Switzerland'},
      ],
    },
    {
      "idx": 'b',
      "tt": '小组 B',
      "entt": 'Group B',
      "list": [
        {"name": '西班牙', "enName": 'Spain'},
        {"name": '克罗地亚', "enName": 'Croatia'},
        {"name": '意大利', "enName": 'Italy'},
        {"name": '阿尔巴尼亚', "enName": 'Albania'},
      ],
    },
    {
      "idx": 'c',
      "tt": '小组 C',
      "entt": 'Group C',
      "list": [
        {"name": '斯洛维尼亚', "enName": 'Slovenia'},
        {"name": '塞尔维亚', "enName": 'Serbia'},
        {"name": '丹麦', "enName": 'Denmark'},
        {"name": '英格兰', "enName": 'England'},
      ],
    },
    {
      "idx": 'd',
      "tt": '小组 D',
      "entt": 'Group D',
      "list": [
        {"name": '波兰', "enName": 'Poland'},
        {"name": '荷兰', "enName": 'Netherlands'},
        {"name": '奥地利', "enName": 'Austria'},
        {"name": '法国', "enName": 'France'},
      ],
    },
    {
      "idx": 'e',
      "tt": '小组 E',
      "entt": 'Group E',
      "list": [
        {"name": '比利时', "enName": 'Belgium'},
        {"name": '斯洛伐克', "enName": 'Slovakia'},
        {"name": '罗马尼亚', "enName": 'Romania'},
        {"name": '乌克兰', "enName": 'Ukraine'},
      ],
    },
    {
      "idx": 'f',
      "tt": '小组 F',
      "entt": 'Group F',
      "list": [
        {"name": '土耳其', "enName": 'Turkiye'},
        {"name": '葡萄牙', "enName": 'Portugal'},
        {"name": '乔治亚', "enName": 'Georgia'},
        {"name": '捷克', "enName": 'Czechia'},
      ],
    },
  ];
}
