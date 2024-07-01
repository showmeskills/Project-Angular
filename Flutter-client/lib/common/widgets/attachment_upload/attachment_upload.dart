library attachment_upload;

import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_upload_model.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/painting/r_dotted_line_border.dart';
import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/media_preview/media_preview.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:image_picker/image_picker.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:path/path.dart' as path;

part 'src/button.dart';
part 'src/controller.dart';
part 'src/enum.dart';
part 'src/uploaded_view.dart';
