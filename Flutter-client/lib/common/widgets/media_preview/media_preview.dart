library media_preview;

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';

class MediaPreview {
  static void show({
    required List<String> medias,
    int initialPage = 0,
  }) {
    Navigator.of(Get.overlayContext!).push(
      PageRouteBuilder<void>(
        opaque: false,
        pageBuilder: (context, animation, secondaryAnimation) {
          return MediaPreviewView(
            medias: medias,
            initialPage: initialPage,
          );
        },
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
      ),
    );
  }
}

class MediaPreviewView extends StatefulWidget {
  const MediaPreviewView({
    super.key,
    required this.medias,
    this.initialPage = 0,
  });

  final List<String> medias;
  final int initialPage;

  @override
  State<MediaPreviewView> createState() => _MediaPreviewViewState();
}

class _MediaPreviewViewState extends State<MediaPreviewView> {
  late PageController _controller;

  @override
  void initState() {
    super.initState();
    _controller = PageController(
        initialPage: widget.initialPage == -1 ? 0 : widget.initialPage);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: () {
        Navigator.of(context).pop();
      },
      child: Material(
        color: Colors.black,
        child: PhotoViewGallery.builder(
          scrollPhysics: const BouncingScrollPhysics(),
          builder: (BuildContext context, int index) {
            return PhotoViewGalleryPageOptions.customChild(
              child: GamingImage.network(
                url: widget.medias[index],
                fit: BoxFit.contain,
              ),
              initialScale: PhotoViewComputedScale.contained * 1,
              heroAttributes:
                  PhotoViewHeroAttributes(tag: widget.medias[index]),
            );
          },
          itemCount: widget.medias.length,
          loadingBuilder: (context, event) => Center(
            child: GoGamingLoading(
              size: 20.dp,
            ),
          ),
          backgroundDecoration: const BoxDecoration(
            color: Colors.black,
          ),
          pageController: _controller,
        ),
      ),
    );
  }
}
