class GamingCurrencyNetworkModel {
  String? network;

  /// Ethereum 全名
  String name;

  /// 描述 Ethereum(ERC20)
  String? desc;

  /// 地址正则验证
  String? addressRegex;

  /// 充值预计到账（N网络确认）
  int? depositExpectedBlock;

  /// 充值预计解锁（N网络确认）
  int? depositExpectedUnlockBlock;

  /// 提款到账预计时间（分钟）
  int? withdrawArrivalTime;

  /// 最小充值/提款数量
  double? minAmount;

  /// 最大充值/提款数量
  double? maxAmount;

  /// 提款手续费
  double? withdrawFee;

  /// 手续费单位
  String? feeUnit;

  GamingCurrencyNetworkModel({
    this.network,
    required this.name,
    this.desc,
    this.addressRegex,
    this.depositExpectedBlock,
    this.depositExpectedUnlockBlock,
    this.withdrawArrivalTime,
    this.minAmount,
    this.maxAmount,
    this.withdrawFee,
    this.feeUnit,
  });

  bool search(String keyword) {
    return _search(name, keyword) ||
        _search(network ?? '', keyword) ||
        _search(desc ?? '', keyword);
  }

  bool _search(String value, String keyword) {
    return value.toLowerCase().contains(keyword.toLowerCase());
  }

  bool isPassAddress(String address) {
    if (addressRegex == null || addressRegex!.isEmpty) {
      return false;
    } else {
      final reg = RegExp(addressRegex!);
      return reg.hasMatch(address);
    }
  }

  @override
  String toString() {
    return 'Network(network: $network, name: $name, desc: $desc, addressRegex: $addressRegex, depositExpectedBlock: $depositExpectedBlock, depositExpectedUnlockBlock: $depositExpectedUnlockBlock, withdrawArrivalTime: $withdrawArrivalTime, minAmount: $minAmount, maxAmount: $maxAmount, withdrawFee: $withdrawFee, feeUnit: $feeUnit)';
  }

  factory GamingCurrencyNetworkModel.fromJson(Map<String, Object?> json) =>
      GamingCurrencyNetworkModel(
        network: json['network'] as String?,
        name: json['name'] as String,
        desc: json['desc'] as String?,
        addressRegex: json['addressRegex'] as String?,
        depositExpectedBlock: json['depositExpectedBlock'] as int?,
        depositExpectedUnlockBlock: json['depositExpectedUnlockBlock'] as int?,
        withdrawArrivalTime: json['withdrawArrivalTime'] as int?,
        minAmount: (json['minAmount'] as num?)?.toDouble(),
        maxAmount: (json['maxAmount'] as num?)?.toDouble(),
        withdrawFee: (json['withdrawFee'] as num?)?.toDouble(),
        feeUnit: json['feeUnit'] as String?,
      );

  Map<String, Object?> toJson() => {
        'network': network,
        'name': name,
        'desc': desc,
        'addressRegex': addressRegex,
        'depositExpectedBlock': depositExpectedBlock,
        'depositExpectedUnlockBlock': depositExpectedUnlockBlock,
        'withdrawArrivalTime': withdrawArrivalTime,
        'minAmount': minAmount,
        'maxAmount': maxAmount,
        'withdrawFee': withdrawFee,
        'feeUnit': feeUnit,
      };

  GamingCurrencyNetworkModel copyWith({
    String? network,
    String? name,
    String? desc,
    String? addressRegex,
    int? depositExpectedBlock,
    int? depositExpectedUnlockBlock,
    int? withdrawArrivalTime,
    double? minAmount,
    double? maxAmount,
    double? withdrawFee,
    String? feeUnit,
  }) {
    return GamingCurrencyNetworkModel(
      network: network ?? this.network,
      name: name ?? this.name,
      desc: desc ?? this.desc,
      addressRegex: addressRegex ?? this.addressRegex,
      depositExpectedBlock: depositExpectedBlock ?? this.depositExpectedBlock,
      depositExpectedUnlockBlock:
          depositExpectedUnlockBlock ?? this.depositExpectedUnlockBlock,
      withdrawArrivalTime: withdrawArrivalTime ?? this.withdrawArrivalTime,
      minAmount: minAmount ?? this.minAmount,
      maxAmount: maxAmount ?? this.maxAmount,
      withdrawFee: withdrawFee ?? this.withdrawFee,
      feeUnit: feeUnit ?? this.feeUnit,
    );
  }

  @override
  int get hashCode => name.hashCode & desc.hashCode & network.hashCode;

  @override
  bool operator ==(Object other) {
    return other is GamingCurrencyNetworkModel &&
        other.name == name &&
        other.desc == desc &&
        other.network == network;
  }
}
