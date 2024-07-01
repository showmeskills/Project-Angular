import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * 验证Controls数组是否有选中
 */
export const validatorArrayRequired = (name: AbstractControl): ValidationErrors | null => {
  return !(Array.isArray(name?.value) && name.value.some((j) => j)) ? { arrayRequired: true } : null;
};

/**
 * 验证是否为true值
 */
export const validatorTrue = (name: AbstractControl) => {
  return !(name && name.value) ? { isTrue: true } : null;
};

/**
 * 验证是否有number值
 */
export const validatorNumberRequired = (name: AbstractControl) => {
  return (!Number.parseFloat(name?.value) && { numberRequired: true }) || null;
};

/**
 * 验证时间须大于当前时间
 */
export const validatorLgNowTime = (ac: AbstractControl) => {
  return !(ac && ac.value && new Date(ac.value).getTime() > Date.now()) ? { lgNowTime: true } : null;
};

/***
 * 验证银行卡号
 * @param ac
 */
export const validatorBankCard = (ac: AbstractControl) => {
  const payCard = ac.value;
  const invalidRes = { invalid: true };

  // 非数字
  if (!/(^\d{16}$)|(^\d{19}$)/.test(payCard)) {
    return invalidRes;
  }

  const everyNum = String(payCard).split(''); // 将银行卡的所有数字拆分
  everyNum.forEach((no: string, index) => {
    if (index % 2 === 0) {
      // 从右往左  偶数位
      let num;

      num = Number(no).toString(2) + '0'; // 转换为二进制，并将二进制左移一位
      num = parseInt(num, 2); // 转回十进制
      num = ((num / 10) | 0) + (num % 10); // 当前数字每位的和

      everyNum[index] = num;
    }
  });

  // 统计总和 % 10是否整除
  const invalid = everyNum.reduce((tol, num) => tol + parseInt(num), 0) % 10 === 0;

  return invalid ? invalidRes : null;
};

/**
 * 验证IP
 * @param separator {string} 分隔符 默认空。如：逗号分割：','
 * @param separatorSpaceEnd {boolean} 分隔符后是否允许空格 默认false。如：逗号分割：'192.168.1.1, 192.168.1.2'
 * @param isTrim {boolean} 是否去除前后空格 默认false
 */
export const validatorIP = (separator = '', separatorSpaceEnd = true, isTrim = false): ValidatorFn => {
  return (ipCtl: AbstractControl<string>): ValidationErrors | null => {
    const value = isTrim ? ipCtl.value?.trim() : ipCtl.value;
    if (!value) return null; // 需可空
    const ipReg = /^((25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$/; // IP正则 不能有0作为前导
    const ipSeparatorReg = new RegExp(
      `^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\\${
        separatorSpaceEnd ? `${separator} ?|\\${separator}` : separator
      }?|$))+$`
    ); // IP带有分割正则匹配

    if (!(separator ? ipSeparatorReg : ipReg).test(value)) return { ipInvalid: true };

    return null;
  };
};
