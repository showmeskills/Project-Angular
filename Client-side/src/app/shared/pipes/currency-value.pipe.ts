import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Pipe({
  name: 'currencyValue',
  pure: false,
})
export class CurrencyValuePipe implements PipeTransform {
  constructor(private appService: AppService) {}

  result: string = '';
  value: any;
  currency: any;

  /**
   * 转换币种小数位数、占位符等功能
   * 在金额显示的时候，最多保留9位数，使用科学计数法显示(每3位之间为,号)
   * 数字长度大于9位数时，保留最大显示8位数，并以K,M(千，百万)来简写
   * 加密货币小数位后最多显示8位，法币小数位后最多显示2位，当数字超过9位时，自动省略小数位最后多余的位数
   *
   * @param value 原始值
   * @param currency 币种
   * @param placeholder 非 undefined 时候，占位符，如果是字符串，则values是 0 和 空的时候 都是显示这个字符串，如果是字符串数组，则分别对应空时候显示 和 0时候显示
   * @param addPlus 如果是正数，前面是否添加 “+” 号
   * @param toFixed 非 undefined 时候，忽略数字小数最多8位，法币最多2位的限制，而使用此数字来限定小数位数。是数字数组的时候，则区分虚拟币[0]和法币[1]来处理
   * @returns
   */
  transform(
    value: any,
    currency: string,
    placeholder?: string | string[],
    addPlus?: boolean,
    toFixed?: number | (number | undefined)[]
  ): string {
    //有result且value和currency都没变(其余参数暂不考虑动态)，直接使用result
    if (this.value === value && this.currency === currency && this.result) return this.result;

    this.value = value;
    this.currency = currency;

    //placeholder判断，中途直接返回
    if (placeholder !== undefined && (value === '' || value === null || value === undefined)) {
      if (Array.isArray(placeholder)) {
        if (placeholder[0]) {
          this.result = placeholder[0];
          return this.result;
        }
      } else {
        this.result = placeholder;
        return this.result;
      }
    }
    if (placeholder !== undefined && value === 0) {
      if (Array.isArray(placeholder)) {
        if (placeholder[1]) {
          this.result = placeholder[1];
          return this.result;
        }
      } else {
        this.result = placeholder;
        return this.result;
      }
    }

    //防undefined、NaN等报错
    value = isNaN(Number(value)) ? 0 : Number(value);

    let prefix = '';
    let suffix = '';

    // 添加前缀
    if (addPlus && Number(value) > 0) {
      prefix = '+';
    } else if (Number(value) < 0) {
      // 负数去掉原始负号（方便下面计算位数），改为前缀拼接
      value = Math.abs(value);
      prefix = '-';
    }

    const currencies = this.appService.currencies$.value; // 可能为空[]
    const target = currencies.find((x: any) => x.currency === currency);
    if (target) {
      const isDigital = target.isDigital;
      let fixed = isDigital ? 8 : 2;
      if (toFixed !== undefined)
        fixed = Array.isArray(toFixed) ? (isDigital ? toFixed[0] || 8 : toFixed[1] || 2) : toFixed;

      let v1 = Number(value).toDecimal(fixed);

      //数字太大,使用科学计数
      const ol = String(Math.floor(value)).length;
      if (ol >= 12) {
        // 除以1000000 增加后缀M
        v1 = Number(value).divide(1000000).toDecimal(fixed);
        suffix = 'M';
      } else if (ol >= 9) {
        // 除以1000 增加后缀K
        v1 = Number(value).divide(1000).toDecimal(fixed);
        suffix = 'K';
      }

      //限制总位数，增加逗号
      let [leftSide, rightSide] = v1.split('.');
      const leftSideLength = leftSide.length;

      if (leftSideLength >= 9) {
        v1 = this.addComma(leftSide);
      } else {
        let maxDecimalLength = 9 - leftSideLength;
        maxDecimalLength = maxDecimalLength > 0 ? maxDecimalLength : 0;
        rightSide = rightSide.slice(0, maxDecimalLength);
        v1 = this.addComma(leftSide) + (rightSide.length > 0 ? `.${rightSide}` : '');
      }

      this.result = prefix + v1 + suffix;
      return this.result;
    } else {
      //未找到币种，返回原始值
      return prefix + value;
    }
  }

  addComma(str: string) {
    return str.replace(/\d+/, function (n) {
      return n.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    });
  }
}
