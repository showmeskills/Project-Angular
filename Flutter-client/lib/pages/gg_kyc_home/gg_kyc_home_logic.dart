import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/generated/r.dart';

import 'package:gogaming_app/common/api/kyc/models/gg_kyc_level_model.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';

import '../../common/api/kyc/models/gg_kyc_document_model.dart';
import '../../common/api/kyc/models/gg_kyc_process_detail_foreu.dart';
import '../../common/api/kyc/models/gg_kyc_user_verification_foreu.dart';
import '../../models/kyc/go_gaming_kyc_model.dart';

part 'gg_kyc_home_state.dart';

class GGKycHomeLogic extends BaseController {
  final GGKycHomeState state = GGKycHomeState();

  final int defaultIndex;
  final bool isAutoChangeToTab;

  GGKycHomeLogic(
      {required this.defaultIndex, required this.isAutoChangeToTab}) {
    state.verificationIndex.value = defaultIndex;
    isChangeToTab = isAutoChangeToTab;
  }

  BuildContext? context;

  bool showPrimaryPassed = false;
  bool showMiddlePassed = false;
  //是否显示补充文档
  RxBool showDocument = false.obs;

  // 外面跳转进来是否跳转到补充文件tab
  bool isChangeToTab = false;

  // 中级认证是否有需要提交补充资料
  RxBool shouldSupplementIntermediate = false.obs;

  // 高级认证是否有需要提交补充资料
  RxBool shouldSupplementAdvanced = false.obs;

  // 是否显示付款方式补充资料
  RxBool showDocumentPayMethod = false.obs;

  // 是否显示身份证明补充资料
  RxBool showDocumentIdVerification = false.obs;

  // 是否显示地址证明补充资料
  RxBool showDocumentProofOfAddress = false.obs;

  // 是否显示自定义补充资料
  RxBool showDocumentCustomize = false.obs;

  //  是否显示财富证明补充资料
  RxBool showDocumentSow = false.obs;

  //  是否显示验证信息。强制金额
  RxBool showKycAdvanced = false.obs;

  // 是否可以高级审核
  RxBool isShouldKycAdvanced = false.obs;

  @override
  void onClose() {
    GamingEvent.kycPrimarySuccess.unsubscribe(_showPrimarySuccess);
    GamingEvent.kycMiddleSuccess.unsubscribe(_showMiddleSuccess);
    GamingEvent.onRequestKycAdvanced.unsubscribe(_refreshKycState);
    GamingEvent.onRequestKycIntermediate.unsubscribe(_refreshKycState);
    super.onClose();
  }

  @override
  void onInit() {
    super.onInit();
    GamingEvent.kycPrimarySuccess.subscribe(_showPrimarySuccess);
    GamingEvent.kycMiddleSuccess.subscribe(_showMiddleSuccess);
    GamingEvent.onRequestKycAdvanced.subscribe(_refreshKycState);
    GamingEvent.onRequestKycIntermediate.subscribe(_refreshKycState);
  }

  void _checkShowSuccess() {
    if (KycService.sharedInstance.primaryPassed && showPrimaryPassed) {
      showVerSuccess();
      showPrimaryPassed = false;
    }

    if (KycService.sharedInstance.intermediatePassed && showMiddlePassed) {
      showVerSuccess(middleVer: true);
      showMiddlePassed = false;
    }
  }

  void _showPrimarySuccess() {
    showPrimaryPassed = true;
  }

  void _showMiddleSuccess() {
    showMiddlePassed = true;
  }

  void _refreshKycState() {
    if (AccountService.sharedInstance.isLogin &&
        !KycService.sharedInstance.isAsia) {
      reloadData();
    }
  }

