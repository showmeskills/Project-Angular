part of 'app_pages.dart';

enum Routes {
  /// 我的竞赛活动排行
  dailyContestRank(
    route: '/dailyContestRank',
    pageFactory: DailyContestRankPage.getPage,
  ),
  /// 展示pdf页面
  pdfViewer(
    route: '/PdfViewerPage',
    pageFactory: PdfViewerPage.getPage,
  ),

  /// 兑换券码
  exchangeCoupon(
    route: '/exchangeCoupon',
    pageFactory: ExchangeCouponPage.getPage,
  ),

  /// 卡券中心
  couponHome(route: '/couponHome', pageFactory: CouponHomePage.getPage),

  /// 卡劵排序
  couponSort(route: '/couponSort', pageFactory: CouponSortPage.getPage),

  /// 每日竞猜
  needLoginWeb(route: '/needLoginWeb', pageFactory: WebViewPage.needLoginPage),

  /// vip权益说明页面
  vipRightDes(route: '/vipRightDes', pageFactory: VipRightDesPage.getPage),

  /// 在线客服
  customerService(
    route: '/customerService',
    pageFactory: CustomerServicePage.getPage,
  ),

  /// 提现首页
  withdrawHome(route: '/withdrawHome', pageFactory: WithdrawHomePage.getPage),

  /// 关于我们页面
  aboutUs(route: '/aboutUs', pageFactory: AboutUsPage.getPage),

  /// 法币提现
  fiatWithdraw(route: "/fiatWithdraw", pageFactory: FiatWithdrawPage.getPage),
  recentGameList(
    route: "/recentGameList",
    pageFactory: RecentGameListPage.getPage,
  ),
  favoriteGameList(
    route: "/favoriteGameList",
    pageFactory: FavoriteGameListPage.getPage,
  ),
  providerGameList(
    route: "/providerGameLis",
    pageFactory: GGProviderGameListPage.getPage,
  ),
  providerList(route: "/providerList", pageFactory: GGProviderListPage.getPage),

  /// 第三方网页游戏
  webGame(route: "/webGame", pageFactory: ThirdWebGamePage.getWebGame),

  /// 原创游戏网页
  originalWebGame(
    route: "/originalWebGame",
    pageFactory: OriginalWebGamePage.getPage,
  ),

  /// 游戏之前的准备页面
  gamePlayReady(
      route: "/gamePlayReady", pageFactory: ThirdWebGamePage.getGamePlayReady),
  gameList(route: "/gameList", pageFactory: GGGameListPage.getPage),
  gameDetail(route: "/gameDetail", pageFactory: GameDetailPage.getPage),
  cryptoAddressAdd(
    route: "/cryptoAddressAdd",
    pageFactory: CryptoAddressAddPage.getPage,
  ),
  cryptoAddressList(
    route: "/cryptoAddressList",
    pageFactory: CryptoAddressListPage.getPage,
  ),

  /// 数字货币管理筛选页面
  cryptoAddressFilter(
    route: "/cryptoAddressFilter",
    pageFactory: CryptoAddressFilterPage.getPage,
  ),

  modifyPassword(
    route: "/modifyPassword",
    pageFactory: ModifyPasswordPage.getPage,
  ),
  setPassword(route: "/setPassword", pageFactory: SetPasswordView.getPage),

