import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/pages/Transfer/transfer_page.dart';
import 'package:gogaming_app/pages/account_activity/account_activity_page.dart';
import 'package:gogaming_app/pages/advanced_certification/full_certificate/full_certificate_page.dart';
import 'package:gogaming_app/pages/advanced_certification/risk_assessment/risk_assessment_page.dart';
import 'package:gogaming_app/pages/advanced_certification/wealth_source_certificate/wealth_source_certificate_page.dart';
import 'package:gogaming_app/pages/alive_verify/alive_verify_view.dart';
import 'package:gogaming_app/pages/appeal/crypto/confirm/crypto_appeal_confirm_page.dart';
import 'package:gogaming_app/pages/appeal/crypto/submit/crypto_appeal_submit_page.dart';
import 'package:gogaming_app/pages/appeal/currency/submit/currency_appeal_submit_page.dart';
import 'package:gogaming_app/pages/appeal/pre_submit/appeal_page.dart';
import 'package:gogaming_app/pages/bank_card/add/bank_card_add_page.dart';
import 'package:gogaming_app/pages/bank_card/list/bank_card_list_page.dart';
import 'package:gogaming_app/pages/biometric_management/biometric_management_page.dart';
import 'package:gogaming_app/pages/chat/chat_page.dart';
import 'package:gogaming_app/pages/coupon/coupon_sort/coupon_sort_page.dart';
import 'package:gogaming_app/pages/crypto_address/crypto_address_add/crypto_address_add_page.dart';
import 'package:gogaming_app/pages/crypto_address/crypto_address_filter/crypto_address_filter_page.dart';
import 'package:gogaming_app/pages/crypto_address/crypto_address_list/crypto_address_list_page.dart';
import 'package:gogaming_app/pages/customer_service/customer_service_page.dart';
import 'package:gogaming_app/pages/dashboard/dashboard_page.dart';
import 'package:gogaming_app/pages/deposit/crypto/crypto_deposit_page.dart';
import 'package:gogaming_app/pages/deposit/currency/pre_submit/currency_deposit_pre_submit_page.dart';
import 'package:gogaming_app/pages/deposit/currency/result_confirm/currency_deposit_result_confirm_page.dart';
import 'package:gogaming_app/pages/deposit/currency/result_confirm/currency_deposit_virtual_result_confirm_page.dart';
import 'package:gogaming_app/pages/deposit/currency/submit/currency_deposit_submit_page.dart';
import 'package:gogaming_app/pages/deposit/pre_deposit/pre_deposit_page.dart';
import 'package:gogaming_app/pages/device_management/list/device_management_page.dart';
import 'package:gogaming_app/pages/device_management/log/device_management_log_page.dart';
import 'package:gogaming_app/pages/digital_currency_withdrawal/digital_currency_withdrawal_view.dart';
import 'package:gogaming_app/pages/favorite_game_list/favorite_game_list_view.dart';
import 'package:gogaming_app/pages/find_password/find_password_view.dart';
import 'package:gogaming_app/pages/game_detail/game_detail_page.dart';
import 'package:gogaming_app/pages/game_home/game_home_page.dart';
import 'package:gogaming_app/pages/game_order/game_order_page.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_bind_email/gaming_bind_email_view.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_bind_google/gaming_bind_google_view.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_bind_mobile/gaming_bind_mobile_view.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_modify_mobile/gaming_modify_mobile_view.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_unbind_email/gaming_unbind_email_view.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_unbind_google/gaming_unbind_google_view.dart';
import 'package:gogaming_app/pages/gaming_secure/unbind_social/unbind_social_page.dart';
import 'package:gogaming_app/pages/gg_kyc_advance/gg_kyc_advance_page.dart';
import 'package:gogaming_app/pages/gg_kyc_home/gg_kyc_home_page.dart';
import 'package:gogaming_app/pages/gg_kyc_middle/poa/gg_kyc_poa_page.dart';
import 'package:gogaming_app/pages/gg_kyc_primary/gg_kyc_primary_page.dart';
import 'package:gogaming_app/pages/login/login_view.dart';
import 'package:gogaming_app/pages/login/social/social_bind_phone_page.dart';
import 'package:gogaming_app/pages/lottery_home/lottery_home_page.dart';
import 'package:gogaming_app/pages/main/main_view.dart';
import 'package:gogaming_app/pages/manager_currency/manager_currency_page.dart';
import 'package:gogaming_app/pages/modify_password/modify_password_view.dart';
import 'package:gogaming_app/pages/modify_username/modify_username_view.dart';
import 'package:gogaming_app/pages/online_activity/activity_detail/activity_detail_view.dart';
import 'package:gogaming_app/pages/pdf_viewer/pdf_viewer_view.dart';
import 'package:gogaming_app/pages/pre_login/pre_login_page.dart';
import 'package:gogaming_app/pages/preference/gaming_modify_avatar/gaming_modify_avatar_page.dart';
import 'package:gogaming_app/pages/preference/gaming_preference_invisibility_mode/gaming_preference_invisibility_mode_page.dart';
import 'package:gogaming_app/pages/preference/gaming_preference_notification/gaming_preference_notification_page.dart';
import 'package:gogaming_app/pages/preference/gaming_preference_page.dart';
import 'package:gogaming_app/pages/recent_game_list/recent_game_list_view.dart';
import 'package:gogaming_app/pages/register/check_phone_page.dart';
import 'package:gogaming_app/pages/register/register_page.dart';
import 'package:gogaming_app/pages/register/social/social_register_phone_page.dart';
import 'package:gogaming_app/pages/set_password/set_password_view.dart';
import 'package:gogaming_app/pages/setting_notify/gaming_setting_notify_page.dart';
import 'package:gogaming_app/pages/splash/maintenance_page.dart';
import 'package:gogaming_app/pages/splash/splash_page.dart';
import 'package:gogaming_app/pages/tournament/detail/tournament_detail_page.dart';
import 'package:gogaming_app/pages/tournament/list/tournament_page.dart';
import 'package:gogaming_app/pages/unkown/unknown_page.dart';
import 'package:gogaming_app/pages/vip/vip_page.dart';
import 'package:gogaming_app/pages/vip/vip_right_des/vip_right_des_page.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_page.dart';
import 'package:gogaming_app/pages/wallets/main_wallet/main_wallet_page.dart';
import 'package:gogaming_app/pages/wallets/transfer_wallet/transfer_wallet_page.dart';
import 'package:gogaming_app/pages/web_game/original_web_game/original_web_game_page.dart';
import 'package:gogaming_app/pages/web_game/web_game_page.dart';
import 'package:gogaming_app/pages/webview/webview_page.dart';
import 'package:gogaming_app/pages/withdraw_home/withdraw_home_page.dart';

