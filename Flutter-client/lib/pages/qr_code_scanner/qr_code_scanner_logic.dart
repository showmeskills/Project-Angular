import 'package:gogaming_app/controller_header.dart';
import 'package:image_picker/image_picker.dart';
import 'package:scan/scan.dart';

import '../../helper/perimission_util.dart';

class QRCodeScannerLogic extends BaseController {
  ScanController controller = ScanController();

  void onScanComplete(String result) {
    controller.pause();
    Get.back<String>(result: result);
  }

  void onPickPhotosFromGallery() {
    GamingPermissionUtil.photos().then((value) {
      _openGallery();
    });
  }

  Future<void> _openGallery() async {
    controller.pause();
    final result = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 60,
    );
    controller.resume();
    if (result != null) {
      controller.pause();
      String? code = await Scan.parse(result.path);
      Get.back<String>(result: code);
    }
  }
}
