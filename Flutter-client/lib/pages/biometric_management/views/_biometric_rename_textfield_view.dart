part of '../biometric_management_page.dart';

class _BiometricRenameTextFieldView extends StatelessWidget {
  _BiometricRenameTextFieldView({
    required this.onSavePressed,
    required String? value,
  }) {
    controller.textController.text = value ?? '';
  }

  final void Function(String) onSavePressed;

  final GamingTextFieldController controller = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(
        min: 1,
        errorHint: localized('required_msg'),
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: true,
      maintainBottomViewPadding: true,
      minimum: EdgeInsets.only(bottom: 24.dp),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localized('biometric_label'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.vGap8,
            GamingTextField(
              controller: controller,
              autofocus: true,
              hintText: localized('biometric_label_hint'),
              maxLength: 20,
              suffixIcon: Container(
                height: 40.dp,
                alignment: Alignment.center,
                child: Obx(() {
                  return Text(
                    '${controller.text.value.length}/20',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: const Color(0xFFB7BDC6),
                      fontFamily: GGFontFamily.dingPro,
                      fontWeight: GGFontWeigh.medium,
                    ),
                  );
                }),
              ),
              buildCounter: (
                context, {
                required int currentLength,
                required bool isFocused,
                required int? maxLength,
              }) {
                return null;
              },
            ),
            Gaps.vGap16,
            SizedBox(
              width: double.infinity,
              child: Obx(() {
                return GGButton.main(
                  enable: controller.isPass,
                  onPressed: () {
                    onSavePressed(controller.text.value);
                  },
                  text: localized('save_btn'),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
