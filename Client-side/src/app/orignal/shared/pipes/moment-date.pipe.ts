import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'mdate',
})
export class MomentDatePipe implements PipeTransform {
  transform(value: string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    if (!value) return '';
    return moment(value).format(format);
  }
}
