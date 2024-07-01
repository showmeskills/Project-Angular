import { Pipe, PipeTransform } from '@angular/core';
import { BigNum, bigNumber, reduceTotal, toFormatMoney } from 'src/app/shared/models/tools.model';

@Pipe({
  name: 'bigNumber',
  standalone: true,
})
export class BigNumberPipe implements PipeTransform {
  transform(value: unknown): BigNum {
    return bigNumber(value);
  }
}

/**
 * 格式化金额
 * felix: 此pipe不仅对金额数值进行格式化，也对页面其他动态数值并同应用，如有修改请告知。
 */
@Pipe({
  name: 'toFormatMoney',
  standalone: true,
})
export class FormatMoneyPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return toFormatMoney(value, ...(args as any));
  }
}

@Pipe({
  name: 'numberSign',
  standalone: true,
})
export class NumberSignPipe implements PipeTransform {
  transform(value: any): string {
    if (!value || !+value) return '0';

    if (String(value).startsWith('-')) return String(value);

    return `+${value}`;
  }
}

/**
 * 截取小数，不进行四舍五入
 *
 * example:
 * {{ 123.4567 | toFormatNumberDecimal:2 }} -> 123.45
 * 默认截取到两位小数
 */
@Pipe({
  name: 'toFormatNumberDecimal',
  standalone: true,
})
export class FormatNumberDecimalPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (!value) return 0;
    const res = String(value).split('.');
    const int = res[0];
    const decimal = res[1];

    // 有小数位
    if (decimal) {
      const keep = args[0] || 2; // 默认截取到两位小数
      const len = decimal.length;

      // 小数位超出限制
      if (len > keep) {
        return int + '.' + decimal.substr(0, keep);
      } else {
        // 小数位不足
        return int + '.' + decimal;
      }
    } else {
      // 无小数位
      return value;
    }
  }
}

/**
 * 累加数组中的值进行格式化
 * @deprecated 使用 `reduceTotal` 进行替代，更新 `currencyValue` 之后将会删除
 */
@Pipe({
  name: 'toFormatMoneyArr',
  standalone: true,
})
export class FormatMoneyArrPipe implements PipeTransform {
  /**
   * @deprecated 使用reduceTotal进行替代，更新currencyValue之后将会弃用
   */
  transform(value: any[], ...args: unknown[]): unknown {
    return toFormatMoney(reduceTotal(value, ...args));
  }
}

/**
 * ## 累加值
 *
 * ### 例子
 * 当需要对数组中的值进行累加时，可以使用此pipe。
 *
 * #### 1. number数组例子
 * ```typescript
 * @Component({
 *   template: `
 *     <span>总计：{{ list | reduceNum }}</span>
 *   `,
 * })
 * class Example {
 *   list = [1, 2, 3, 4, 5];
 * }
 * ```
 * #### 2. 数组中对象某字段叠加例子
 * ```typescript
 * @Component({
 *   template: `
 *     <span>总计：{{ list | reduceNum: 'amount' }}</span>
 *   `,
 * })
 * class Example {
 *   list = [{ amount: 100 }, { amount: 200 }, { amount: 300 }];
 * }
 * ```
 */
@Pipe({
  name: 'reduceTotal',
  standalone: true,
})
export class ReduceTotalPipe implements PipeTransform {
  transform<T extends Object | Number>(value: T[], ...args: Array<keyof T>): string {
    return reduceTotal(value, ...args);
  }
}
