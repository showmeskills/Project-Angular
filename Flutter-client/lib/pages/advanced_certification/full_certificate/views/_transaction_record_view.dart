part of '../full_certificate_page.dart';

class _TransactionRecordView extends StatelessWidget {
  const _TransactionRecordView();

  FullCertificateLogic get controller => Get.find<FullCertificateLogic>();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap20,
        _buildBankCardRecord(),
        Gaps.vGap40,
        _buildCryptoWalletRecord(),
        Gaps.vGap24,
      ],
    );
  }

  Widget _buildRecordTitle(String text) {
    return Container(
      margin: EdgeInsets.only(bottom: 10.dp),
      child: Text(
        text,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }

  Widget _buildRecordItem(String text) {
    return Container(
      margin: EdgeInsets.only(bottom: 5.dp),
      child: Text(
        text,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }

  Widget _buildBankCardRecord() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRecordTitle(localized('bank_card_record')),
        _buildRecordTitle(localized('bank_card_record_title')),
        _buildRecordItem(localized('bank_card_record_tips0')),
        _buildRecordItem(localized('bank_card_record_tips1')),
        Gaps.vGap25,
        _buildUploadView(controller: controller.bankCardRecordController),
      ],
    );
  }

  Widget _buildCryptoWalletRecord() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRecordTitle(localized('crypto_wallet_record')),
        _buildRecordTitle(localized('crypto_wallet_record_title')),
        _buildRecordItem(localized('crypto_wallet_record_tips0')),
        _buildRecordItem(localized('crypto_wallet_record_tips1')),
        Gaps.vGap25,
        _buildUploadView(controller: controller.cryptoWalletRecordController),
      ],
    );
  }

  Widget _buildUploadView({
    required AttachmentUploadController controller,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AttachmentUploadedView(controller: controller),
        Obx(() {
          if (controller.attachments.isEmpty) {
            return Gaps.empty;
          }
          return Gaps.vGap30;
        }),
        AttachmentUploadButton(controller: controller),
      ],
    );
  }
}
