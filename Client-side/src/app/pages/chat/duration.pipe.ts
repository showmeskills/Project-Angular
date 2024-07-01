import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    const duration = moment.duration(value, 'second');
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return (
      (days > 0 ? this.add0(days) + ':' : '') +
      (hours > 0 ? this.add0(hours) + ':' : '') +
      (minutes > 0 ? this.add0(minutes) + ':' : '00:') +
      this.add0(seconds)
    );
  }

  add0(v: number): string {
    return v > 9 ? String(v) : '0' + v;
  }
}
