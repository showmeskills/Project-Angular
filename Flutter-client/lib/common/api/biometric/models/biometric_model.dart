T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class BiometricModel {
  int? id;
  String? deviceName;
  int? createTime;
  bool? isCurrentDevice;

  BiometricModel({
    this.id,
    this.deviceName,
    this.createTime,
    this.isCurrentDevice,
  });

  @override
  String toString() {
    return 'BiometricModel(id: $id, deviceName: $deviceName, createTime: $createTime, isCurrentDevice: $isCurrentDevice)';
  }

  factory BiometricModel.fromJson(Map<String, Object?> json) {
    return BiometricModel(
      id: asT<int>(json['id']),
      deviceName: asT<String>(json['deviceName']),
      createTime: asT<int>(json['createTime']),
      isCurrentDevice: asT<bool>(json['isCurrentDevice']),
    );
  }

  Map<String, Object?> toJson() => {
        'id': id,
        'deviceName': deviceName,
        'createTime': createTime,
        'isCurrentDevice': isCurrentDevice,
      };

  BiometricModel copyWith({
    int? id,
    String? deviceName,
    int? createTime,
    bool? isCurrentDevice,
  }) {
    return BiometricModel(
      id: id ?? this.id,
      deviceName: deviceName ?? this.deviceName,
      createTime: createTime ?? this.createTime,
      isCurrentDevice: isCurrentDevice ?? this.isCurrentDevice,
    );
  }
}
