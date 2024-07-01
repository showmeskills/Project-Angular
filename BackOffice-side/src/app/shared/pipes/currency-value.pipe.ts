import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { bigNumber } from 'src/app/shared/models/tools.model';
import { CurrencyService } from '../service/currency.service';

@Pipe({
  name: 'currencyValue',
  pure: false,
  standalone: true,
})
export class CurrencyValuePipe implements PipeTransform {
  constructor(private currencyValueService: CurrencyValueService) {}

  transform(value: any, currency: string | boolean, isWinLose?: boolean, toFixed?: number): any {
    return this.currencyValueService.transform(value, currency, isWinLose, toFixed);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyValueService implements PipeTransform {
  constructor(private currencyService: CurrencyService) {}

  result = '';
  value: any;
  currency: any;

  /**
   * 金额数字显示 位数、占位符等功能
   * 1.法币/虚拟币 最多保留9位数（含小数位），小数点前使用科学计数法显示(每3位之间为,号)
   * 2.法币/虚拟币 长度大于9位数时，保留最大显示8位数，并以K,M(千，百万)来简写
   * 3.虚拟币小数位后最多显示8位，法币小数位后最多显示2位，当数字超过9位时，自动省略小数位最后多余的位数
   * @param value 原始值
   * @param currency {string|boolean} 币种 (为boolean值时：true为虚拟币，false为法币)
   * @param isWinLose 是否输赢类型：正数补充 + 负数补充 -
   * @param toFixed 自定义小数位
   */
  transform(value: any, currency: string | boolean, isWinLose?: boolean, toFixed?: number): any {
    //有result且value和currency都没变(其余参数暂不考虑动态)，直接使用result
    if (this.value === value && this.currency === currency && this.result) return this.result;

    this.value = value;
    this.currency = currency;

    // 判断后台是否传无效值
    if (value === '' || value === null || value === undefined || isNaN(value)) {
      this.result = '-';
      return this.result;
    }
    // 传入值为0，则返回为0 (前台默认 0 也根据币种补充位数，暂且屏蔽观察)
    // else if (value === 0) {
    //   this.result = 0;
    //   return this.result;
    // }

    let num = bigNumber(value).toNumber();

    let prefix = ''; // 前缀占位符(+,-)
    let suffix = ''; // 后缀占位符(K,M)

    // 添加前缀
    if (isWinLose && num > 0) {
      prefix = '+';
    } else if (num < 0) {
      // 负数变正数（方便下面计算位数），改为前缀拼接
      num = Math.abs(num);
      prefix = '-';
    }

    const isBoolArg = typeof currency === 'boolean';
    const currencyList = this.currencyService.list;
    const target = currencyList.find((v: any) => v.code === currency);
    if (!!target || isBoolArg) {
      // 小数点后个位数
      let fixed: number;
      if (toFixed !== undefined) {
        fixed = Number(toFixed);
      } else if (isBoolArg) {
        fixed = currency ? 8 : 2;
      } else {
        fixed = target!.isDigital ? 8 : 2;
      }

      let computeNum: any;

      // 判断是否增加后缀，并按币种截取小数
      const ol = String(Math.floor(num)).length;
      if (ol >= 12) {
        // 除以1000000 增加后缀M
        computeNum = this.toDecimal(bigNumber(num).dividedBy(1000000), fixed);
        suffix = 'M';
      } else if (ol >= 9) {
        // 除以1000 增加后缀K
        computeNum = this.toDecimal(bigNumber(num).dividedBy(1000), fixed);
        suffix = 'K';
      } else {
        computeNum = this.toDecimal(num, fixed);
      }

      // 限制总位数（先取整数并格式化,后取小数位拼接）
      let [leftSide, rightSide] = computeNum.split('.');
      const leftSideLength = leftSide.length;
      const formatNum = bigNumber(leftSide).toFormat();

      if (leftSideLength >= 9) {
        computeNum = formatNum;
      } else {
        let maxDecimalLength = 9 - leftSideLength;
        maxDecimalLength = maxDecimalLength > 0 ? maxDecimalLength : 0;
        rightSide = rightSide.slice(0, maxDecimalLength);
        computeNum = formatNum + (rightSide.length > 0 ? `.${rightSide}` : '');
      }

      this.result = prefix + computeNum + suffix;
      return this.result;
    } else {
      //未找到币种
      return prefix + bigNumber(num).toFormat();
    }
  }

  // 截取小数位，不进行四舍五入
  toDecimal(num: any, decimal: any) {
    let res = this.toNonExponential(num);
    const index = res.indexOf('.');
    if (index !== -1) {
      res = res.substring(0, decimal + index + 1);
    } else {
      res = res.substring(0);
    }
    return parseFloat(res).toFixed(decimal);
  }

  // 科学计数法转数字
  toNonExponential(num: any) {
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
  }
}
