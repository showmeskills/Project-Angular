part of '../../account_activity_page.dart';

class AccountActivityFilterView<C extends AccountActivityBaseLogic>
    extends StatefulWidget {
  const AccountActivityFilterView({super.key});

  C get controller => Get.find<C>();

  IAccountActivityState get state => controller.state;

  @override
  State<AccountActivityFilterView> createState() =>
      _AccountActivityFilterViewState();
}

class _AccountActivityFilterViewState extends State<AccountActivityFilterView> {
  final _dateRange = GamingDateRange.month().obs;
  GamingDateRange get dateRange => _dateRange.value;

  final _status = AccountActivityStatus.all.obs;
  AccountActivityStatus get status => _status.value;

  @override
  void initState() {
    super.initState();
    _dateRange.value = widget.state.dateRange;
    _status.value = widget.state.status;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: GGAppBar.normal(title: localized('filter')),
      backgroundColor: GGColors.background.color,
      body: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap24,
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localized('scope'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Gaps.vGap4,
                GamingSelectorWidget(
                  backgroundColor: GGColors.background.color,
                  onPressed: _openDateSelector,
                  builder: (context) {
                    return Obx(() {
                      return Text(
                        dateRange.type.description(false),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      );
                    });
                  },
                ),
              ],
            ),
            Gaps.vGap24,
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localized('status'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Gaps.vGap4,
                GamingSelectorWidget(
                  backgroundColor: GGColors.background.color,
                  onPressed: _openStatusSelector,
                  builder: (context) {
                    return Obx(() {
                      return Text(
                        status.translate,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      );
                    });
                  },
                ),
              ],
            ),
            const Spacer(),
            SafeArea(
              top: false,
              bottom: true,
              minimum: EdgeInsets.only(bottom: 24.dp),
              child: Row(
                children: [
                  Expanded(
                    child: GGButton.minor(
                      onPressed: _reset,
                      text: localized('reset'),
                    ),
                  ),
                  Gaps.hGap12,
                  Expanded(
                    child: GGButton.main(
                      onPressed: _confirm,
                      text: localized('filter'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension _Action on _AccountActivityFilterViewState {
  void _openStatusSelector() {
    if (widget.controller.controller.state.renderState == RenderState.loading) {
      Toast.showTryLater();
      return;
    }
    GamingSelector.simple<AccountActivityStatus>(
      title: localized('select_status'),
      fixedHeight: false,
      itemBuilder: (context, e, index) {
        return ScaleTap(
          onPressed: () {
            Get.back(result: e);
          },
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            height: 48.dp,
            alignment: Alignment.centerLeft,
            child: Text(
              e.translate,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: status == e
                    ? GGColors.highlightButton.color
                    : GGColors.textMain.color,
              ),
            ),
          ),
        );
      },
      original: AccountActivityStatus.values,
    ).then((value) {
      if (value != null) {
        _status.value = value;
      }
    });
  }

  void _openDateSelector() {
    if (widget.controller.controller.state.renderState == RenderState.loading) {
      Toast.showTryLater();
      return;
    }

    GamingDateRangeSelector.show(
      selected: dateRange,
      types: GamingDateRangeType.values,
    ).then((value) {
      if (value != null) {
        if (value != GamingDateRangeType.custom) {
          return Future.value(GamingDateRange.fromType(value));
        } else {
          return GamingDateRangeSelector.showCustom(
            selected: dateRange,
            maxInterval: 180,
          );
        }
      } else {
        return Future.value(null);
      }
    }).then((value) {
      if (value != null) {
        _dateRange.value = value;
      }
    });
  }

  void _reset() {
    _dateRange.value = GamingDateRange.month();
    _status.value = AccountActivityStatus.all;
    _confirm();
  }

  void _confirm() {
    widget.controller.confirm(dateRange, status);
  }
}