  modifyUserName(
    route: "/modifyUserName",
    pageFactory: ModifyUserNamePage.getPage,
  ),
  accountSecurity(
    route: "/accountSecurity",
    pageFactory: AccountSecurityPage.getPage,
  ),
  kycPrimary(route: "/kycPrimary", pageFactory: GGKycPrimaryPage.getPage),
  kycMiddle(route: "/kycMiddle", pageFactory: GGKycMiddlePage.getPage),
  kycAdvance(route: "/kycAdvance", pageFactory: GGKycAdvancePage.getPage),
  kycHome(route: "/kycHome", pageFactory: GGKycHomePage.getPage),
  managerCurrency(
    route: "/managerCurrency",
    pageFactory: ManagerCurrencyPage.getPage,
  ),
  mainMenu(route: "/mainMenu", pageFactory: GoGamingMainMenuPage.getPage),
  resetPassword(
      route: "/resetPassword", pageFactory: ResetPasswordPage.getPage),
  secure(route: "/secure", pageFactory: GamingSecurePage.getPage),
  login(route: "/login", pageFactory: LoginPage.getPage),
  socialBindPhone(
    route: "/socialBindPhone",
    pageFactory: SocialBindPhonePage.getPage,
  ),
  socialRegisterPhone(
    route: "/socialRegisterPhone",
    pageFactory: SocialRegisterPhonePage.getPage,
  ),
  splash(route: "/splash", pageFactory: SplashPage.getPage),
  main(route: "/main", pageFactory: MainPage.getPage),

  checkPhone(route: "/checkPhone", pageFactory: CheckPhonePage.getPage),
  checkEmail(route: "/checkEmail", pageFactory: CheckEmailPage.getPage),
  preLogin(route: '/preLogin', pageFactory: PreLoginPage.getPage),
  register(route: "/register", pageFactory: RegisterPage.getPage),
  bindMobile(route: "/bindMobile", pageFactory: GamingBindMobilePage.getPage),
  bindGoogle(route: "/bindGoogle", pageFactory: GamingBindGooglePage.getPage),
  unbindGoogle(
    route: "/unbindGoogle",
    pageFactory: GamingUnbindGoogleView.getPage,
  ),
  bindEmail(route: "/bindEmail", pageFactory: GamingBindEmailPage.getPage),
  unbindEmail(
    route: "/unbindEmail",
    pageFactory: GamingUnbindEmailView.getPage,
  ),
  unbindSocial(route: "/unbindSocial", pageFactory: UnbindSocialPage.getPage),
  modifyMobile(
      route: "/modifyMobile", pageFactory: GamingModifyMobileView.getPage),
  findPassword(route: "/findPassword", pageFactory: FindPasswordPage.getPage),
  dashboard(route: "/dashboard", pageFactory: DashboardPage.getPage),

  // /// 银行卡管理
  bankCard(route: "/bankCard", pageFactory: BankCardListPage.getPage),
  addBankCard(route: "/addBankCard", pageFactory: BankCardAddPage.getPage),

  // /// 充值首页
  preDeposit(route: '/preDeposit', pageFactory: PreDepositPage.getPage),
  cryptoDeposit(
    route: '/cryptoDeposit',
    pageFactory: CryptoDepositPage.getPage,
  ),
  currencyDepositPreSubmit(
    route: '/currencyDeposit',
    pageFactory: CurrencyDepositPreSubmitPage.getPage,
  ),
  currencyDepositSubmit(
    route: '/currencyDepositAmount',
    pageFactory: CurrencyDepositSubmitPage.getPage,
  ),
  currencyDepositResultConfirm(
    route: '/currencyDepositConfirm',
    pageFactory: CurrencyDepositResultConfirmPage.getPage,
  ),
  currencyDepositVirtualResultConfirm(
    route: '/currencyDepositVirtualResultConfirm',
    pageFactory: CurrencyDepositVirtualResultConfirmPage.getPage,
  ),

  /// 充值未到账
  appeal(route: "/appeal", pageFactory: AppealPage.getPage),
  cryptoAppealSubmit(
    route: "/cryptoAppealSubmit",
    pageFactory: CryptoAppealSubmitPage.getPage,
  ),
  cryptoAppealConfirm(
    route: "/cryptoAppealConfirm",
    pageFactory: CryptoAppealConfirmPage.getPage,
  ),
  currencyAppealSubmit(
    route: "/currencyAppealSubmit",
    pageFactory: CurrencyAppealSubmitPage.getPage,
  ),

  transfer(route: '/transfer', pageFactory: TransferPage.getPage),
  gameHome(route: "/gameHome", pageFactory: GameHomePage.getPage),
  sportHome(route: "/sportHome", pageFactory: SportHomePage.getPage),
  lotteryHome(route: "/lotteryHome", pageFactory: LotteryHomePage.getPage),
  webview(route: "/webview", pageFactory: WebViewPage.getPage),
  withdrawal(
    route: "/withdrawal",
    pageFactory: DigitalCurrencyWithdrawalPage.getPage,
  ),

