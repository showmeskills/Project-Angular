// ignore_for_file: avoid_unnecessary_containers

part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistorySift extends BaseView<GamingWalletHistorySiftLogic> {
  const GamingWalletHistorySift({
    super.key,
  });

  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  GamingWalletHistoryState get state2 => baseController.state;

  @override
  GamingWalletHistorySiftLogic get controller =>
      Get.find<GamingWalletHistorySiftLogic>();

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('filter'),
      leadingIcon: const GamingCloseButton(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingWalletHistorySiftLogic());
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      height: MediaQuery.of(context).size.height,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // 钱包从 XX 到 XX
          _buildWallets(),
          // 红利发放方式
          _buildBonusType(),
          // 佣金类型
          _buildCommissionType(),

          // 币种
          _buildCoinType(),

          // 日期.范围
          _buildData(),

          // 账户
          _buildAccount(),

          // 状态
          _buildState(),
          const Spacer(),
          _buildBottom(context),
          SizedBox(
            height: 24.dp + Util.iphoneXBottom,
          ),
        ],
      ),
    );
  }

  Widget _buildBottom(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 48.dp,
      child: Row(
        children: [
          Expanded(
            child: GGButton(
              backgroundColor: GGColors.border.color,
              onPressed: () {
                baseController.resetSift();
              },
              text: localized('reset'),
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: GGButton(
              onPressed: () {
                baseController.onClickSift();
                Navigator.of(context).pop();
              },
              text: localized('filter'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContainer({
    required Widget child,
    Color? color,
    double? vertical,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: vertical ?? (color == null ? 16.dp : 17.dp),
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4.dp),
        border: color == null
            ? Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              )
            : null,
      ),
      child: child,
    );
  }

  Widget _buildWallets() {
    return Visibility(
      visible: baseController.state.index == 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Container(
            padding: EdgeInsets.only(left: 4.dp),
            child: Text(
              localized('from'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 274.dp,
                child: Column(
                  children: [
                    _buildFromWallet(),
                    Gaps.vGap20,
                    _buildToWallet(),
                  ],
                ),
              ),
              Gaps.hGap24,
              GestureDetector(
                onTap: () {
                  if (baseController.state.toWalletName.value.isNotEmpty &&
                      baseController.state.toWalletName.value !=
                          localized('all')) {
                    baseController.exchangeWallets();
                  }
                },
                child: Obx(() {
                  return Opacity(
                    opacity:
                        baseController.state.toWalletName.value.isNotEmpty &&
                                baseController.state.toWalletName.value !=
                                    localized('all')
                            ? 1
                            : 0.5,
                    child: Image.asset(
                      R.iconTransferChange,
                      width: 32.dp,
                      height: 32.dp,
                      fit: BoxFit.contain,
                    ),
                  );
                }),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 红利发放方式
  Widget _buildBonusType() {
    return Visibility(
      visible: baseController.state.index == 3,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Text(
            localized('disb_method'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              _selectBonus();
            },
            child: _buildContainer(
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Obx(() {
                          return Text(
                            baseController.state.curBonusType == null
                                ? localized('all')
                                : baseController
                                        .state.curBonusType?.description ??
                                    '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  SvgPicture.asset(
                    R.iconDown,
                    height: 7.dp,
                    color: GGColors.textSecond.color,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// fromWallet
  Widget _buildFromWallet() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            _pressSelectWallet(1);
          },
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Obx(() {
                        return Text(
                          baseController.state.fromWallet?.description ?? '',
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textMain.color,
                            fontFamily: GGFontFamily.dingPro,
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// toWallet
  Widget _buildToWallet() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('to'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            _pressSelectWallet(2);
          },
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Obx(() {
                        return Text(
                          baseController.state.toWallet?.description ??
                              localized('all'),
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textMain.color,
                            fontFamily: GGFontFamily.dingPro,
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// 币种
  Widget _buildCoinType() {
    return Visibility(
      visible:
          baseController.state.index != 5 && baseController.state.index != 6,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Text(
            localized('curr'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              controller.selectCurrency();
            },
            child: _buildContainer(
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Obx(() {
                          return Text(
                            baseController.state.currency == null
                                ? localized('all')
                                : baseController.state.currency?.currency ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  SvgPicture.asset(
                    R.iconDown,
                    height: 7.dp,
                    color: GGColors.textSecond.color,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 日期
  Widget _buildData() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap24,
        Text(
          localized('scope'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            _selectTime();
          },
          child: _buildContainer(
            child: Obx(() {
              return Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Text(
                          localized(
                              baseController.state.curScopeType?.value ?? ''),
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textMain.color,
                            fontFamily: GGFontFamily.dingPro,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SvgPicture.asset(
                    R.iconDown,
                    height: 7.dp,
                    color: GGColors.textSecond.color,
                  ),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildCommissionType() {
    return Visibility(
      visible: baseController.state.index == 5,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Text(
            localized('type'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              // _selectTime();
              _selectType();
            },
            child: _buildContainer(
              child: Obx(() {
                return Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Text(
                            localized(baseController
                                .state.curCommissionType.description),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SvgPicture.asset(
                      R.iconDown,
                      height: 7.dp,
                      color: GGColors.textSecond.color,
                    ),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  /// 账户(调账)
  Widget _buildAccount() {
    return Visibility(
      visible: baseController.state.index == 4,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Text(
            localized('account'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              _selectAccount();
            },
            child: _buildContainer(
              child: Obx(() {
                return Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Text(
                            localized(baseController
                                .state.curAdjustAccount.description),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SvgPicture.asset(
                      R.iconDown,
                      height: 7.dp,
                      color: GGColors.textSecond.color,
                    ),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  /// 状态
  Widget _buildState() {
    return Visibility(
      visible: (baseController.state.index != 3 &&
          baseController.state.index != 5 &&
          baseController.state.index != 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Text(
            localized('status'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          InkWell(
            onTap: () {
              _selectStatus();
            },
            child: _buildContainer(
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Obx(() {
                          return Text(
                            baseController.state.curStatus?.description ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  SvgPicture.asset(
                    R.iconDown,
                    height: 7.dp,
                    color: GGColors.textSecond.color,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeScopeType() {
    return Container(
        height: 320.dp,
        padding: EdgeInsets.only(left: 16.dp),
        child: Column(
          children: [
            _buildScope(TimeScopeType.last7Days),
            Gaps.vGap16,
            _buildScope(TimeScopeType.last30Days),
            Gaps.vGap16,
            _buildScope(TimeScopeType.last90Days),
            Gaps.vGap16,
            _buildScope(TimeScopeType.customizeTime),
          ],
        ));
  }

  Widget _buildBonusTypeTip() {
    List<Widget> list = baseController.state.allBonusType
        .map((e) => _buildBonusItem(e!))
        .toList();

    return Container(
        height: 320.dp,
        padding: EdgeInsets.only(left: 16.dp),
        child: baseController.state.allBonusType.isEmpty
            ? Container()
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: list,
                ),
              ));
  }

  Widget _buildSelectAccountWidget() {
    return Container(
        height: 320.dp,
        padding: EdgeInsets.only(left: 16.dp),
        child: baseController.state.allAccounts.isEmpty
            ? Container()
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: baseController.state.allAccounts
                      .map((e) => _buildAccountItem(e))
                      .toList(),
                ),
              ));
  }

  Widget _buildCommissionWidget() {
    return Container(
        height: 320.dp,
        padding: EdgeInsets.only(left: 16.dp),
        child: baseController.state.allCommissionType.isEmpty
            ? Container()
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: baseController.state.allCommissionType
                      .map((e) => _buildCommissionItem(e))
                      .toList(),
                ),
              ));
  }

  Widget _buildCommissionItem(CommissionType type) {
    return GestureDetector(
      onTap: () {
        // _sureAccount(account);
        _sureCommissionType(type);
      },
      child: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(
              height: 32.dp,
              width: double.infinity,
              child: Obx(() {
                return Text(
                  type.description,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color:
                        type.code == baseController.state.curCommissionType.code
                            ? GGColors.highlightButton.color
                            : GGColors.textSecond.color,
                    fontWeight: GGFontWeigh.regular,
                  ),
                );
              }),
            ),
            Gaps.vGap16,
          ],
        ),
      ),
    );
  }

  Widget _buildScope(TimeScopeType type) {
    debugPrint(
        'baseController.state.curScopeType?.value = ${baseController.state.curScopeType?.value} -- localized(type.value) = ${localized(type.value)} - type = ${type.value}');
    return InkWell(
      onTap: () {
        if (type == TimeScopeType.customizeTime) {
          Navigator.of(Get.overlayContext!).pop();
          _pressSelectDateTip();
        } else {
          baseController.setCurScopeType(type);
          Navigator.of(Get.overlayContext!).pop();
        }
      },
      child: Container(
        height: 32.dp,
        alignment: Alignment.centerLeft,
        color: Colors.transparent,
        child: Obx(() {
          return Text(
            localized(type.value),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: (type.value == baseController.state.curScopeType?.value)
                  ? GGColors.highlightButton.color
                  : GGColors.textMain.color,
              fontWeight: GGFontWeigh.regular,
            ),
          );
        }),
      ),
    );
  }

  /// 选择钱包 1 from 2 to
  Widget _buildWallet(int type) {
    List<Widget> list = baseController.state.allWallets
        .map((e) => _buildWalletItem(type, e!))
        .toList();

    if (type == 2) {
      GamingTransferWalletSelectType wallet =
          GamingTransferWalletSelectType.fromJson(
              {'code': '', 'description': localized('all')});
      list.insert(0, _buildWalletItem(type, wallet));
    }
    return Container(
        height: 320.dp,
        padding: EdgeInsets.only(left: 16.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: list,
        ));
  }

  Widget _buildTip() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      height: 255.dp,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('time_quer_exc00'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
              fontWeight: GGFontWeigh.regular,
            ),
          ),
          Gaps.vGap20,
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  _pressSelectDate(1);
                },
                child: SizedBox(
                  height: 66.dp,
                  width: 140.dp,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localized('start_time00'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                          fontWeight: GGFontWeigh.regular,
                        ),
                      ),
                      Gaps.vGap4,
                      _buildContainer(
                        vertical: 0,
                        child: SizedBox(
                          width: 140.dp,
                          height: 39.dp,
                          child: Row(
                            children: [
                              Obx(() {
                                return Text(
                                  controller.getDateStr(
                                      baseController.state.startTime!),
                                  style: GGTextStyle(
                                    fontSize: GGFontSize.content,
                                    color: GGColors.iconHint.color,
                                    fontFamily: GGFontFamily.dingPro,
                                  ),
                                );
                              }),
                              const Spacer(),
                              Image.asset(
                                R.kycCalendar,
                                width: 16.dp,
                                height: 16.dp,
                                color: GGColors.textSecond.color,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              Container(
                height: 66.dp,
                padding: EdgeInsets.only(top: 27.dp),
                child: Container(
                  height: 39.dp,
                  alignment: Alignment.center,
                  child: Text(
                    localized('to'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                      fontWeight: GGFontWeigh.regular,
                    ),
                  ),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  _pressSelectDate(2);
                },
                child: SizedBox(
                  height: 66.dp,
                  width: 140.dp,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localized('end_time00'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                          fontWeight: GGFontWeigh.regular,
                        ),
                      ),
                      Gaps.vGap4,
                      _buildContainer(
                        vertical: 0,
                        child: SizedBox(
                          width: 140.dp,
                          height: 39.dp,
                          child: Row(
                            children: [
                              Obx(() {
                                return Text(
                                  controller.getDateStr(
                                      baseController.state.endTime!),
                                  style: GGTextStyle(
                                    fontSize: GGFontSize.content,
                                    color: GGColors.iconHint.color,
                                    fontFamily: GGFontFamily.dingPro,
                                  ),
                                );
                              }),
                              const Spacer(),
                              Image.asset(
                                R.kycCalendar,
                                width: 16.dp,
                                height: 16.dp,
                                color: GGColors.textSecond.color,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Gaps.vGap28,
          SizedBox(
            width: double.infinity,
            height: 48.dp,
            child: GGButton(
              onPressed: () {
                baseController.setCurScopeType(TimeScopeType.customizeTime);
                Navigator.of(Get.overlayContext!).pop();
              },
              text: localized('sure'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletItem(int type, GamingTransferWalletSelectType wallet) {
    return GestureDetector(
      onTap: () {
        _sureWallet(type, wallet);
      },
      child: Column(
        children: [
          SizedBox(
            height: 32.dp,
            width: double.infinity,
            child: Text(
              wallet.description,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: wallet.code ==
                        (type == 1
                            ? baseController.state.fromWallet?.code
                            : baseController.state.toWallet?.code)
                    ? GGColors.highlightButton.color
                    : GGColors.textSecond.color,
                fontWeight: GGFontWeigh.regular,
              ),
            ),
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildBonusItem(GamingBonusGrantTypeModel type) {
    return GestureDetector(
      onTap: () {
        _sureBonusType(type);
      },
      child: Column(
        children: [
          SizedBox(
            height: 32.dp,
            width: double.infinity,
            child: Obx(() {
              return Text(
                type.description,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: type.code == baseController.state.curBonusType?.code
                      ? GGColors.highlightButton.color
                      : GGColors.textSecond.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              );
            }),
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildAccountItem(GamingHistoryAdjustAccount account) {
    return GestureDetector(
      onTap: () {
        _sureAccount(account);
      },
      child: Column(
        children: [
          SizedBox(
            height: 32.dp,
            width: double.infinity,
            child: Obx(() {
              return Text(
                account.description,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: account.category ==
                          baseController.state.curAdjustAccount.category
                      ? GGColors.highlightButton.color
                      : GGColors.textSecond.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              );
            }),
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildStatusItem(HistoryStatus status) {
    return GestureDetector(
      onTap: () {
        _sureStatus(status);
      },
      child: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(
              height: 32.dp,
              width: double.infinity,
              child: Text(
                status.description,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: status.code == baseController.state.curStatus?.code
                      ? GGColors.highlightButton.color
                      : GGColors.textMain.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
            ),
            Gaps.vGap16,
          ],
        ),
      ),
    );
  }

  Widget _buildSelectStatus() {
    return Container(
        height: 320.dp,
        padding: EdgeInsets.only(left: 16.dp),
        child: baseController.getCurAllStatus().isEmpty
            ? Container()
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: baseController
                      .getCurAllStatus()
                      .map((e) => _buildStatusItem(e))
                      .toList(),
                ),
              ));
  }
}

extension _Action on GamingWalletHistorySift {
  /// from钱包
  void _pressSelectWallet(int type) {
    GamingBottomSheet.show<DateTime>(
      title: localized('select_account'),
      fixedHeight: false,
      builder: (context) {
        return _buildWallet(type);
      },
    );
  }

  /// 选择钱包
  void _sureWallet(int type, GamingTransferWalletSelectType wallet) {
    if (type == 1) {
      baseController.setFromWallet(wallet);
    } else {
      baseController.setToWallet(wallet);
    }
    Navigator.of(Get.overlayContext!).pop();
  }

  /// 自定义时间
  void _pressSelectDateTip() {
    GamingBottomSheet.show<DateTime>(
      title: localized('custom00'),
      fixedHeight: false,
      builder: (context) {
        return _buildTip();
      },
    );
  }

  /// 选择状态
  void _selectStatus() {
    GamingBottomSheet.show<DateTime>(
      title: localized('status'),
      fixedHeight: false,
      builder: (context) {
        return _buildSelectStatus();
      },
    );
  }

  /// 选择日期
  void _pressSelectDate(int type) {
    GamingDatePicker.openDatePicker(
      initialDate: baseController.state.startTime!,
      minDate: DateTime(DateTime.now().year - 100, 1, 1),
      maxDate: controller.defaultTime(),
    ).then((date) {
      if (date is DateTime) {
        if (type == 1) {
          controller.setFromSelectedDate(date);
        } else {
          controller.setToSelectedDate(date);
        }
      }
    });
  }

  /// 选择时间范围
  void _selectTime() {
    GamingBottomSheet.show<DateTime>(
      title: localized('scope'),
      fixedHeight: false,
      builder: (context) {
        return _buildTimeScopeType();
      },
    );
  }

  /// 选择状态
  void _sureStatus(HistoryStatus status) {
    baseController.setCurStatus(status);
    Navigator.of(Get.overlayContext!).pop();
  }

  /// 选择红利发放方式
  void _selectBonus() {
    GamingBottomSheet.show<DateTime>(
      title: localized('scope'),
      fixedHeight: false,
      builder: (context) {
        return _buildBonusTypeTip();
      },
    );
  }

  /// 确定红利方式
  void _sureBonusType(GamingBonusGrantTypeModel type) {
    baseController.setCurBonusType(type);
    Navigator.of(Get.overlayContext!).pop();
  }

  /// 选择账户，调账用
  void _selectAccount() {
    GamingBottomSheet.show<DateTime>(
      title: localized('select_account'),
      fixedHeight: false,
      builder: (context) {
        return _buildSelectAccountWidget();
      },
    );
  }

  void _sureAccount(GamingHistoryAdjustAccount account) {
    baseController.setCurAdjustAccount(account);
    Navigator.of(Get.overlayContext!).pop();
  }

  /// 选择账户，调账用
  void _selectType() {
    GamingBottomSheet.show<DateTime>(
      title: localized('comm_type'),
      fixedHeight: false,
      builder: (context) {
        return _buildCommissionWidget();
      },
    );
  }

  void _sureCommissionType(CommissionType type) {
    baseController.setCurCommissionType(type);
    Navigator.of(Get.overlayContext!).pop();
  }
}
