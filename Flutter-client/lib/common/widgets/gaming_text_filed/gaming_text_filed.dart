library gaming_text_field;

import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';

part 'src/controller.dart';
part 'src/icon.dart';
part 'src/validator.dart';
part 'src/views/base_text_field.dart';
part 'src/views/check_phone_text_field.dart';
part 'src/views/password_text_field.dart';
part 'src/views/text_field.dart';
part 'src/views/verify_result_widget.dart';
