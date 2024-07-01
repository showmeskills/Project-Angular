part of 'payment_iq_config.dart';

class PaymentIQView extends StatelessWidget {
  const PaymentIQView({
    super.key,
    required this.controller,
  });

  final PaymentIQController controller;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: controller.height,
            child: BaseWebView(
              key: ValueKey(controller.currency),
              userAgent: "",
              controller: controller,
              stackWidgets: [
                Obx(() {
                  if (!controller.loading) {
                    return const SizedBox();
                  }
                  return const GoGamingLoading();
                }),
              ],
              onLoadStart: (c, url) {},
              onProgressChanged: (c, progress) {},
              onLoadError: (controller, url, code, message) {},
            ),
          ),
          Obx(() {
            return Visibility(
              visible: controller.success,
              child: SizedBox(
                width: double.infinity,
                child: GGButton.main(
                  onPressed: () {
                    Get.until((route) => Get.currentRoute == Routes.main.route);
                    Get.find<MainLogic>().changeSelectIndex(-1);
                  },
                  text: localized('return_to_home'),
                ),
              ),
            );
          }),
        ],
      );
    });
  }
}
