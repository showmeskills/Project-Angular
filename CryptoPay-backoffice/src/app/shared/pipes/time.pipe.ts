import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { timeFormat, timeUTCFormat } from 'src/app/shared/models/tools.model';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  constructor() {}
  transform(value: moment.MomentInput, args = 'YYYY-MM-DD HH:mm:ss'): any {
    if (!value || !+value) return '-';

    return timeFormat(value, args);
  }
}

@Pipe({
  name: 'timeUTCFormat',
  standalone: true,
})
export class TimeUTCFormatPipe implements PipeTransform {
  constructor() {}
  transform(value: moment.MomentInput, args = 'YYYY-MM-DD HH:mm:ss'): any {
    if (!value || !+value) return '-';

    return timeUTCFormat(value, args);
  }
}
