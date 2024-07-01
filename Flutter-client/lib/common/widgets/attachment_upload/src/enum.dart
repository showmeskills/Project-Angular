part of attachment_upload;

enum PickMethod {
  camera,
  gallery,
  fileLibrary,
}

extension PickMethodExtension on PickMethod {
  String get translate {
    switch (this) {
      case PickMethod.camera:
        return localized('camera');
      case PickMethod.gallery:
        return localized('gallery');
      case PickMethod.fileLibrary:
        return localized('select_file');
    }
  }
}

enum AttachmentType {
  image([
    '.jpg',
    '.jpeg',
    '.png',
  ]),
  video([
    '.mp4',
    '.avi',
    '.mov',
  ]),
  file([
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
  ]),
  unknown([]);

  const AttachmentType(this.extensions);

  final List<String> extensions;
}

extension StringExtension on String {
  AttachmentType get format {
    final ext = path.extension(this).toLowerCase();

    for (var e in List<AttachmentType>.from(AttachmentType.values)
      ..remove(AttachmentType.unknown)) {
      if (e.extensions.contains(ext)) {
        return e;
      }
    }

    return AttachmentType.unknown;
  }
}
