class GamingInviteModel {
  double? commissionRate;
  double? friendCommission;
  String? inviteCode;
  String? inviteUrl;
  double? commissionRatio;
  int? relationSize;

  GamingInviteModel({
    this.commissionRate,
    this.friendCommission,
    this.inviteCode,
    this.inviteUrl,
    this.commissionRatio,
    this.relationSize,
  });

  @override
  String toString() {
    return 'GamingInviteModel(commissionRate: $commissionRate, friendCommission: $friendCommission, inviteCode: $inviteCode, inviteUrl: $inviteUrl, commissionRatio: $commissionRatio, relationSize: $relationSize)';
  }

  factory GamingInviteModel.fromJson(Map<String, Object?> json) {
    return GamingInviteModel(
      commissionRate: (json['commissionRate'] as num?)?.toDouble(),
      friendCommission: (json['friendCommission'] as num?)?.toDouble(),
      inviteCode: json['inviteCode'] as String?,
      inviteUrl: json['inviteUrl'] as String?,
      commissionRatio: (json['commissionRatio'] as num?)?.toDouble(),
      relationSize: json['relationSize'] as int?,
    );
  }

  Map<String, Object?> toJson() => {
        'commissionRate': commissionRate,
        'friendCommission': friendCommission,
        'inviteCode': inviteCode,
        'inviteUrl': inviteUrl,
        'commissionRatio': commissionRatio,
        'relationSize': relationSize,
      };

  GamingInviteModel copyWith({
    double? commissionRate,
    double? friendCommission,
    String? inviteCode,
    String? inviteUrl,
    double? commissionRatio,
    int? relationSize,
  }) {
    return GamingInviteModel(
      commissionRate: commissionRate ?? this.commissionRate,
      friendCommission: friendCommission ?? this.friendCommission,
      inviteCode: inviteCode ?? this.inviteCode,
      inviteUrl: inviteUrl ?? this.inviteUrl,
      commissionRatio: commissionRatio ?? this.commissionRatio,
      relationSize: relationSize ?? this.relationSize,
    );
  }
}
