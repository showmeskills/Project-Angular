import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'number',
  standalone: true,
})
export class NumberPipe implements PipeTransform {
  constructor() {}
  transform(value: string, count = 6): any {
    return this.toThousands(Number(value), count);
  }

  toThousands(num, count) {
    if (count == 0) {
      return num.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
    return num.toFixed(count).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }
}

@Pipe({
  name: 'integer',
  standalone: true,
})
export class IntegerPipe implements PipeTransform {
  constructor() {}

  transform(value: number): any {
    return Number.parseInt(String(+value || 0));
  }
}

@Pipe({
  name: 'padThousands',
  standalone: true,
})
export class PadThousandsPipe implements PipeTransform {
  transform(value: any): string {
    const str = value.toString();
    const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
    return str.replace(reg, '$1,');
  }
}
