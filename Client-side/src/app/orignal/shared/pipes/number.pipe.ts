import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'number',
})
export class NumberPipe implements PipeTransform {
  constructor() {}
  transform(value: string | number, count: number | null = null): any {
    if (isNaN(Number(value))) {
      return value;
    }
    return this.toThousands(Number(value), count);
  }

  toThousands(num: number, count: number | null) {
    if (count == null) {
      return num.toFixed(0).replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    }
    if (count == 0) {
      return num.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
    return num.toFixed(count).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }
}
