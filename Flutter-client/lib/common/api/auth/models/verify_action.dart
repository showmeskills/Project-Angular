enum VerifyAction {
  register("Register"),
  login("Login"),
  resetPwd("ResetPwd"),
  bindGoogleVerify("BindGoogleVerify"),
  bindMobile("BindMobile"),
  modifyUserName("ModifyUserName"),
  addTokenAddress("AddTokenAddress"),
  addBankCard("AddBankCard"),
  delBankCard("DelBankCard"),
  batchDelBankCard("BatchDelBankCard"),
  withdraw("Withdraw"),
  deleteTokenAddress("DeleteTokenAddress"),
  joinWhiteList("JoinWhiteList"),
  removeWhiteList("RemoveWhiteList"),
  whiteListSwitch("WhiteListSwitch"),
  unbindSocial("UnbindSocial"),
  bindEmail("BindEmail"),
  unBindEmail("UnBindEmail");

  const VerifyAction(this.value);

  final String value;
}

extension VerifyActionExtension on VerifyAction {
  static VerifyAction convert(String value) {
    switch (value) {
      case 'Register':
        return VerifyAction.register;
      case 'Login':
        return VerifyAction.login;
      case 'ResetPwd':
        return VerifyAction.resetPwd;
      case 'BindGoogleVerify':
        return VerifyAction.bindGoogleVerify;
      case 'BindMobile':
        return VerifyAction.bindMobile;
      case 'ModifyUserName':
        return VerifyAction.modifyUserName;
      case 'AddTokenAddress':
        return VerifyAction.addTokenAddress;
      case 'AddBankCard':
        return VerifyAction.addBankCard;
      case 'DelBankCard':
        return VerifyAction.delBankCard;
      case 'BatchDelBankCard':
        return VerifyAction.batchDelBankCard;
      case 'Withdraw':
        return VerifyAction.withdraw;
      case 'DeleteTokenAddress':
        return VerifyAction.deleteTokenAddress;
      case 'JoinWhiteList':
        return VerifyAction.joinWhiteList;
      case 'RemoveWhiteList':
        return VerifyAction.removeWhiteList;
      case 'WhiteListSwitch':
        return VerifyAction.whiteListSwitch;
      case 'UnbindSocial':
        return VerifyAction.unbindSocial;
    }
    throw Exception('no implement');
  }
}