import '../pages/about_us/about_us_view.dart';
import '../pages/account_security/account_security_view.dart';
import '../pages/biometric_management/biometric_login/biometric_login_page.dart';
import '../pages/coupon/coupon_home/coupon_home_page.dart';
import '../pages/coupon/exchange_coupon/exchange_coupon_view.dart';
import '../pages/daily_contest/daily_contest_rank/daily_contest_rank_view.dart';
import '../pages/euro_theme/euro_theme_view.dart';
import '../pages/fiat_withdraw/withdraw_info/fiat_withdraw_view.dart';
import '../pages/gaming_secure/gaming_secure_view.dart';
import '../pages/gg_game_list/gg_game_list_view.dart';
import '../pages/gg_kyc_middle/id/gg_kyc_middle_page.dart';
import '../pages/gg_kyc_middle/id/gg_kyc_middle_upload_page.dart';
import '../pages/gg_kyc_middle/replenish/file/gg_kyc_replenish_view.dart';
import '../pages/gg_kyc_middle/replenish/id/gg_kyc_replenish_id_page.dart';
import '../pages/gg_kyc_middle/replenish/poa/gg_kyc_replenish_poa_page.dart';
import '../pages/gg_provider_game_list/gg_provider_game_list_view.dart';
import '../pages/gg_provider_list/gg_provider_list_view.dart';
import '../pages/gg_video_player/gg_video_player_view.dart';
import '../pages/go_gaming_main_menu/go_gaming_main_menu_view.dart';
import '../pages/line_center/line_center_view.dart';
import '../pages/register/check_email_page.dart';
import '../pages/reset_password/reset_password_view.dart';
import '../pages/sport_home/sport_home_page.dart';

part 'router.dart';

class AppPages {
  AppPages._();

  static String initial = Routes.splash.route;

  static final routesVersion2 = Routes.values
      .map<GetPage<dynamic>>((e) => e.pageFactory(e.route))
      .toList();

