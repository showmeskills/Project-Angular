import 'package:gogaming_app/common/api/risk_form/models/risk_form_normal_list_model.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/advanced_certification/common/advanced_certification_util.dart';

// 全局的设置
class GlobalSetting {
  factory GlobalSetting() => _getInstance();

  static GlobalSetting get sharedInstance => _getInstance();

  static final GlobalSetting _instance = GlobalSetting._internal();

  GlobalSetting._internal() {
    // 初始化
  }

  // 获取对象
  static GlobalSetting _getInstance() {
    return _instance;
  }

  // 是否账号被风控
  RxBool isRisk = false.obs;

  // 是否被手动关闭
  RxBool isRiskClose = false.obs;

  //是否屏蔽风控功能
  bool isCloseRisk = true;

  // 更新风控状态
  Stream<bool> updateRiskState() {
    if (!AccountService.sharedInstance.isLogin || isCloseRisk == true) {
      GlobalSetting.sharedInstance.isRisk.value = false;
      return Stream.value(false);
    }
    return PGSpi(RiskFormApi.queryRiskAbnormalMember.toTarget())
        .rxRequest<bool>((value) {
      final data = value['data'];
      if (data is bool) {
        return GGUtil.parseBool(data);
      } else {
        return false;
      }
    }).flatMap((value) {
      if (value.success) {
        if (GGUtil.parseBool(value.data) == true && isCloseRisk == false) {
          GlobalSetting.sharedInstance.isRisk.value = true;
        } else {
          GlobalSetting.sharedInstance.isRisk.value = false;
        }
      }
      return Stream.value(value.success);
    });
  }

  /// 是否有需要风控的表单
  Stream<List<RiskFormNormalListModel>?> queryNormalRiskForm() {
    if (!AccountService.sharedInstance.isLogin || isCloseRisk == true) {
      return Stream.value(null);
    }
    return PGSpi(RiskFormApi.queryNormalRiskForm.toTarget())
        .rxRequest<List<RiskFormNormalListModel>>((value) {
      return (value['data'] as List)
          .map((e) =>
              RiskFormNormalListModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  /// 是否有需要风控的表单并弹窗跳转
  void queryNormalRiskFormAndDialog() {
    if (!AccountService.sharedInstance.isLogin || isCloseRisk == true) {
      return;
    }
    GlobalSetting.sharedInstance.isRiskClose.value = false;
    GlobalSetting.sharedInstance.queryNormalRiskForm().listen((event) {
      if (event != null && event.isNotEmpty) {
        RiskFormNormalListModel model = event[0];
        AdvancedCertificationUtil.showCertificationDialogWithType(
            type: GGUtil.parseStr(model.type));
      }
    }).onError((Object error) {});
  }
}
