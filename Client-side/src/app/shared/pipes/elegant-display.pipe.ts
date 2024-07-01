import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elegantDisplay',
})
export class ElegantDisplayPipe implements PipeTransform {
  constructor() {}

  // placeholder 占位符，如果是字符串，则values是 0 和 空的时候 都是显示这个字符串，如果是字符串数组，则分别对应空时候显示 和 0时候显示
  // join 前后拼接
  transform(value: any, placeholder?: string | string[], join?: { prefix?: string; suffix?: string }): string {
    if (placeholder !== undefined && (value === '' || value === null || value === undefined)) {
      if (Array.isArray(placeholder)) {
        if (placeholder[0]) return placeholder[0];
      } else {
        return placeholder;
      }
    }
    if (placeholder !== undefined && value === 0) {
      if (Array.isArray(placeholder)) {
        if (placeholder[1]) return placeholder[1];
      } else {
        return placeholder;
      }
    }
    return (join?.prefix || '') + value + (join?.suffix || '');
  }
}
