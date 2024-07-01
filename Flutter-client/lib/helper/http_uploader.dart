import 'dart:io';

import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:path/path.dart' as path;
import 'package:http/http.dart' as http;

class HttpUploader {
  static Stream<String> upload({
    required String uploadUrl,
    required String fullUrl,
    required File file,
    String? contentType,
  }) {
    return Stream.fromFuture(http.put(
      Uri.parse(uploadUrl),
      headers: {'Content-Type': contentType ?? file.contentType},
      body: file.readAsBytesSync(),
    )).flatMap((value) {
      if (value.statusCode == 200) {
        return Stream.value(fullUrl);
      } else {
        throw UploadException(value);
      }
    }).onErrorResume((error, stackTrace) {
      SentryReportUtil.captureHttpRequestError(
        apiErrorCode: SpecialApiErrorCode.upload.code,
        request: uploadUrl,
        message: error.toString(),
      );
      throw GoGamingResponseException(
        headers: Headers()..setApiErrorCode(SpecialApiErrorCode.upload.code),
        message: localized('network_err'),
      );
    });
  }
}

// 上传异常/主要是response异常
class UploadException implements Exception {
  final http.Response response;

  UploadException(this.response);

  @override
  String toString() {
    return 'UploadException: ${response.statusCode} ${response.reasonPhrase}';
  }
}

extension _StringExtension on String {
  String get contentType {
    final ext = path.extension(this).toLowerCase();
    if (ext == '.jpg' || ext == '.jpeg') {
      return 'image/jpeg';
    } else if (ext == '.png') {
      return 'image/png';
    } else if (ext == '.mp4') {
      return 'video/mp4';
    } else if (ext == '.avi') {
      return 'video/avi';
    } else if (ext == '.mov') {
      return 'video/quicktime';
    } else if (ext == '.rmvb') {
      return 'video/vnd.rn-realmedia-vbr';
    } else if (ext == '.mp3') {
      return 'audio/mp3';
    } else if (ext == '.pdf') {
      return 'application/pdf';
    } else if (ext == '.doc') {
      return 'application/msword';
    } else if (ext == '.docx') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext == '.xls') {
      return 'application/vnd.ms-excel';
    } else if (ext == '.xlsx') {
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    return 'application/octet-stream';
  }
}

extension FileExtension on File {
  String get contentType {
    return this.path.contentType;
  }
}
