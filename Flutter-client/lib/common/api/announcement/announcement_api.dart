// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Announcement with GoGamingApi {
  getAnnouncement(params: {
    'ClientType': 'App',
  });

  const Announcement({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Announcement.getAnnouncement:
        return '/article/announcement/gethomearticle';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Announcement.getAnnouncement:
        return HTTPMethod.get;
    }
  }

  @override
  bool get needCache {
    return true;
  }
}
