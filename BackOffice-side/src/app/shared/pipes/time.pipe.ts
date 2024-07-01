import { Pipe, PipeTransform } from '@angular/core';
import moment, { DurationInputArg1 } from 'moment';
import { durationFormat, timeFormat, timeUTCFormat, timeUTCFormatLocal } from 'src/app/shared/models/tools.model';
import { DurationInputArg2 } from 'moment/moment';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  constructor() {}
  transform(value: moment.MomentInput, args = 'YYYY-MM-DD HH:mm:ss', placeholdStr = '-'): any {
    if (!value || !+value) return placeholdStr;
    return timeFormat(value, args);
  }
}

@Pipe({
  name: 'durationFormat',
  standalone: true,
})
export class DurationFormatPipe implements PipeTransform {
  constructor() {}
  transform(value: DurationInputArg1, unit: DurationInputArg2 = 's', format = 'HH:mm:ss', placeholdStr = '-'): any {
    if (!value || isNaN(+value)) return placeholdStr;
    return durationFormat(value, unit, format);
  }
}

@Pipe({
  name: 'timeUTCFormat',
  standalone: true,
})
export class TimeUTCFormatPipe implements PipeTransform {
  constructor() {}
  transform(value: moment.MomentInput, args = 'YYYY-MM-DD HH:mm:ss'): any {
    if (!value) return '-';

    return timeUTCFormat(value, args);
  }
}

@Pipe({
  name: 'timeUTCFormatLocal',
  standalone: true,
})
export class TimeUTCFormatLocalPipe implements PipeTransform {
  constructor() {}
  transform(value: moment.MomentInput, args = 'YYYY-MM-DD HH:mm:ss'): any {
    if (!value) return '-';
    // 将时间字符串转换为时间戳
    let timestamp = moment.utc(value, 'YYYY-MM-DD HH:mm:ss').valueOf();
    return timeUTCFormatLocal(timestamp, args);
  }
}