  /// 转账钱包 /transferWallet/:providerId 或者 [WalletService.openTransferWallet]
  transferWallet(
    route: "/transferWallet",
    pageFactory: TransferWalletPage.getPage,
  ),

  /// 主账户钱包
  mainWallet(route: "/mainWallet", pageFactory: MainWalletPage.getPage),
  walletHistory(
    route: "/walletHistory",
    pageFactory: GamingWalletHistoryPage.getPage,
  ),

  /// 订单列表
  gameOrder(route: "/gameOrder", pageFactory: GameOrderPage.getPage),

  /// 活体认证
  aliveVerify(route: "/aliveVerify", pageFactory: AliveVerifyPage.getPage),

  /// vip等级页面
  vip(route: "/vip", pageFactory: VipPage.getPage),
  preferencePage(
    route: "/preferencePage",
    pageFactory: GamingPreferencePage.getPage,
  ),
  modifyAvatar(
    route: "/modifyAvatar",
    pageFactory: GamingModifyAvatarPage.getPage,
  ),
  preferenceNotificationTip(
    route: "/preferenceNotificationTip",
    pageFactory: GamingPreferenceNotificationPage.getPage,
  ),
  preferenceInvisibilityMode(
    route: "/preferenceInvisibilityMode",
    pageFactory: GamingPreferenceInvisibilityModePage.getPage,
  ),
  activityDetail(
    route: "/activityDetail",
    pageFactory: ActivityDetailPage.getPage,
  ),
  settingNotify(
    route: "/settingNotify",
    pageFactory: GamingSettingNotifyPage.getPage,
  ),

  /// 设备管理
  deviceManagement(
    route: "/deviceManagement",
    pageFactory: DeviceManagementPage.getPage,
  ),
  deviceManagementLog(
    route: "/deviceManagementLog",
    pageFactory: DeviceManagementLogPage.getPage,
  ),

  // /// 账户活动
  accountActivity(
    route: "/accountActivity",
    pageFactory: AccountActivityPage.getPage,
  ),

  /// 风险评估问卷
  riskAssessment(
    route: "/riskAssessment",
    pageFactory: RiskAssessmentPage.getPage,
  ),

  /// Kyc 中级 ID 上传页面
  kycMiddleUpload(
    route: "/kycMiddleUpload",
    pageFactory: GGKycMiddleUploadPage.getPage,
  ),

  /// kyc 中级 poa 认证页面
  kycPOA(
    route: "/kycPOA",
    pageFactory: GGKycPOAPage.getPage,
  ),

  /// 财富来源证明
  wealthSourceCertificate(
    route: "/wealthSourceCertificate",
    pageFactory: WealthSourceCertificatePage.getPage,
  ),

  /// 生物识别管理
  biometricManagement(
    route: "/biometricManagement",
    pageFactory: BiometricManagementPage.getPage,
  ),

  /// 生物识别登录
  biometricLogin(
    route: "/biometricLogin",
    pageFactory: BiometricLoginPage.getPage,
  ),

  /// 补充文件上传页面
  kycReplenish(
    route: "/kycReplenish",
    pageFactory: GGKycReplenishPage.getPage,
  ),

  /// 补充 id 文件上传页面
  kycReplenishID(
      route: "/kycReplenishID", pageFactory: GGKycReplenishIDPage.getPage),

  /// 补充 poa 文件上传页面
  kycReplenishPOA(
      route: "/kycReplenishPOA", pageFactory: GGKycReplenishPOAPage.getPage),

  /// 上传指定文件
  fullCertificate(
    route: "/uploadCertificate",
    pageFactory: FullCertificatePage.getPage,
  ),

  /// 新活动竞赛
  tournament(
    route: "/tournament",
    pageFactory: TournamentPage.getPage,
  ),

