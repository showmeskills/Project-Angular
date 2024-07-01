part of 'gaming_lucky_spin_view_m1.dart';

class GamingLuckySpinInfoDetailViewM1 extends StatefulWidget {
  const GamingLuckySpinInfoDetailViewM1({
    Key? key,
    this.resultBtn,
  }) : super(key: key);

  /// 抽奖结果button
  final Widget? resultBtn;
  @override
  State<GamingLuckySpinInfoDetailViewM1> createState() =>
      _GamingLuckySpinInfoDetailViewStateM1();
}

class _GamingLuckySpinInfoDetailViewStateM1
    extends State<GamingLuckySpinInfoDetailViewM1> {
  GamingLuckySpinLogicM1 get baseController =>
      Get.find<GamingLuckySpinLogicM1>();

  RxString hours = '0'.obs;
  RxString minutes = '0'.obs;
  RxString second = '0'.obs;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    if (baseController.getCurType() == 2) {
      _timeCountDown();
    }
  }

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  void _timeCountDown() {
    int now = DateTime.now().millisecondsSinceEpoch;

    int difference =
        GGUtil.parseInt(baseController.state.gapModel!.nextTime - now) ~/ 1000;
    if (difference > 0) {
      _startTimer(GGUtil.parseInt(difference));
    }
  }

  void _startTimer(int lastTime) {
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      int tempTime = lastTime;

      if (tempTime > 60 * 60) {
        hours.value = '${tempTime ~/ (60 * 60)}';
        tempTime = tempTime - (int.parse(hours.value) * 60 * 60);
      }
      if (tempTime > 60) {
        minutes.value = '${tempTime ~/ 60}';
        tempTime = tempTime - (int.parse(minutes.value) * 60);
      }
      second.value = '$tempTime';
      lastTime -= 1;
      if (lastTime == 0) {
        _stopTimer();
      }
    });
  }

  void _stopTimer() {
    if (timer != null) {
      timer!.cancel();
      timer = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return _buildSecondPart(context);
  }

  Widget _buildSecondPart(BuildContext context) {
    return SizedBox(
      height: 86.dp,
      // width: 349.dp,
      child: Container(
        width: 329.dp,
        alignment: Alignment.bottomCenter,
        child: _buildOperateWidget(context),
      ),
    );
  }

  /// 各种操作
  Widget _buildOperateWidget(BuildContext context) {
    int curType = baseController.getCurType();
    if (curType == 0) {
      // 未登录
      return Column(
        children: [
          _buildDrawPrize(),
          Gaps.vGap24,
        ],
      );
    } else if (curType == 1) {
      // 已经登录，可抽奖
      if (widget.resultBtn != null) {
        return Column(
          children: [
            widget.resultBtn!,
            Gaps.vGap25,
          ],
        );
      }
      return Column(
        children: [_buildDrawPrize(), Gaps.vGap10, _buildLeftTimes(context)],
      );
    } else if (curType == 2) {
      // 抽奖倒计时
      if (widget.resultBtn != null) {
        return Column(
          children: [
            widget.resultBtn!,
            Gaps.vGap25,
          ],
        );
      }
      return Column(
        children: [_buildCountDownWidget(), Gaps.vGap10],
      );
    } else if (curType == 3) {
      // 存款  每存款${0} 获得一次抽奖机会
      return Column(
        children: [
          _buildProgressWidget(
              GGUtil.parseInt(baseController.state.gapModel?.depositAmount) -
                  GGUtil.parseInt(baseController.state.gapModel?.remainDeposit),
              GGUtil.parseInt(baseController.state.gapModel?.depositAmount),
              baseController.state.baseCurrency),
          _buildExplain(localized('whe_dep_t', params: [
            '${GGUtil.parseStr(baseController.state.gapModel?.depositAmount)}${baseController.state.baseCurrency}',
            GGUtil.parseStr(baseController.state.gapModel?.rewardSpinTimes)
          ]))
        ],
      );
    } else if (curType == 4) {
      // 每有效交易${0} 获得一次抽奖机会
      return Column(
        children: [
          _buildProgressWidget(
              GGUtil.parseInt(baseController.state.gapModel?.transAmount) -
                  GGUtil.parseInt(
                      baseController.state.gapModel?.remainTransAmount),
              GGUtil.parseInt(baseController.state.gapModel?.transAmount),
              baseController.state.baseCurrency),
          _buildExplain(localized('whe_trad_t', params: [
            '${GGUtil.parseStr(baseController.state.gapModel?.transAmount)}${baseController.state.baseCurrency}',
            GGUtil.parseStr(baseController.state.gapModel?.rewardSpinTimes)
          ]))
        ],
      );
    } else if (curType == 5) {
      // 每有效交易${0}笔且不低于${1} 获得一次抽奖机会
      return Column(
        children: [
          _buildProgressWidget(
              GGUtil.parseInt(baseController.state.gapModel?.perTransCount) -
                  GGUtil.parseInt(
                      baseController.state.gapModel?.remainTransCount),
              GGUtil.parseInt(baseController.state.gapModel?.perTransCount),
              localized('whe_trad_c_bt')),
          _buildExplain(localized('whe_trad_c_t', params: [
            GGUtil.parseStr(baseController.state.gapModel?.perTransCount),
            GGUtil.parseStr(baseController.state.gapModel?.transMinAmount) +
                baseController.state.baseCurrency,
            GGUtil.parseStr(baseController.state.gapModel?.rewardSpinTimes)
          ]))
        ],
      );
    } else if (curType == 6) {
      // 每有效交易${0}笔且不低于${1} 获得一次抽奖机会 每存款${0} 获得一次抽奖机会
      return Column(
        children: [
          _buildProgressWidget(
              GGUtil.parseInt(baseController.state.gapModel?.transAmount) -
                  GGUtil.parseInt(
                      baseController.state.gapModel?.remainTransAmount),
              GGUtil.parseInt(baseController.state.gapModel?.transAmount),
              baseController.state.baseCurrency),

          /// 这一段在web没找到。对应翻译也没找到
          // Container(
          //   height: 28.dp,
          //   padding: EdgeInsets.only(
          //       left: 16.dp, right: 16.dp, top: 3.dp, bottom: 3.dp),
          //   decoration: BoxDecoration(
          //     color: const Color(0xFF000000).withOpacity(0.5),
          //     borderRadius: BorderRadius.circular(37.dp),
          //   ),
          //   child: Text(
          //     '已达到${GGUtil.parseInt(baseController.state.gapModel?.perTransCount) - GGUtil.parseInt(baseController.state.gapModel?.remainTransCount)}/${GGUtil.parseInt(baseController.state.gapModel?.perTransCount)}${localized('whe_trad_c_bt')}',
          //     textAlign: TextAlign.center,
          //     style: GGTextStyle(
          //         fontSize: GGFontSize.content,
          //         color: GGColors.textMain.color,
          //         fontWeight: GGFontWeigh.bold),
          //   ),
          // ),
          // Gaps.vGap6,
          _buildExplain(localized('whe_trad_c_t', params: [
                GGUtil.parseStr(baseController.state.gapModel?.perTransCount),
                GGUtil.parseStr(baseController.state.gapModel?.transMinAmount) +
                    baseController.state.baseCurrency,
                GGUtil.parseStr(baseController.state.gapModel?.rewardSpinTimes)
              ]) +
              localized('whe_dep_t', params: [
                '${GGUtil.parseStr(baseController.state.gapModel?.depositAmount)}${baseController.state.baseCurrency}',
                GGUtil.parseStr(baseController.state.gapModel?.rewardSpinTimes)
              ]))
        ],
      );
    }
    return _buildLeftTimes(context);
  }

  /// 进度条和后面的进度说明
  Widget _buildProgressWidget(int cur, int total, String str) {
    return SizedBox(
      height: 40.dp,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildProgressIndicator(cur, total),
          Gaps.hGap6,
          Container(
            width: 80.dp,
            alignment: Alignment.center,
            child: Text(
              '$cur/$total $str',
              textAlign: TextAlign.center,
              style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.buttonTextWhite.color,
                  fontWeight: GGFontWeigh.bold),
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }

  /// 进度条
  Widget _buildProgressIndicator(int cur, int total) {
    return Stack(
      children: [
        Container(
          width: 230.dp,
          height: 18.dp,
          decoration: BoxDecoration(
            color: const Color(0xFF000000).withOpacity(0.5),
            borderRadius: BorderRadius.circular(12.dp),
          ),
        ),
        Container(
          width: total > 0 ? (cur / total) * 230.dp : 0,
          height: 18.dp,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12.dp),
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFFF4601E),
                Color(0xFFF4AB1E),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExplain(String str) {
    return Container(
      width: 326.dp,
      alignment: Alignment.center,
      child: Text(
        str,
        textAlign: TextAlign.center,
        style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.buttonTextWhite.color.withOpacity(0.5),
            fontWeight: GGFontWeigh.bold),
        maxLines: 2,
      ),
    );
  }

  /// 倒计时
  Widget _buildCountDownWidget() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
            alignment: Alignment.center,
            child: Obx(() {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildTimeItem(hours.value, 'H'),
                  Gaps.hGap16,
                  _buildTimeItem(minutes.value, 'M'),
                  Gaps.hGap16,
                  _buildTimeItem(second.value, 'S'),
                  // Gaps.hGap24,
                ],
              );
            })),
        Gaps.vGap8,
        Text(
          localized('whe_t_d_t'),
          textAlign: TextAlign.center,
          style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.buttonTextWhite.color.withOpacity(0.5),
              fontWeight: GGFontWeigh.bold),
          maxLines: 2,
        ),
      ],
    );
  }

  Widget _buildTimeItem(String time, String unit) {
    return Container(
        height: 48.dp,
        constraints: BoxConstraints(minWidth: 50.dp),
        padding: EdgeInsets.only(left: 4.dp, right: 4.dp),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4),
          color: const Color(0xFF000000).withOpacity(0.2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              time,
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle20,
                color: GGColors.buttonTextWhite.color,
              ),
            ),
            Text(
              unit,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.buttonTextWhite.color,
              ),
            )
          ],
        ));
  }

  /// 登录抽奖，立即抽奖
  Widget _buildDrawPrize() {
    return InkWell(
        onTap: _onClickPrize,
        child: Obx(() {
          return Container(
            width: double.infinity,
            height: 48.dp,
            margin: EdgeInsets.symmetric(horizontal: 12.dp),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(35),
              color: const Color(0xFFFB6943),
            ),
            child: baseController.state.isRun.value
                ? ThreeBounceLoading(
                    dotColor: GGColors.buttonTextWhite.color,
                    dotSize: 15.dp,
                  )
                : Text(
                    baseController.state.isLogin.value
                        ? localized('whe_play_btn')
                        : localized('login_button'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.bigTitle,
                      color: GGColors.buttonTextWhite.color,
                    ),
                  ),
          );
        }));
  }

  // 剩余X次抽奖
  Widget _buildLeftTimes(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      alignment: Alignment.center,
      child: Text(
        localized('whe_lt_tip', params: [
          GGUtil.parseStr(baseController.state.gapModel?.leftTimes ?? '0')
        ]),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.buttonTextWhite.color,
        ),
      ),
    );
  }

  /// 抽奖 or 登录
  void _onClickPrize() {
    if (baseController.state.isLogin.value) {
      baseController.turnTableRun();
    } else {
      // 登录
      _onLogin();
    }
  }

  void _onLogin() {
    if (BiometricService.sharedInstance.canBiometricLogin()) {
      Get.toNamed<dynamic>(Routes.biometricLogin.route);
    } else {
      Get.toNamed<dynamic>(Routes.login.route);
    }
  }
}
