part of 'vip_logic.dart';

class DashboardVipState {
  GamingUserVipModel? get vipInfo => VipService.sharedInstance.vipInfo;

  GamingVipSettingModel? _settingModel;
  late final _setting = _settingModel.obs;
  GamingVipSettingModel? get setting => _setting.value;
}
