import 'package:base_framework/src.event/global.dart';

enum GamingEvent {
  /// 登录戝功
  login(event: 'login'),

  /// 用户注册戝功
  userRegistered(event: '_registeredAndLogin'),

  loggedOut(event: 'loggedOut'),

  gamingTokenAlready(event: 'gamingTokenAlready'),

  /// 用户坝注册戝功-首页弹窗“安全认话弹窗”
  usernameRegistered(event: '_usernameRegistered'),

  /// 用户token过期需覝針登录
  tokenExpireEvent(event: '_tokenExpireEvent'),

  /// 绑定谷歌验话器戝功
  bindGoogleSuccess(event: '_bindGoogleSuccess'),

  /// 设置密砝戝功
  setPasswordSuccess(event: '_setPasswordSuccess'),

  /// 绑定手机戝功
  bindMobileSuccess(event: '_bindMobileSuccess'),

  /// 修改手机戝功
  modifyMobileSuccess(event: '_modifyMobileSuccess'),

  /// 解绑手机戝功
  unBindMobileSuccess(event: '_unBindMobileSuccess'),

  /// 解绑谷歌戝功
  unBindGoogleSuccess(event: '_unBindGoogleSuccess'),

  /// 绑定邮箱戝功
  bindEmailSuccess(event: '_bindEmailSuccess'),

  /// 解绑邮箱戝功
  unBindEmailSuccess(event: '_unBindEmailSuccess'),

  kycPrimarySuccess(event: '_kycPrimarySuccess'),

  kycMiddleSuccess(event: '_kycMiddleSuccess'),

  /// 修改白坝坕设置状思
  updateWhiteListSwitch(event: '_updateWhiteListSwitch'),

  /// 站内信通知
  signalrOnSiteMail(event: '_signalrOnSiteMail'),

  /// 消杯杝示
  signalrOnTips(event: '_signalrOnTips'),

  /// 余额更新
  signalrUpdateBalance(event: '_signalrUpdateBalance'),

  /// 获取活体认证结果
  signalrOnLiveCheck(event: '_signalrOnLiveCheck'),

  /// 手动刷新余额
  updateBalanceByApp(event: '_updateBalanceByApp'),

  /// 充值结果
  onDeposit(event: '_onDeposit'),

  /// 杝现结果
  onWithdraw(event: '_onWithdraw'),

  /// 刷新历坲记录
  refreshHistoryWallet(event: '_refreshHistoryWallet'),

  /// 刷新头僝
  changeAvatar(event: '_changeAvatar'),

  /// 更改站内信类型
  changeNotificationInApp(event: '_changeNotificationInApp'),

  /// 更改隝身模弝
  modifyInvisibilityMode(event: '_modifyInvisibilityMode'),

  /// 显示游戝中
  showGamePlaying(event: '_showGamePlaying'),

  /// 丝显示游戝中
  showNoGamePlaying(event: '_showNoGamePlaying'),

  /// 生物识别开坯
  openBiometric(event: '_openBiometric'),

  /// kyc id身份验证
  onIdVerification(event: '_onIdVerification'),

  /// kyc 中级验证
  onRequestKycIntermediate(event: '_onRequestKycIntermediate'),

  /// kyc 高级验证
  onRequestKycAdvanced(event: '_onRequestKycAdvanced'),

  /// 注册的 GogamingWebBridge 触发
  webBridgeTrigger(event: 'webBridgeTrigger'),

  /// EDD 开启问卷调查
  onEdd(event: '_onEdd'),

  /// 新竞赛-自己的名次变化
  onNewRankSelfRank(event: '_onNewRankSelfRank'),

  /// 新竞赛-所有排行榜变化
  onNewRankLeaderboard(event: '_onNewRankLeaderboard'),

  unknown(event: 'unknown');

  const GamingEvent({required this.event});

  final String event;

  /// 坑逝消杯
  void notify({dynamic data}) {
    notificationCenter.notify(event, data: data);
  }

  void subscribe(Function callback) {
    notificationCenter.subscribe(event, callback);
  }

  void unsubscribe(Function callback) {
    notificationCenter.unsubscribe(event, callback: callback);
  }
}
