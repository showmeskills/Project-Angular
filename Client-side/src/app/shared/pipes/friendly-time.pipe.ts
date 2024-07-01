import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { LocaleService } from '../service/locale.service';

@Pipe({
  name: 'friendlyTime',
})
export class FriendlyTimePipe implements PipeTransform {
  constructor(private localService: LocaleService) {}

  transform(value: number): string {
    const omobj = moment(value);
    // 按纯天数计算给来的时间与前天的差值
    const diff = moment(value).startOf('day').diff(moment().startOf('day').subtract(2, 'day'), 'day');
    switch (diff) {
      case 2: //今天
        return omobj.format('HH:mm');
      case 1: //昨天
        return this.localService.getValue('msg_ystd') + ' ' + omobj.format('HH:mm');
      case 0: //前天
      default: //其它
        return omobj.format('YYYY-MM-DD HH:mm');
    }
  }
}
