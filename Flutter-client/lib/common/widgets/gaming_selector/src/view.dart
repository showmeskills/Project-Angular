part of gaming_selector;

abstract class GamingSelectorSlotContentView extends StatelessWidget {
  const GamingSelectorSlotContentView({
    super.key,
    this.text,
    this.builder,
    this.padding,
  });
  final String? text;
  final WidgetBuilder? builder;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    assert(text != null || builder != null);
    return Container(
      alignment: Alignment.centerLeft,
      padding: padding ?? EdgeInsets.symmetric(horizontal: 16.dp),
      child: builder != null
          ? builder!(context)
          : Text(
              text!,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textMain.color,
              ),
            ),
    );
  }
}

class GamingSelectorHeaderContentView extends GamingSelectorSlotContentView {
  const GamingSelectorHeaderContentView({
    super.key,
    String? text,
    WidgetBuilder? builder,
  }) : super(text: text, builder: builder);
}

class GamingSelectorFooterContentView extends GamingSelectorSlotContentView {
  const GamingSelectorFooterContentView({
    super.key,
    String? text,
    WidgetBuilder? builder,
  }) : super(text: text, builder: builder);
}

class GamingSelectorItem extends StatelessWidget {
  const GamingSelectorItem({
    super.key,
    required this.text,
    this.selected = false,
    this.onPressed,
  });

  final String text;
  final bool selected;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: onPressed,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        height: 48.dp,
        alignment: Alignment.centerLeft,
        child: Text(
          text,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: selected
                ? GGColors.highlightButton.color
                : GGColors.textMain.color,
          ),
        ),
      ),
    );
  }
}

class GamingSelectorView<T> extends StatelessWidget {
  const GamingSelectorView({
    super.key,
    required this.itemBuilder,
    required this.controller,
    this.isScrollControlled = true,
    this.headerBuilder,
    this.footerBuilder,
    this.safeAreaBottom = true,
  });

  final GamingSelectorControllerImp<T> controller;

  final GamingSelectorItemBuilder<T> itemBuilder;
  final bool isScrollControlled;

  final GamingSelectorHeaderContentView? headerBuilder;
  final GamingSelectorFooterContentView? footerBuilder;
  final bool safeAreaBottom;

  @override
  Widget build(BuildContext context) {
    controller.onStart();
    return SafeArea(
      top: false,
      bottom: safeAreaBottom,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (headerBuilder != null)
            Container(
              padding: EdgeInsets.only(
                bottom: 8.dp,
              ),
              child: headerBuilder!,
            ),
          if (controller.allowSearch)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.dp),
              child: GamingTextField(
                controller: controller.textFieldController,
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
          if (controller.allowSearch) Gaps.vGap8,
          if (isScrollControlled)
            Expanded(
              child: _buildListView(context),
            )
          else
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Obx(() {
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(controller.count, (index) {
                      return InkWell(
                        onTap: () {
                          controller.select(index);
                        },
                        child: itemBuilder(
                          context,
                          controller.list[index],
                          index,
                        ),
                      );
                    }),
                  );
                }),
                footerBuilder ?? Gaps.empty,
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildListView(BuildContext context) {
    return MediaQuery.removePadding(
      context: context,
      removeTop: true,
      child: SingleRenderView(
        delegate: controller,
        controller: controller,
        child: Column(
          children: [
            Expanded(
              child: Obx(
                () => ListView.builder(
                  itemCount: controller.count,
                  itemBuilder: (context, index) {
                    return InkWell(
                      onTap: () {
                        controller.select(index);
                      },
                      child: itemBuilder(
                        context,
                        controller.list[index],
                        index,
                      ),
                    );
                  },
                ),
              ),
            ),
            footerBuilder ?? Gaps.empty,
          ],
        ),
      ),
    );
  }
}

// class _GamingSelectorViewWithOnline extends StatelessWidget {
//   _GamingSelectorViewWithOnline({
//     required this.controller,
//   });

//   final GamingSelectorController controller;

//   final Widget Function(BuildContext, int) itemBuilder;
//   final int Function() itemCount;
//   final void Function(String keyword)? onSearch;

//   late _GamingSelectorSearchController? searchController = onSearch != null
//       ? _GamingSelectorSearchController(onChanged: onSearch!)
//       : null;

//   late GamingTextFieldController controller = GamingTextFieldController(
//     onChanged: (text) {
//       searchController?.keyword = text;
//     },
//   );
//   @override
//   Widget build(BuildContext context) {
//     return SafeArea(
//       top: false,
//       bottom: true,
//       child: Column(
//         children: [
//           if (searchController != null)
//             Container(
//               padding: EdgeInsets.symmetric(horizontal: 16.dp),
//               child: GamingTextField(
//                 controller: controller,
//                 hintText: localized('sea00'),
//                 prefixIcon: GamingTextFieldIcon(
//                   icon: R.iconSearch,
//                   padding: EdgeInsets.only(right: 10.dp, left: 14.dp),
//                 ),
//                 prefixIconConstraints: BoxConstraints.tightFor(
//                   height: 14.dp,
//                   width: 38.dp,
//                 ),
//                 contentPadding:
//                     EdgeInsets.symmetric(vertical: 10.dp, horizontal: 13.dp),
//               ),
//             ),
//           if (searchController != null) Gaps.vGap8,
//           Expanded(
//             child: MediaQuery.removePadding(
//               context: context,
//               removeTop: true,
//               child: _GamingSelectorListView(
//                 itemBuilder: itemBuilder,
//                 itemCount: itemCount,
//                 searchController: searchController,
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
