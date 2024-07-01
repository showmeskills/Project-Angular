import 'package:encrypt/encrypt.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:pointycastle/asymmetric/api.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class Encrypt {
  static String encodeString(String content) {
    final publicKey = RSAKeyParser()
        .parse(Config.sharedInstance.environment.rsaPublicKey) as RSAPublicKey;
    final encrypter = Encrypter(RSA(publicKey: publicKey));
    return encrypter.encrypt(content).base64;
  }

  static String md5Convert(String content) {
    final bytes = utf8.encode(content);
    return md5.convert(bytes).toString();
  }
}
