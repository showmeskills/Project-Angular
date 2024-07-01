import 'package:gogaming_app/common/components/number_precision/number_precision.dart';

class GamingDepositAddressModel {
  String token;
  String network;
  String address;
  int expectedBlock;
  int expectedUnlockBlock;
  double minDeposit;

  String get minDepositText => NumberPrecision(minDeposit).balanceText(true);

  GamingDepositAddressModel({
    required this.token,
    required this.network,
    required this.address,
    required this.expectedBlock,
    required this.expectedUnlockBlock,
    required this.minDeposit,
  });

  @override
  String toString() {
    return 'GamingDepositAddressModel(token: $token, network: $network, address: $address, expectedBlock: $expectedBlock, expectedUnlockBlock: $expectedUnlockBlock, minDeposit: $minDeposit)';
  }

  factory GamingDepositAddressModel.fromJson(Map<String, Object?> json) {
    return GamingDepositAddressModel(
      token: json['token'] as String,
      network: json['network'] as String,
      address: json['address'] as String,
      expectedBlock: json['expectedBlock'] as int,
      expectedUnlockBlock: json['expectedUnlockBlock'] as int,
      minDeposit: (json['minDeposit'] as num).toDouble(),
    );
  }

  Map<String, Object?> toJson() => {
        'token': token,
        'network': network,
        'address': address,
        'expectedBlock': expectedBlock,
        'expectedUnlockBlock': expectedUnlockBlock,
        'minDeposit': minDeposit,
      };

  GamingDepositAddressModel copyWith({
    String? token,
    String? network,
    String? address,
    int? expectedBlock,
    int? expectedUnlockBlock,
    double? minDeposit,
  }) {
    return GamingDepositAddressModel(
      token: token ?? this.token,
      network: network ?? this.network,
      address: address ?? this.address,
      expectedBlock: expectedBlock ?? this.expectedBlock,
      expectedUnlockBlock: expectedUnlockBlock ?? this.expectedUnlockBlock,
      minDeposit: minDeposit ?? this.minDeposit,
    );
  }
}
