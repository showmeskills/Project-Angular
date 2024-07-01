/// 上报事件类型
/// 文档 https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2172257034/Gogaming
class TrackEvent {
  final String name;
  final int eventID;
  const TrackEvent(this.name, this.eventID);

  const TrackEvent._(this.name, this.eventID);

  // 进入主首页浏览
  static const visitMainPage = TrackEvent._('visit_mainpage', 30001);

  // 各首页的造访时间
  static const productVisitTime = TrackEvent._('product_visit_time', 30002);

  // 所有页面停留时间
  static const visitAllPage = TrackEvent._('visit_allpage', 30003);

  // 进入体育页面 visit_sport_page
  static const visitSportPage = TrackEvent._('visit_sport_page', 30004);

  // 进入分类选单次数 visit_category_page
  static const visitCategoryPage = TrackEvent._('visit_category_page', 30005);

  // 进入产品主页浏览
  static const visitProductMainPage =
      TrackEvent._('visit_product_mainpage', 30006);

  // 访问注册页
  static const visitRegister = TrackEvent._('visit_register', 30007);

  // 点击(实际)注册
  static const clickRegister = TrackEvent._('click_register', 30008);

  // 访问登入页
  static const visitLogin = TrackEvent._('visit_login', 30009);

  // 访问钱包总览页
  static const visitWalletMainPage =
      TrackEvent._('visit_wallet_mainpage', 30010);

  // 进入充值
  static const clickDeposit = TrackEvent._('click_deposit', 30011);

  // 进入提现
  static const clickTransfer = TrackEvent._('click_transfer', 30012);

  // 进入用户成长计划页面时长
  static const visitVipPage = TrackEvent._('visit_vippage', 30013);

  // 进入赚取拥金页时长
  static const visitReferral = TrackEvent._('visit_referral', 30014);

  // 点击联盟计划申请
  static const clickAffiliateApply =
      TrackEvent._('click_affiliate_apply', 30015);

  // 点击推荐好友链接复制
  static const clickReferralCopy = TrackEvent._('click_referral_copy', 30016);

  // 下载推荐好友图片
  static const downloadReferralPicture =
      TrackEvent._('download_referral_picture', 30017);

  // 访问最新活动页时长
  static const visitPromotion = TrackEvent._('visit_promotion', 30018);

  // 访问卡卷中心时长
  static const visitCoupon = TrackEvent._('visit_coupon', 30019);

  // 领取优惠卷
  static const receivedCoupon = TrackEvent._('received_coupon', 30020);

  // 点击下载APP
  static const clickDownloadApp = TrackEvent._('click_download_app', 30021);

  // 点击首页banner
  static const clickMainPageBanner =
      TrackEvent._('click_mainpage_banner', 30022);

  // 点击管理币种
  static const clickManageCurrency =
      TrackEvent._('click_manage_currency', 30023);

  // 日夜间切换
  static const changeType = TrackEvent._('change_type', 30024);

  // 进入世界杯页面
  static const visitWorldCupPage = TrackEvent._('visit_worldcup_page', 30025);

  // 点击投注按钮
  static const clickWorldCupBet = TrackEvent._('click_worldcup_bet', 30026);

  // 存款接口响应时间
  static const depositTime = TrackEvent._('Deposit_time', 30027);
}
