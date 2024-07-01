import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class KycValidationService {
  constructor() {}

  public static validateNameWithNationalityItem(countryCode: string, name: string) {
    switch (countryCode) {
      case 'CHN':
        return KycValidationService.validateChinaName(name);
      case 'VNM':
        return KycValidationService.validateVietnameseName(name);
      case 'THA':
        return KycValidationService.validateThaiName(name);
      default:
        return !KycValidationService._hasSpecialCharacters(name);
    }
  }

  public static validatePostCodeWithNationalityItem(countryCode: string, value: string) {
    switch (countryCode) {
      case 'CHN':
        return KycValidationService._postCodeChinaCharacters(value) && KycValidationService._hasNumber(value);
      case 'GB':
        return KycValidationService._postCodeUkCharacters(value);
      default:
        return !KycValidationService._hasSpecialCharacters(value) && !KycValidationService.validateChinaName(value);
    }
  }

  // 中国身份id验证
  public static validateChinaID(id: string) {
    // 1 "验证通过!", 0 //校验不通过
    const format =
      /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
    //号码规则校验
    if (!format.test(id)) {
      return false;
    }
    //区位码校验
    //出生年月日校验   前正则限制起始年份为1900;

    const newDate: any = new Date();
    const year: any = id.substr(6, 4); //身份证年
    const month: any = id.substr(10, 2); //身份证月
    const date: any = id.substr(12, 2); //身份证日
    const time = Date.parse(month + '-' + date + '-' + year); //身份证日期时间戳date
    const now_time = Date.parse(newDate); //当前时间戳
    const dates = new Date(year, month, 0).getDate(); //身份证当月天数
    if (time > now_time || date > dates) {
      return false;
    }
    //校验码判断
    const c = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; //系数
    const b = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']; //校验码对照表
    const id_array = id.split('');
    let sum = 0;
    for (let k = 0; k < 17; k++) {
      sum += parseInt(id_array[k]) * c[k];
    }
    if (id_array[17].toUpperCase() != b[sum % 11].toUpperCase()) {
      return false;
    }
    return true;
  }

  // 中文姓名验证
  public static validateChinaName(name: string) {
    if (name.length === 0) return false;
    return KycValidationService._hasChinese(name) && !KycValidationService._hasSpecialCharacters(name);
  }

  public static validateVietnameseName(name: string) {
    if (name.length === 0) return false;
    return KycValidationService._hasVietnamese(name) && !KycValidationService._hasSpecialCharacters(name);
  }

  public static validateThaiName(name: string) {
    if (name.length === 0) return false;
    return KycValidationService._hasThai(name) && !KycValidationService._hasSpecialCharacters(name);
  }

  //越南语言验证
  public static _hasVietnamese(value: string): boolean {
    value = value.toUpperCase();
    const regex =
      /\b\S*[AĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴAĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴAĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴAĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴAĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴAĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴA-Z]+\S*\b/;
    return regex.test(value);
  }

  //泰语言验证
  public static _hasThai(value: string): boolean {
    const regex = /[\u0E00-\u0E7Fa-zA-Z'_@./#&+-]/;
    return regex.test(value);
  }

  public static _hasChinese(value: string): boolean {
    const nameReg = /^[\u4e00-\u9fa5]{1,6}(·[\u4e00-\u9fa5]{1,6}){0,2}$/;
    if (!nameReg.test(value)) {
      return false;
    } else {
      return true;
    }
  }

  // 通用特殊字符
  public static _hasSpecialCharacters(value: string): boolean {
    const regex = /[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/;
    return regex.test(value);
  }

  // 数字(用于邮编验证)
  public static _hasNumber(value: string): boolean {
    const regex = /^\d{1,}$/;
    return regex.test(value);
  }

  //中国postcode
  public static _postCodeChinaCharacters(value: string): boolean {
    const regex = /^[0-9]{6}$/;
    return regex.test(value);
  }

  //英国政府postcode
  public static _postCodeUkCharacters(value: string): boolean {
    const regex =
      /^(GIR 0AA)|((([A-Z-[QVX]][0-9][0-9]?)|(([A-Z-[QVX]][A-Z-[IJZ]][0-9][0-9]?)|(([A-Z-[QVX]][0-9][A-HJKSTUW])|([A-Z-[QVX]][A-Z-[IJZ]][0-9][ABEHMNPRVWXY])))) [0-9][A-Z-[CIKMOV]]{2})?$/;
    return regex.test(value);
  }

  /**
   * 名和姓 不包含中,空格和数字和特殊字符
   *
   * @param countryCode
   * @param value
   * @returns boolean
   */
  public static _hasValidFLName(countryCode: string, value: string): boolean {
    return (
      this.validateNameWithNationalityItem(countryCode, value) &&
      !this._hasChinese(value) &&
      !/\d+/.test(value) &&
      /^\S+$/.test(value)
    );
  }
}
