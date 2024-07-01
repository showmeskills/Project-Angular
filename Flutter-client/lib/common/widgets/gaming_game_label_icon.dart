// ignore_for_file: depend_on_referenced_packages

import 'package:flutter/material.dart';
import 'package:path/path.dart' as path;

import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingGameLabelIcon extends StatelessWidget {
  const GamingGameLabelIcon({
    super.key,
    required this.iconName,
    required this.size,
    this.color,
  });
  final String iconName;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: _showImage(),
    );
  }

  bool get _isURL {
    final uri = Uri.parse(iconName);
    return uri.isScheme('http') || uri.isScheme('https');
  }

  Widget _showImage() {
    if (path.extension(iconName) == '.svg') {
      if (_isURL) {
        return SvgPicture.network(
          iconName,
          width: size,
          height: size,
          color: color,
        );
      } else {
        return SvgPicture.asset(
          iconName,
          width: size,
          height: size,
          color: color,
        );
      }
    }

    if (_isURL) {
      return GamingImage.network(
        url: iconName,
        width: size,
        height: size,
        errorBuilder: (context, error, stackTrace) {
          return Gaps.empty;
        },
      );
    } else {
      return Image.asset(
        iconName,
        width: size,
        height: size,
      );
    }
  }
}
