import { Pipe, PipeTransform } from '@angular/core';
import { formatBytes } from '../models/tools.model';

@Pipe({
  name: 'bytes',
  standalone: true,
})
export class BytesPipe implements PipeTransform {
  transform(value: unknown, pad = ''): string {
    return formatBytes(value, pad);
  }
}
