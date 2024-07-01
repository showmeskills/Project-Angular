class GamingDeviceHistoryModel {
  int? id;
  String? os;
  String? browser;
  String? createIp;
  String? createZone;
  int? createTime;
  int? lastLoginTime;
  String? lastLoginIp;
  String? lastLoginZone;

  String get osBrowser => '$browser${os?.isEmpty ?? true ? '' : "($os)"}';

  GamingDeviceHistoryModel({
    this.id,
    this.os,
    this.browser,
    this.createIp,
    this.createZone,
    this.createTime,
    this.lastLoginTime,
    this.lastLoginIp,
    this.lastLoginZone,
  });

  @override
  String toString() {
    return 'DeviceHistoryModel(id: $id, os: $os, browser: $browser, createIp: $createIp, createZone: $createZone, createTime: $createTime, lastLoginTime: $lastLoginTime, lastLoginIp: $lastLoginIp, lastLoginZone: $lastLoginZone)';
  }

  factory GamingDeviceHistoryModel.fromJson(Map<String, Object?> json) {
    return GamingDeviceHistoryModel(
      id: json['id'] as int?,
      os: json['os'] as String?,
      browser: json['browser'] as String?,
      createIp: json['createIp'] as String?,
      createZone: json['createZone'] as String?,
      createTime: json['createTime'] as int?,
      lastLoginTime: json['lastLoginTime'] as int?,
      lastLoginIp: json['lastLoginIp'] as String?,
      lastLoginZone: json['lastLoginZone'] as String?,
    );
  }

  Map<String, Object?> toJson() => {
        'id': id,
        'os': os,
        'browser': browser,
        'createIp': createIp,
        'createZone': createZone,
        'createTime': createTime,
        'lastLoginTime': lastLoginTime,
        'lastLoginIp': lastLoginIp,
        'lastLoginZone': lastLoginZone,
      };

  GamingDeviceHistoryModel copyWith({
    int? id,
    String? os,
    String? browser,
    String? createIp,
    String? createZone,
    int? createTime,
    int? lastLoginTime,
    String? lastLoginIp,
    String? lastLoginZone,
  }) {
    return GamingDeviceHistoryModel(
      id: id ?? this.id,
      os: os ?? this.os,
      browser: browser ?? this.browser,
      createIp: createIp ?? this.createIp,
      createZone: createZone ?? this.createZone,
      createTime: createTime ?? this.createTime,
      lastLoginTime: lastLoginTime ?? this.lastLoginTime,
      lastLoginIp: lastLoginIp ?? this.lastLoginIp,
      lastLoginZone: lastLoginZone ?? this.lastLoginZone,
    );
  }
}
