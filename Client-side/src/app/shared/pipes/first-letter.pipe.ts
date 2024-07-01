// Angular
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns only first letter of string
 */
@Pipe({
  name: 'firstLetter',
})
export class FirstLetterPipe implements PipeTransform {
  /**
   * Transform
   *
   * @param value: any
   * @param args: any
   * @param value
   * @param args
   */
  transform(value: any, args?: any): any {
    if (value) {
      return value
        .split(' ')
        .map((n: any) => n[0])
        .join('');
    }
  }
}
