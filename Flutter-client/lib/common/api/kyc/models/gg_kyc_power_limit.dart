class KycPowerAndLimits {
  String title;
  List<KycPowerDesc> info;

  KycPowerAndLimits({required this.title, required this.info});
}

class KycPowerDesc {
  String name;
  List<String> desc;

  KycPowerDesc({required this.name, required this.desc});
}
