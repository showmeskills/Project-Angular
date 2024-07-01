import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AES, enc, mode, pad } from 'crypto-js';
import { environment } from 'src/environments/environment';

const secretKey = 'fAznjeRFoRe8d5VG';

@Injectable({
  providedIn: 'root',
})
export class EncryptService {
  constructor() {}

  encrypt(content: string, rsaPublicKey: string = environment.rsaPublicKey): string {
    //@ts-ignore
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(rsaPublicKey);
    return encryptor.encrypt(content).toString();
  }
  encryptLong(content: string, rsaPublicKey: string = environment.rsaPublicKey): string {
    //@ts-ignore
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(rsaPublicKey);
    return encryptor.encryptLong(content).toString();
  }

  encryptByDeAES(data: string): string {
    const Key = '123456';
    const tmpDeAES = AES.decrypt(data, Key, {
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });
    return tmpDeAES.toString(enc.Utf8);
  }

  aesEncrypt = (content: any) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey); //处理密钥
    const srcs = CryptoJS.enc.Utf8.parse(content); //处理要加密的字符串
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  };

  aesDecrypt(encryptStr: any) {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const decrypt = CryptoJS.AES.decrypt(encryptStr, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
}
