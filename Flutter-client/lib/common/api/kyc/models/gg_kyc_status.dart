extension KycVerifyStatus on String {
  static String initial = 'I';
  static String pending = 'P';
  static String passed = 'S';
  static String reject = 'R';
}

extension KycVerifyType on String {
  static String primary = 'KycPrimary';
  static String intermediate = 'KycIntermediat';
  static String advanced = 'KycAdvanced';
}
