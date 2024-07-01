part of '../biometric_management_page.dart';

class _BiometricDeleteTextFieldView extends StatelessWidget {
  _BiometricDeleteTextFieldView({
    required this.onSavePressed,
  });

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
              localized('password'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.vGap8,
            GamingTextField(
              controller: controller,
              autofocus: true,
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
