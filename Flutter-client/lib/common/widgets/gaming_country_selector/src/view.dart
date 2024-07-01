part of gaming_country_selector;

class CountrySelectorListView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const CountrySelectorListView({
    super.key,
    this.showAreaCode = true,
  });

  final bool showAreaCode;

  CountrySelectorLogic get logic => Get.find<CountrySelectorLogic>();

  @override
  SingleRenderViewController get renderController => logic.controller;

  @override
  Widget build(BuildContext context) {
    final c = Get.put(CountrySelectorLogic(), permanent: true);
    return SafeArea(
      top: false,
      bottom: true,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: GamingTextField(
              controller: c.textFieldController,
              hintText: localized('sea00'),
              prefixIcon: GamingTextFieldIcon(
                icon: R.iconSearch,
                padding: EdgeInsets.only(right: 10.dp, left: 14.dp),
              ),
              prefixIconConstraints: BoxConstraints.tightFor(
                height: 14.dp,
                width: 40.dp,
              ),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 10.dp, horizontal: 13.dp),
            ),
          ),
          Gaps.vGap8,
          Expanded(
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              child: SingleRenderView(
                controller: logic,
                delegate: this,
                child: Obx(
                  () {
                    return ListView.builder(
                      itemCount: c.state.data.length,
                      itemExtent: 44.dp,
                      itemBuilder: (context, index) {
                        return _buildItem(c.state.data[index]);
                      },
                      // itemScrollController: c.scrollController,
                      // itemPositionsListener: c.positionsListener,
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItem(GamingCountryModel data) {
    final imageWidth = 24.dp;
    final imageHeight = 24.dp;
    return InkWell(
      onTap: () {
        logic.select(data);
      },
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: 16.dp,
        ),
        child: Row(
          children: [
            SizedBox(
              width: 24.dp,
              height: 24.dp,
              child: Image.asset(
                data.icon,
                width: imageWidth,
                height: imageHeight,
                cacheHeight: (imageHeight * 3).toInt(), //优化加载大图片导致的卡顿
                cacheWidth: (imageWidth * 3).toInt(),
              ),
            ),
            Gaps.hGap6,
            Expanded(
              child: Text(
                data.name,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  fontWeight: GGFontWeigh.regular,
                  color: GGColors.textMain.color,
                ),
              ),
            ),
            if (showAreaCode)
              Container(
                margin: EdgeInsets.only(left: 6.dp),
                child: Text(
                  data.areaCode,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontWeight: GGFontWeigh.regular,
                    color: GGColors.textMain.color,
                    fontFamily: GGFontFamily.dingPro,
                  ),
                ),
              )
          ],
        ),
      ),
    );
  }
}
