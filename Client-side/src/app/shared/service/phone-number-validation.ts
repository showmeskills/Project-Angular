import { Injectable } from '@angular/core';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();
@Injectable({
  providedIn: 'root',
})
export class PhoneNumberService {
  /**
   * 验证手机号码是否合格
   *
   * @param phone 手机号码
   * @param areaCode 区号
   * @returns
   */
  public checkVaild(phone: string, areaCode: string) {
    if (areaCode.indexOf('+') >= 0) {
      areaCode = areaCode.substring(1);
    }
    const regionCode = phoneUtil.getRegionCodeForCountryCode(+areaCode);
    if (regionCode.toUpperCase() === 'ZZ') {
      return false;
    }
    console.log('REGION CODE: ', regionCode);
    const phoneNumber = phoneUtil.parse(phone, regionCode);
    const phoneValid = phoneUtil.isValidNumber(phoneNumber);
    const numberType = phoneUtil.getNumberType(phoneNumber);
    console.log('IS PHONE VALID: ', phoneValid);
    console.log('PHONE NUMBER TYPE: ', numberType);

    return (
      phoneUtil.isValidNumber(phoneNumber) &&
      (phoneUtil.getNumberType(phoneNumber) === 0 ||
        phoneUtil.getNumberType(phoneNumber) === 1 ||
        phoneUtil.getNumberType(phoneNumber) === 2)
    );
  }
}