  // static final routes = Routes.values.map<GetPage<dynamic>>((e) {
  //   switch (e) {
  //     case Routes.exchangeCoupon:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const ExchangeCouponPage(),
  //       );
  //     case Routes.needLoginWeb:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () =>
  //             WebViewPage.argument(Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.couponHome:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const CouponHomePage(),
  //       );
  //     case Routes.fiatWithdraw:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () =>
  //             FiatWithdrawPage.argument(Get.arguments as Map<String, dynamic>?),
  //       );
  //     case Routes.recentGameList:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const RecentGameListPage(),
  //       );
  //     case Routes.aboutUs:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const AboutUsPage(),
  //       );
  //     case Routes.favoriteGameList:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const FavoriteGameListPage(),
  //       );
  //     case Routes.providerGameList:
  //       return GetPage(
  //         name: e.route,
  //         page: () {
  //           Map<String, dynamic> arguments =
  //               Get.arguments as Map<String, dynamic>;
  //           String providerId = arguments['providerId'].toString();
  //           return GGProviderGameListPage(
  //             providerId,
  //           );
  //         },
  //       );
  //     case Routes.providerList:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GGProviderListPage(),
  //       );
  //     case Routes.gameList:
  //       return GetPage(
  //         name: e.route,
  //         page: () {
  //           Map<String, dynamic> arguments =
  //               Get.arguments as Map<String, dynamic>;
  //           String labelId = arguments['labelId'].toString();
  //           return GGGameListPage(
  //             labelId,
  //           );
  //         },
  //       );
  //     case Routes.modifyPassword:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const ModifyPasswordPage(),
  //       );
  //     case Routes.setPassword:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const SetPasswordView(),
  //       );
  //     case Routes.resetPassword:
  //       return GetPage(
  //           name: e.route,
  //           page: () {
  //             Map<String, dynamic> arguments =
  //                 Get.arguments as Map<String, dynamic>;
  //             String code = arguments['uniCode'].toString();
  //             return ResetPasswordPage(
  //               uniCode: code,
  //             );
  //           });
  //     case Routes.accountSecurity:
  //       return GetPage(name: e.route, page: () => const AccountSecurityPage());
  //     case Routes.login:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const LoginPage(),
  //       );
  //     case Routes.register:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const RegisterPage(),
  //         binding: RegisterBing(),
  //       );
  //     case Routes.socialBindPhone:
  //       return GetPage(
  //         name: e.route,
  //         page: () => SocialBindPhonePage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.socialRegisterPhone:
  //       return GetPage(
  //         name: e.route,
  //         page: () => SocialRegisterPhonePage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.unbindSocial:
  //       return GetPage(
  //         name: e.route,
  //         page: () =>
  //             UnbindSocialPage.argument(Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.checkPhone:
  //       return GetPage(
  //           name: e.route,
  //           page: () {
  //             Map<String, dynamic> arguments =
  //                 Get.arguments as Map<String, dynamic>;
  //             String mobile = arguments['mobile'].toString();
  //             String areaCode = arguments['areaCode'].toString();
  //             return CheckPhonePage(
  //                 mobile: mobile,
  //                 areaCode: areaCode,
  //                 onSubmitted: arguments['onSubmitted'] as void Function(
  //                     String optCode));
  //           });
  //     case Routes.checkEmail:
  //       return GetPage(
  //           name: e.route,
  //           page: () {
  //             Map<String, dynamic> arguments =
  //                 Get.arguments as Map<String, dynamic>;
  //             String email = arguments['email'].toString();
  //             return CheckEmailPage(
  //                 email: email,
  //                 onSubmitted: arguments['onSubmitted'] as void Function(
  //                     String optCode));
  //           });
  //     case Routes.splash:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const SplashPage(),
  //       );
  //     case Routes.main:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const MainPage(),
  //       );
  //     case Routes.preLogin:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const PreLoginPage(),
  //       );
  //     case Routes.secure:
  //       return GetPage(
  //         name: e.route,
  //         page: () {
  //           Map<String, dynamic> arguments =
  //               Get.arguments as Map<String, dynamic>;
  //           VerifyAction action = arguments['otpType'] as VerifyAction;
  //           GamingLoginModel? info =
  //               arguments['secureInfo'] as GamingLoginModel?;
  //           String fMobile = '';
  //           if (arguments.containsKey('fMobile')) {
  //             fMobile = arguments['fMobile'].toString();
  //           }
  //           String fEmail = '';
  //           if (arguments.containsKey('fEmail')) {
  //             fEmail = arguments['fEmail'].toString();
  //           }