  void reloadData() {
    showLoading();
    Rx.combineLatestList([
      AccountService.sharedInstance.updateGamingUserInfo(),
      KycService.sharedInstance.updateKycData(),
    ]).listen((event) {
      hideLoading();
      _updateState();
    }, onError: (Object err) {
      hideLoading();
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void _updateState() {
    final kycInfoModel = KycService.sharedInstance.info.value;
    final countryCode = kycInfoModel?.countryCode;
    final country = (CountryService().country ?? {})[countryCode ?? ''];
    if (country != null) {
      state.currentCountry(country);
    } else {
      CountryService.sharedInstance.getCurrentCountry().listen((event) {
        state.currentCountry(CountryService.sharedInstance.currentCountry);
      });
    }
    if (kycInfoModel != null) {
      state.kycInfo(kycInfoModel);
      state.levels = state.isAsia
          ? kycInfoModel.levelListAsia()
          : kycInfoModel.levelListEurope();
    }
    if (!state.isAsia) {
      queryUserVerificationForEU();
      processDetailForEu();
      getRequestDocument();
      loadAuthenticateEuForm();
    }
    update();

    /// 判断 kyc 接口刷新成功后弹出弹窗
    _checkShowSuccess();
  }

  /// 查询认证EU
  void queryUserVerificationForEU() {
    KycService.sharedInstance.queryUserVerificationForEU().listen((event) {
      state.verificationForEu = event;
      state._verification(event);
    }).onError((Object error) {});
  }

  /// kyc审核详情
  void processDetailForEu() {
    KycService.sharedInstance
        .processDetailForEu(state.verificationIndex.value)
        .listen((event) {
      state.processDetailForEu = event.data;
      state._processDetail(event.data);
    }).onError((Object error) {});
  }

  /// 获取需要的补充文件
  void getRequestDocument() {
    showDocument.value = false;
    KycService.sharedInstance.getRequestDocument().listen((event) {
      state.documentModel = event.data;
      state._documentModel(event.data);
      changeShowDocument();
    }).onError((Object error) {});
  }

  // 更改是否显示补充文档
  void changeShowDocument() {
    setShouldSupplement();
    // 先清空
    showDocumentIdVerification.value = false;
    showDocumentPayMethod.value = false;
    showDocumentProofOfAddress.value = false;
    showDocumentCustomize.value = false;
    showDocumentSow.value = false;
    showKycAdvanced.value = false;

    if (state.verificationIndex.value == 0) {
      //初级没有
      showDocument.value = false;
    } else if (state.verificationIndex.value == 1) {
      //中级  这里后台返回的单词 KycIntermediat 写错了，所以写死字符串
      showDocumentIdVerification.value = (state
                  .ggKycDocumentModel?.idVerification !=
              null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.idVerification?.kycLevel) ==
              'KycIntermediat');

      showDocumentPayMethod.value = (state.ggKycDocumentModel?.paymentMethod !=
              null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.paymentMethod?.kycLevel) ==
              'KycIntermediat');

      showDocumentProofOfAddress.value = (state
                  .ggKycDocumentModel?.proofOfAddress !=
              null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.proofOfAddress?.kycLevel) ==
              'KycIntermediat');

      showDocumentCustomize.value =
          (state.ggKycDocumentModel?.customize != null &&
              GGUtil.parseStr(state.ggKycDocumentModel?.customize?.kycLevel) ==
                  'KycIntermediat');
      showDocument.value = showDocumentIdVerification.value ||
          showDocumentPayMethod.value ||
          showDocumentProofOfAddress.value ||
          showDocumentCustomize.value;
    } else {
      // 高级
      showDocumentIdVerification.value = (state
                  .ggKycDocumentModel?.idVerification !=
              null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.idVerification?.kycLevel) ==
              AuthenticateEuFormType.kycAdvanced.value);

      showDocumentPayMethod.value = (state.ggKycDocumentModel?.paymentMethod !=
              null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.paymentMethod?.kycLevel) ==
              AuthenticateEuFormType.kycAdvanced.value);