  /// 新活动竞赛详情
  tournamentDetail(
    route: "/tournamentDetail",
    pageFactory: TournamentDetailPage.getPage,
  ),

  /// 线路中心
  lineCenter(route: '/LineCenterPage', pageFactory: LineCenterPage.getPage),
  videoPlayer(
    route: '/videoPlayer',
    pageFactory: GGVideoPlayerPage.getPage,
  ),

  chat(
    route: '/chat',
    pageFactory: ChatPage.getPage,
  ),

  /// 欧洲杯主题页
  euroTheme(
    route: '/euroTheme',
    pageFactory: EuroThemePage.getPage,
  ),

  /// 维护页
  maintenance(route: "/maintenancePage", pageFactory: MaintenancePage.getPage),

  notFound(route: "/notFound", pageFactory: UnknownPage.getPage);

  final String route;
  final GetPage<dynamic> Function(String route) pageFactory;

  const Routes({
    required this.route,
    required this.pageFactory,
  });

  factory Routes.c(String x) {
    return Routes.values
        .firstWhere((element) => element.route == x, orElse: () => notFound);
  }

  bool isKycPage() {
    switch (this) {
      case Routes.kycHome:
      case Routes.kycPrimary:
      case Routes.kycMiddle:
      case Routes.kycAdvance:
        return true;
      default:
        return false;
    }
  }

  /// 登录注册相关路由
  static List<String> get loginRoutes => [
        Routes.login.route,
        Routes.biometricLogin.route,
        Routes.socialBindPhone.route,
        Routes.socialRegisterPhone.route,
        Routes.register.route,
        Routes.checkPhone.route,
        Routes.checkEmail.route,
      ];

  /// kyc 相关路由
  static List<String> get kycRoutes => [
        Routes.kycPrimary.route,
        Routes.kycMiddle.route,
        Routes.kycMiddleUpload.route,
        Routes.kycPOA.route,
        Routes.kycAdvance.route,
      ];
}

// enum Routes {
//   /// 我的竞赛活动排行
//   dailyContestRank(route: '/dailyContestRank'),

//   /// 兑换券码
//   exchangeCoupon(route: '/exchangeCoupon'),

//   /// 卡券中心
//   couponHome(route: '/couponHome'),

//   /// 每日竞猜
//   needLoginWeb(route: '/needLoginWeb'),

//   /// vip权益说明页面
//   vipRightDes(route: '/vipRightDes'),

//   /// 在线客服
//   customerService(route: '/customerService'),

//   /// 提现首页
//   withdrawHome(route: '/withdrawHome'),

//   /// 关于我们页面
//   aboutUs(route: '/aboutUs'),

//   /// 法币提现
//   fiatWithdraw(route: "/fiatWithdraw"),
//   recentGameList(route: "/recentGameList"),
//   favoriteGameList(route: "/favoriteGameList"),
//   providerGameList(route: "/providerGameLis"),
//   providerList(route: "/providerList"),

//   /// 第三方网页游戏
//   webGame(route: "/webGame"),

//   /// 原创游戏网页
//   originalWebGame(route: "/originalWebGame"),

//   /// 游戏之前的准备页面
//   gamePlayReady(route: "/gamePlayReady"),
//   gameList(route: "/gameList"),
//   gameDetail(route: "/gameDetail"),
//   cryptoAddressAdd(route: "/cryptoAddressAdd"),
//   cryptoAddressList(route: "/cryptoAddressList"),
//   modifyPassword(route: "/modifyPassword"),
//   setPassword(route: "/setPassword"),
//   accountSecurity(route: "/accountSecurity"),
//   kycPrimary(route: "/kycPrimary"),
//   kycMiddle(route: "/kycMiddle"),
//   kycAdvance(route: "/kycAdvance"),
//   kycHome(route: "/kycHome"),
//   managerCurrency(route: "/managerCurrency"),
//   mainMenu(route: "/mainMenu"),
//   resetPassword(route: "/resetPassword"),
//   secure(route: "/secure"),
//   login(route: "/login"),
//   socialBindPhone(route: "/socialBindPhone"),
//   socialRegisterPhone(route: "/socialRegisterPhone"),
//   splash(route: "/splash"),
//   main(route: "/main"),
//   checkPhone(route: "/checkPhone"),
//   checkEmail(route: "/checkEmail"),
//   preLogin(route: '/preLogin'),
//   register(route: "/register"),
//   bindMobile(route: "/bindMobile"),
//   bindGoogle(route: "/bindGoogle"),
//   unbindGoogle(route: "/unbindGoogle"),
//   bindEmail(route: "/bindEmail"),
//   unbindEmail(route: "/unbindEmail"),
//   unbindSocial(route: "/unbindSocial"),
//   modifyMobile(route: "/modifyMobile"),
//   findPassword(route: "/findPassword"),
//   dashboard(route: "/dashboard"),