  //           GamingCountryModel? country =
  //               arguments['country'] as GamingCountryModel?;
  //           return GamingSecurePage(
  //               info: info,
  //               action: action,
  //               fMobile: fMobile,
  //               fEmail: fEmail,
  //               country: country,
  //               on2FaSuccess:
  //                   arguments['on2FaSuccess'] as void Function(String token));
  //         },
  //       );
  //     case Routes.findPassword:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const FindPasswordPage(),
  //       );
  //     case Routes.dailyContestRank:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const DailyContestRankPage(),
  //       );
  //     case Routes.mainMenu:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GoGamingMainMenuPage(),
  //       );
  //     case Routes.managerCurrency:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const ManagerCurrencyPage(),
  //       );
  //     case Routes.dashboard:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const DashboardPage(),
  //       );
  //     case Routes.kycHome:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GGKycHomePage(),
  //       );
  //     case Routes.kycPrimary:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GGKycPrimaryPage(),
  //       );
  //     case Routes.notFound:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const UnknownPage(),
  //       );
  //     case Routes.kycMiddle:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GGKycMiddlePage(),
  //       );
  //     case Routes.kycAdvance:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GGKycAdvancePage(),
  //       );
  //     case Routes.bindMobile:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GamingBindMobilePage(),
  //       );
  //     case Routes.bindGoogle:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GamingBindGooglePage(),
  //       );
  //     case Routes.unbindGoogle:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GamingUnbindGoogleView(),
  //       );
  //     case Routes.bindEmail:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GamingBindEmailPage(),
  //       );
  //     case Routes.unbindEmail:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GamingUnbindEmailView(),
  //       );
  //     case Routes.cryptoAddressList:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const CryptoAddressListPage(),
  //       );
  //     case Routes.modifyMobile:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GamingModifyMobileView(),
  //       );
  //     case Routes.bankCard:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const BankCardListPage(),
  //       );
  //     case Routes.addBankCard:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const BankCardAddPage(),
  //       );
  //     case Routes.gameHome:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const GameHomePage(),
  //       );
  //     case Routes.gameDetail:
  //       return GetPage(
  //         name: e.route,
  //         page: () =>
  //             GameDetailPage.argument(Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.lotteryHome:
  //       return GetPage(
  //         name: e.route,
  //         page: () =>
  //             LotteryHomePage.argument(Get.arguments as Map<String, dynamic>?),
  //       );
  //     case Routes.preDeposit:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const PreDepositPage(),
  //       );
  //     case Routes.cryptoDeposit:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => CryptoDepositPage.argument(
  //             Get.arguments as Map<String, dynamic>?),
  //       );
  //     case Routes.currencyDepositPreSubmit:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => CurrencyDepositPreSubmitPage.argument(
  //             Get.arguments as Map<String, dynamic>?),
  //       );
  //     case Routes.currencyDepositSubmit:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => CurrencyDepositSubmitPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.currencyDepositResultConfirm:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => CurrencyDepositResultConfirmPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.currencyDepositVirtualResultConfirm:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => CurrencyDepositVirtualResultConfirmPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.webGame:
  //       return GetPage(
  //         name: e.route,
  //         page: () =>
  //             WebGamePage.argument(Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.gamePlayReady:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () =>
  //             WebGamePage.argument(Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.withdrawHome:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const WithdrawHomePage(),
  //       );
  //     case Routes.withdrawal:
  //       return GetPage(
  //           name: e.route,
  //           middlewares: [LoginMiddleware()],
  //           page: () {
  //             String category = '';
  //             if (Get.arguments != null) {
  //               Map<String, dynamic> arguments =
  //                   Get.arguments as Map<String, dynamic>;
  //               if (arguments.containsKey('category')) {
  //                 category = arguments['category'].toString();
  //               }
  //             }
  //             return DigitalCurrencyWithdrawalPage(
  //               category: category,
  //             );
  //           });
  //     case Routes.transfer:
  //       return GetPage(
  //           name: e.route,
  //           middlewares: [LoginMiddleware()],
  //           page: () {
  //             String category = '';
  //             String fixedHintMsg = '';
  //             if (Get.arguments != null) {
  //               Map<String, dynamic> arguments =
  //                   Get.arguments as Map<String, dynamic>;
  //               if (arguments.containsKey('category')) {
  //                 category = arguments['category'].toString();
  //               }
  //               if (arguments.containsKey('fixedHintMsg')) {
  //                 fixedHintMsg = arguments['fixedHintMsg'].toString();
  //               }
  //             }
  //             return TransferPage(
  //               category: category,
  //               fixedHintMsg: fixedHintMsg,
  //             );
  //           });
  //     case Routes.webview:
  //       return GetPage(
  //         name: e.route,
  //         page: () =>
  //             WebViewPage.argument(Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.transferWallet:
  //       return GetPage(
  //         name: '${e.route}/:id',
  //         middlewares: [LoginMiddleware()],
  //         page: () => TransferWalletPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.mainWallet:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const MainWalletPage(),
  //       );
  //     case Routes.cryptoAddressAdd:
  //       return GetPage(
  //         name: e.route,
  //         page: () => CryptoAddressAddPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.walletHistory:
  //       return GetPage(
  //           name: e.route,
  //           middlewares: [LoginMiddleware()],
  //           page: () {
  //             String historyTypeValue = '';
  //             bool isDigital = true;
  //             if (Get.arguments != null) {
  //               Map<String, dynamic> arguments =
  //                   Get.arguments as Map<String, dynamic>;
  //               if (arguments.containsKey('historyTypeValue')) {
  //                 historyTypeValue = GGUtil.parseStr(arguments[
  //                     'historyTypeValue']); //arguments['historyTypeValue'].toString();
  //               }
  //               if (arguments.containsKey('isDigital')) {
  //                 isDigital = GGUtil.parseBool(arguments['isDigital']);
  //               }
  //             }
  //             return GamingWalletHistoryPage(
  //               historyTypeValue: historyTypeValue,
  //               isDigital: isDigital,
  //             );
  //           });
  //     case Routes.gameOrder:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () =>
  //             GameOrderPage.argument(Get.arguments as Map<String, dynamic>?),
  //       );
  //     case Routes.vip:
  //       return GetPage(
  //         name: e.route,
  //         page: () => const VipPage(),
  //       );
  //     case Routes.vipRightDes:
  //       return GetPage(
  //         name: e.route,
  //         // middlewares: [LoginMiddleware()],
  //         page: () => const VipRightDesPage(),
  //       );
  //     case Routes.preferencePage:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const GamingPreferencePage(),
  //       );
  //     case Routes.modifyAvatar:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const GamingModifyAvatarPage(),
  //       );
  //     case Routes.preferenceNotificationTip:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const GamingPreferenceNotificationPage(),
  //       );
  //     case Routes.preferenceInvisibilityMode:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const GamingPreferenceInvisibilityModePage(),
  //       );
  //     case Routes.activityDetail:
  //       return GetPage(
  //         name: e.route,
  //         page: () => ActivityDetailPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.customerService:
  //       return GetPage(
  //         name: e.route,
  //         fullscreenDialog: true,
  //         page: () => const CustomerServicePage(),
  //       );
  //     case Routes.settingNotify:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const GamingSettingNotifyPage(),
  //       );
  //     case Routes.deviceManagement:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const DeviceManagementPage(),
  //       );
  //     case Routes.deviceManagementLog:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => DeviceManagementLogPage.argument(
  //             Get.arguments as Map<String, dynamic>),
  //       );
  //     case Routes.accountActivity:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const AccountActivityPage(),
  //       );
  //     case Routes.originalWebGame:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => OriginalWebGamePage.argument(
  //             Get.arguments as Map<String, dynamic>? ?? {}),
  //       );
  //     case Routes.appeal:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const AppealPage(),
  //       );
  //     case Routes.cryptoAppealSubmit:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const CryptoAppealSubmitPage(),
  //       );
  //     case Routes.cryptoAppealConfirm:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const CryptoAppealConfirmPage(),
  //       );
  //     case Routes.currencyAppealSubmit:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => CurrencyAppealSubmitPage.argument(
  //             Get.arguments as Map<String, dynamic>? ?? {}),
  //       );
  //     case Routes.riskAssessment:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const RiskAssessmentPage(),
  //       );
  //     case Routes.wealthSourceCertificate:
  //       return GetPage(
  //         name: e.route,
  //         middlewares: [LoginMiddleware()],
  //         page: () => const WealthSourceCertificatePage(),
  //       );
  //     case Routes.maintenance:
  //       return GetPage(
  //         name: e.route,
  //         page: () => MaintenancePage.argument(
  //             Get.arguments as Map<String, dynamic>? ?? {}),
  //       );
  //   }
  // }).toList();
}