      showDocumentProofOfAddress.value = (state
                  .ggKycDocumentModel?.proofOfAddress !=
              null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.proofOfAddress?.kycLevel) ==
              AuthenticateEuFormType.kycAdvanced.value);

      showDocumentCustomize.value =
          (state.ggKycDocumentModel?.customize != null &&
              GGUtil.parseStr(state.ggKycDocumentModel?.customize?.kycLevel) ==
                  AuthenticateEuFormType.kycAdvanced.value);

      showDocumentSow.value = (state.ggKycDocumentModel?.sow != null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.sow?.kycLevel) ==
              AuthenticateEuFormType.kycAdvanced.value);
      // 高级 kycAdvanced 类型可能返回中级或者高级，但是这个只能是高级，但是服务端不改，所以忽略服务端返回的kycLevel字段，强制未高级
      showKycAdvanced.value = (state.ggKycDocumentModel?.kycAdvanced != null &&
          GGUtil.parseStr(state.ggKycDocumentModel?.kycAdvanced?.kycLevel)
              .isNotEmpty);

      showDocument.value = showDocumentIdVerification.value ||
          showDocumentPayMethod.value ||
          showDocumentProofOfAddress.value ||
          showDocumentCustomize.value ||
          showDocumentSow.value;
    }
  }

  void setShouldSupplement() {
    bool isPrimaryPassed = KycService.sharedInstance.primaryPassed;
    bool isIntermediatePassed = KycService.sharedInstance.intermediatePassed;
    bool isAdvancePassed = KycService.sharedInstance.advancePassed;
    int shouldTab = 0;
    if (isAdvancePassed || isIntermediatePassed) {
      shouldTab = 2;
    } else if (isPrimaryPassed) {
      shouldTab = 1;
    } else {
      shouldTab = 0;
    }

    // 下面是根据当前是否有待提交的，跳转到对应tab
    bool idVerificationIntermediate = (state
                    .ggKycDocumentModel?.idVerification !=
                null &&
            GGUtil.parseStr(
                    state.ggKycDocumentModel?.idVerification?.kycLevel) ==
                'KycIntermediat') &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.idVerification?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.idVerification?.status) ==
                KycDocumentStatus.rejected);

    bool payMethodIntermediate = (state.ggKycDocumentModel?.paymentMethod !=
                null &&
            GGUtil.parseStr(
                    state.ggKycDocumentModel?.paymentMethod?.kycLevel) ==
                'KycIntermediat') &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.paymentMethod?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.paymentMethod?.status) ==
                KycDocumentStatus.rejected);

    bool proofOfAddressIntermediate = (state
                    .ggKycDocumentModel?.proofOfAddress !=
                null &&
            GGUtil.parseStr(
                    state.ggKycDocumentModel?.proofOfAddress?.kycLevel) ==
                'KycIntermediat') &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.proofOfAddress?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.proofOfAddress?.status) ==
                KycDocumentStatus.rejected);

    bool customizeIntermediate = (state.ggKycDocumentModel?.customize != null &&
            GGUtil.parseStr(state.ggKycDocumentModel?.customize?.kycLevel) ==
                'KycIntermediat') &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.customize?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.customize?.status) ==
                KycDocumentStatus.rejected);

    shouldSupplementIntermediate.value = idVerificationIntermediate ||
        payMethodIntermediate ||
        proofOfAddressIntermediate ||
        customizeIntermediate;

    // 是否有高级补充材料
    bool idVerificationAdvanced = (state.ggKycDocumentModel?.idVerification !=
                null &&
            GGUtil.parseStr(
                    state.ggKycDocumentModel?.idVerification?.kycLevel) ==
                AuthenticateEuFormType.kycAdvanced.value) &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.idVerification?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.idVerification?.status) ==
                KycDocumentStatus.rejected);

    bool payMethodAdvanced = (state.ggKycDocumentModel?.paymentMethod != null &&
            GGUtil.parseStr(
                    state.ggKycDocumentModel?.paymentMethod?.kycLevel) ==
                AuthenticateEuFormType.kycAdvanced.value) &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.paymentMethod?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.paymentMethod?.status) ==
                KycDocumentStatus.rejected);

    bool proofOfAddressAdvanced = (state.ggKycDocumentModel?.proofOfAddress !=
                null &&
            GGUtil.parseStr(
                    state.ggKycDocumentModel?.proofOfAddress?.kycLevel) ==
                AuthenticateEuFormType.kycAdvanced.value) &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.proofOfAddress?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.proofOfAddress?.status) ==
                KycDocumentStatus.rejected);

    bool customizeAdvanced = (state.ggKycDocumentModel?.customize != null &&
            GGUtil.parseStr(state.ggKycDocumentModel?.customize?.kycLevel) ==
                AuthenticateEuFormType.kycAdvanced.value) &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.customize?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.customize?.status) ==
                KycDocumentStatus.rejected);

    bool sowAdvanced = (state.ggKycDocumentModel?.sow != null &&
        (GGUtil.parseStr(state.ggKycDocumentModel?.sow?.status) ==
                KycDocumentStatus.normal ||
            GGUtil.parseStr(state.ggKycDocumentModel?.sow?.status) ==
                KycDocumentStatus.rejected));

    shouldSupplementAdvanced.value = idVerificationAdvanced ||
        payMethodAdvanced ||
        proofOfAddressAdvanced ||
        customizeAdvanced ||
        sowAdvanced;
    if (shouldSupplementIntermediate.value && shouldSupplementAdvanced.value) {
      shouldTab = 1;
    } else if (shouldSupplementIntermediate.value) {
      shouldTab = 1;
    } else if (shouldSupplementIntermediate.value) {
      shouldTab = 2;
    }

    if (!isChangeToTab) {
      return;
    }

    setLevelIndex(shouldTab);
    //设置为false,防止重复调用
    isChangeToTab = false;
  }

  /// 获取用户待完成的认证
  void loadAuthenticateEuForm() {
    KycService.sharedInstance.loadAuthenticateEuForm().listen((event) {
      isShouldKycAdvanced.value =
          event.contains(AuthenticateEuFormType.kycAdvanced);
    }).onError((Object error) {});
  }

  void showVerSuccess({bool middleVer = false}) {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogSuccessBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('acc_veri'),
      content: middleVer ? localized('up_veri') : localized('up_inter'),
      leftBtnName: '',
      rightBtnName: localized('sure'),
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void setCurrentCountry(GamingCountryModel value) {
    CountryService.sharedInstance.changeCurrentCountry(value);
    state.currentCountry(value);
  }

  void setLevelIndex(int index) {
    state.verificationIndex.value = index;
    processDetailForEu();
    getRequestDocument();
    loadAuthenticateEuForm();
  }

  void _onPrimaryVerify(BuildContext context) {
    Get.toNamed<dynamic>(Routes.kycPrimary.route);
  }

  void _onMiddleVerify(BuildContext context) {
    Get.toNamed<dynamic>(Routes.kycMiddle.route);
  }

  void _onAdvanceVerify(BuildContext context) {
    Get.toNamed<dynamic>(Routes.kycAdvance.route);
  }

  void onPressGoVerification(BuildContext context, int index) {
    switch (index) {
      case 0:
        {
          _onPrimaryVerify(context);
          break;
        }
      case 1:
        {
          _onMiddleVerify(context);
          break;
        }
      case 2:
        {
          _onAdvanceVerify(context);
          break;
        }
      default:
        break;
    }
  }
}