//   /// 银行卡管理
//   bankCard(route: "/bankCard"),
//   addBankCard(route: "/addBankCard"),

//   /// 充值首页
//   preDeposit(route: '/preDeposit'),
//   cryptoDeposit(route: '/cryptoDeposit'),
//   currencyDepositPreSubmit(route: '/currencyDeposit'),
//   currencyDepositSubmit(route: '/currencyDepositAmount'),
//   currencyDepositResultConfirm(route: '/currencyDepositConfirm'),
//   currencyDepositVirtualResultConfirm(
//       route: '/currencyDepositVirtualResultConfirm'),

//   /// 充值未到账
//   appeal(route: "/appeal"),
//   cryptoAppealSubmit(route: "/cryptoAppealSubmit"),
//   cryptoAppealConfirm(route: "/cryptoAppealConfirm"),
//   currencyAppealSubmit(route: "/currencyAppealSubmit"),

//   transfer(route: '/transfer'),
//   gameHome(route: "/gameHome"),
//   lotteryHome(route: "/lotteryHome"),
//   webview(route: "/webview"),
//   withdrawal(route: "/withdrawal"),

//   /// 转账钱包 /transferWallet/:providerId 或者 [WalletService.openTransferWallet]
//   transferWallet(route: "/transferWallet"),

//   /// 主账户钱包
//   mainWallet(route: "/mainWallet"),
//   walletHistory(route: "/walletHistory"),

//   /// 订单列表
//   gameOrder(route: "/gameOrder"),

//   /// vip等级页面
//   vip(route: "/vip"),
//   preferencePage(route: "/preferencePage"),
//   modifyAvatar(route: "/modifyAvatar"),
//   preferenceNotificationTip(route: "/preferenceNotificationTip"),
//   preferenceInvisibilityMode(route: "/preferenceInvisibilityMode"),
//   activityDetail(route: "/activityDetail"),
//   settingNotify(route: "/settingNotify"),

//   /// 设备管理
//   deviceManagement(route: "/deviceManagement"),
//   deviceManagementLog(route: "/deviceManagementLog"),

//   /// 账户活动
//   accountActivity(route: "/accountActivity"),

//   /// 风险评估问卷
//   riskAssessment(route: "/riskAssessment"),

//   /// 财富来源证明
//   wealthSourceCertificate(route: "/wealthSourceCertificate"),

//   /// 维护页
//   maintenance(route: "/maintenancePage"),

//   notFound(route: "/notFound");

//   final String route;

//   const Routes({
//     required this.route,
//   });

//   factory Routes.c(String x) {
//     return Routes.values
//         .firstWhere((element) => element.route == x, orElse: () => notFound);
//   }

//   bool isKycPage() {
//     switch (this) {
//       case Routes.kycHome:
//       case Routes.kycPrimary:
//       case Routes.kycMiddle:
//       case Routes.kycAdvance:
//         return true;
//       default:
//         return false;
//     }
//   }

//   /// 登录注册相关路由
//   static List<String> get loginRoutes => [
//         Routes.login.route,
//         Routes.socialBindPhone.route,
//         Routes.socialRegisterPhone.route,
//         Routes.register.route,
//         Routes.checkPhone.route,
//         Routes.checkEmail.route,
//       ];
// }
